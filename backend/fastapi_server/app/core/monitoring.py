"""Monitoring and observability utilities."""

import time
import psutil
import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from collections import defaultdict, deque
from contextlib import asynccontextmanager

from app.utils.logger import get_logger
from app.core.caching import performance_monitor

logger = get_logger(__name__)


class SystemMetrics:
    """Collect system performance metrics."""
    
    def __init__(self):
        self.process = psutil.Process()
        self.metrics_history = defaultdict(lambda: deque(maxlen=1440))  # 24 hours of minute data
        self.last_collection = time.time()
    
    def collect_metrics(self) -> Dict[str, Any]:
        """Collect current system metrics."""
        current_time = time.time()
        
        try:
            # CPU and Memory
            cpu_percent = self.process.cpu_percent()
            memory_info = self.process.memory_info()
            memory_percent = self.process.memory_percent()
            
            # System-wide metrics
            system_cpu = psutil.cpu_percent()
            system_memory = psutil.virtual_memory()
            
            # Network (basic)
            net_io = psutil.net_io_counters()
            
            metrics = {
                'timestamp': current_time,
                'process': {
                    'cpu_percent': cpu_percent,
                    'memory_rss_mb': memory_info.rss / (1024 * 1024),
                    'memory_vms_mb': memory_info.vms / (1024 * 1024),
                    'memory_percent': memory_percent,
                    'num_threads': self.process.num_threads(),
                    'num_fds': self.process.num_fds() if hasattr(self.process, 'num_fds') else 0,
                },
                'system': {
                    'cpu_percent': system_cpu,
                    'memory_total_gb': system_memory.total / (1024 ** 3),
                    'memory_available_gb': system_memory.available / (1024 ** 3),
                    'memory_used_percent': system_memory.percent,
                },
                'network': {
                    'bytes_sent': net_io.bytes_sent,
                    'bytes_recv': net_io.bytes_recv,
                    'packets_sent': net_io.packets_sent,
                    'packets_recv': net_io.packets_recv,
                }
            }
            
            # Store in history
            for category, data in metrics.items():
                if isinstance(data, dict):
                    for key, value in data.items():
                        metric_key = f"{category}.{key}"
                        self.metrics_history[metric_key].append((current_time, value))
            
            return metrics
            
        except Exception as e:
            logger.error(f"Failed to collect system metrics: {e}")
            return {}
    
    def get_metrics_summary(self, duration_minutes: int = 60) -> Dict[str, Any]:
        """Get metrics summary for the specified duration."""
        cutoff_time = time.time() - (duration_minutes * 60)
        summary = {}
        
        for metric_name, history in self.metrics_history.items():
            recent_values = [value for timestamp, value in history if timestamp > cutoff_time]
            
            if recent_values:
                summary[metric_name] = {
                    'current': recent_values[-1] if recent_values else 0,
                    'avg': sum(recent_values) / len(recent_values),
                    'min': min(recent_values),
                    'max': max(recent_values),
                    'count': len(recent_values)
                }
        
        return summary


class RequestTracker:
    """Track API request metrics."""
    
    def __init__(self):
        self.requests = deque(maxlen=10000)  # Keep last 10k requests
        self.endpoint_stats = defaultdict(lambda: {
            'count': 0,
            'total_time': 0,
            'errors': 0,
            'last_request': None
        })
    
    def record_request(
        self,
        endpoint: str,
        method: str,
        status_code: int,
        duration_ms: float,
        user_agent: Optional[str] = None,
        authenticated: bool = False
    ):
        """Record a request."""
        timestamp = time.time()
        
        request_data = {
            'timestamp': timestamp,
            'endpoint': endpoint,
            'method': method,
            'status_code': status_code,
            'duration_ms': duration_ms,
            'user_agent': user_agent,
            'authenticated': authenticated
        }
        
        self.requests.append(request_data)
        
        # Update endpoint stats
        key = f"{method} {endpoint}"
        stats = self.endpoint_stats[key]
        stats['count'] += 1
        stats['total_time'] += duration_ms
        stats['last_request'] = timestamp
        
        if status_code >= 400:
            stats['errors'] += 1
    
    def get_request_stats(self, duration_minutes: int = 60) -> Dict[str, Any]:
        """Get request statistics for the specified duration."""
        cutoff_time = time.time() - (duration_minutes * 60)
        recent_requests = [req for req in self.requests if req['timestamp'] > cutoff_time]
        
        if not recent_requests:
            return {'total_requests': 0}
        
        # General stats
        total_requests = len(recent_requests)
        error_requests = len([req for req in recent_requests if req['status_code'] >= 400])
        avg_duration = sum(req['duration_ms'] for req in recent_requests) / total_requests
        
        # Status code distribution
        status_codes = defaultdict(int)
        for req in recent_requests:
            status_codes[req['status_code']] += 1
        
        # Top endpoints
        endpoint_counts = defaultdict(int)
        for req in recent_requests:
            endpoint_counts[f"{req['method']} {req['endpoint']}"] += 1
        
        top_endpoints = sorted(
            endpoint_counts.items(),
            key=lambda x: x[1],
            reverse=True
        )[:10]
        
        # Authentication stats
        auth_stats = {
            'authenticated': len([req for req in recent_requests if req.get('authenticated', False)]),
            'unauthenticated': len([req for req in recent_requests if not req.get('authenticated', False)])
        }
        
        return {
            'total_requests': total_requests,
            'error_requests': error_requests,
            'error_rate': f"{(error_requests / total_requests * 100):.2f}%",
            'avg_duration_ms': f"{avg_duration:.2f}",
            'status_codes': dict(status_codes),
            'top_endpoints': top_endpoints,
            'authentication': auth_stats
        }


class HealthChecker:
    """Health check utilities."""
    
    def __init__(self):
        self.checks = {}
    
    async def check_rag_service(self) -> Dict[str, Any]:
        """Check RAG service health."""
        try:
            from app.core.rag_wrapper import RAGWrapper
            rag = RAGWrapper()
            
            return {
                'status': 'healthy' if rag.is_available() else 'unhealthy',
                'available': rag.is_available(),
                'details': rag.get_status()
            }
        except Exception as e:
            return {
                'status': 'unhealthy',
                'available': False,
                'error': str(e)
            }
    
    async def check_cache_service(self) -> Dict[str, Any]:
        """Check cache service health."""
        try:
            from app.core.caching import query_cache
            stats = query_cache.memory_cache.get_stats()
            
            return {
                'status': 'healthy',
                'available': True,
                'stats': stats
            }
        except Exception as e:
            return {
                'status': 'unhealthy',
                'available': False,
                'error': str(e)
            }
    
    async def check_performance(self) -> Dict[str, Any]:
        """Check performance metrics."""
        try:
            rag_stats = performance_monitor.get_stats('rag_query_time')
            
            return {
                'status': 'healthy',
                'rag_performance': rag_stats
            }
        except Exception as e:
            return {
                'status': 'unhealthy',
                'error': str(e)
            }
    
    async def run_all_checks(self) -> Dict[str, Any]:
        """Run all health checks."""
        checks = {
            'rag_service': await self.check_rag_service(),
            'cache_service': await self.check_cache_service(),
            'performance': await self.check_performance(),
        }
        
        # Overall status
        all_healthy = all(check.get('status') == 'healthy' for check in checks.values())
        
        return {
            'overall_status': 'healthy' if all_healthy else 'unhealthy',
            'timestamp': datetime.utcnow().isoformat(),
            'checks': checks
        }


class AlertManager:
    """Simple alert management."""
    
    def __init__(self):
        self.thresholds = {
            'error_rate': 5.0,  # 5% error rate
            'avg_response_time': 2000,  # 2 seconds
            'memory_usage': 80,  # 80% memory usage
            'cpu_usage': 80,  # 80% CPU usage
        }
        self.alerts = deque(maxlen=1000)
    
    def check_thresholds(self, metrics: Dict[str, Any]):
        """Check metrics against thresholds and generate alerts."""
        alerts = []
        
        # Check error rate
        if 'error_rate' in metrics:
            error_rate = float(metrics['error_rate'].rstrip('%'))
            if error_rate > self.thresholds['error_rate']:
                alerts.append({
                    'type': 'error_rate',
                    'severity': 'warning' if error_rate < 10 else 'critical',
                    'message': f"High error rate: {error_rate}%",
                    'value': error_rate,
                    'threshold': self.thresholds['error_rate']
                })
        
        # Check response time
        if 'avg_duration_ms' in metrics:
            avg_time = float(metrics['avg_duration_ms'])
            if avg_time > self.thresholds['avg_response_time']:
                alerts.append({
                    'type': 'response_time',
                    'severity': 'warning' if avg_time < 5000 else 'critical',
                    'message': f"High response time: {avg_time:.2f}ms",
                    'value': avg_time,
                    'threshold': self.thresholds['avg_response_time']
                })
        
        # Store alerts
        for alert in alerts:
            alert['timestamp'] = datetime.utcnow().isoformat()
            self.alerts.append(alert)
            logger.warning(f"Alert: {alert['message']}")
        
        return alerts


@asynccontextmanager
async def request_monitoring():
    """Context manager for monitoring requests."""
    start_time = time.time()
    
    try:
        yield
    finally:
        duration = (time.time() - start_time) * 1000
        # This would typically be called from middleware
        pass


# Global instances
system_metrics = SystemMetrics()
request_tracker = RequestTracker()
health_checker = HealthChecker()
alert_manager = AlertManager()


# Background task to collect metrics
async def metrics_collector():
    """Background task to collect system metrics."""
    while True:
        try:
            system_metrics.collect_metrics()
            await asyncio.sleep(60)  # Collect every minute
        except Exception as e:
            logger.error(f"Metrics collection failed: {e}")
            await asyncio.sleep(60)