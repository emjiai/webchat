# Deployment Guide

## Overview

This guide covers deploying the Chatbot RAG API from development to production environments, including Docker containerization, environment configuration, and monitoring setup.

## Prerequisites

- Docker and Docker Compose installed
- Google Cloud Platform account with appropriate permissions
- Access to a configured RAG corpus in Vertex AI
- Domain name and SSL certificates (for production)

## Environment Setup

### 1. Google Cloud Configuration

**Enable Required APIs**:
```bash
gcloud services enable aiplatform.googleapis.com
gcloud services enable compute.googleapis.com
```

**Set up Authentication**:

Option A - Service Account (Recommended for production):
```bash
# Create service account
gcloud iam service-accounts create chatbot-rag-api \
    --description="Service account for Chatbot RAG API" \
    --display-name="Chatbot RAG API"

# Grant necessary permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:chatbot-rag-api@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/aiplatform.user"

# Create and download key
gcloud iam service-accounts keys create credentials.json \
    --iam-account=chatbot-rag-api@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

Option B - Application Default Credentials (Development):
```bash
gcloud auth application-default login
```

### 2. RAG Corpus Setup

If you haven't set up a RAG corpus yet:

```bash
cd backend/gemini_rag
cp .env.example .env
# Edit .env with your project details

# Set up corpus and upload documents
uv run python rag/shared_libraries/prepare_corpus_and_data.py
```

## Development Deployment

### Local Development

1. **Set up environment**:
   ```bash
   cd backend/fastapi_server
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Install dependencies**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Run the server**:
   ```bash
   python start_server.py
   # Or directly with uvicorn:
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

### Docker Development

1. **Build and run with Docker Compose**:
   ```bash
   cd backend/fastapi_server
   docker-compose up --build
   ```

2. **Verify deployment**:
   ```bash
   # Health check
   curl http://localhost:8000/api/v1/health/

   # API documentation
   open http://localhost:8000/docs
   ```

## Production Deployment

### 1. Environment Configuration

Create production environment file:

```bash
# .env.production
GOOGLE_CLOUD_PROJECT=your-production-project
GOOGLE_CLOUD_LOCATION=us-central1
RAG_CORPUS=projects/123/locations/us-central1/ragCorpora/456

API_DEBUG=false
LOG_LEVEL=INFO

# Security
CHATBOT_API_KEY_PROD=your-secure-api-key-here
CORS_ORIGINS=["https://yourdomain.com","https://app.yourdomain.com"]

# Performance
WORKERS=4
WORKER_CONNECTIONS=1000
```

### 2. Docker Production Build

**Multi-stage production Dockerfile**:
```dockerfile
# Already included in the repository
# Optimized for production with:
# - Non-root user
# - Multi-stage build
# - Security headers
# - Health checks
# - Resource limits
```

**Production Docker Compose**:
```bash
# Use production profile
docker-compose --profile production up -d
```

### 3. Cloud Deployment Options

#### Option A: Google Cloud Run

1. **Build and push image**:
   ```bash
   # Enable Container Registry
   gcloud services enable containerregistry.googleapis.com

   # Build and tag
   docker build -t gcr.io/YOUR_PROJECT_ID/chatbot-rag-api:latest .

   # Push to registry
   docker push gcr.io/YOUR_PROJECT_ID/chatbot-rag-api:latest
   ```

2. **Deploy to Cloud Run**:
   ```bash
   gcloud run deploy chatbot-rag-api \
     --image gcr.io/YOUR_PROJECT_ID/chatbot-rag-api:latest \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --port 8000 \
     --memory 2Gi \
     --cpu 2 \
     --min-instances 0 \
     --max-instances 10 \
     --set-env-vars GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID \
     --set-env-vars GOOGLE_CLOUD_LOCATION=us-central1 \
     --set-env-vars RAG_CORPUS=YOUR_RAG_CORPUS \
     --set-env-vars LOG_LEVEL=INFO \
     --service-account chatbot-rag-api@YOUR_PROJECT_ID.iam.gserviceaccount.com
   ```

#### Option B: Google Kubernetes Engine (GKE)

1. **Create GKE cluster**:
   ```bash
   gcloud container clusters create chatbot-rag-cluster \
     --num-nodes 3 \
     --machine-type e2-standard-2 \
     --enable-autoscaling \
     --min-nodes 1 \
     --max-nodes 5 \
     --zone us-central1-a
   ```

2. **Deploy with Kubernetes**:
   ```yaml
   # k8s/deployment.yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: chatbot-rag-api
   spec:
     replicas: 3
     selector:
       matchLabels:
         app: chatbot-rag-api
     template:
       metadata:
         labels:
           app: chatbot-rag-api
       spec:
         containers:
         - name: api
           image: gcr.io/YOUR_PROJECT_ID/chatbot-rag-api:latest
           ports:
           - containerPort: 8000
           env:
           - name: GOOGLE_CLOUD_PROJECT
             value: "YOUR_PROJECT_ID"
           - name: RAG_CORPUS
             value: "YOUR_RAG_CORPUS"
           resources:
             requests:
               memory: "1Gi"
               cpu: "500m"
             limits:
               memory: "2Gi"
               cpu: "1"
           livenessProbe:
             httpGet:
               path: /api/v1/health/
               port: 8000
             initialDelaySeconds: 30
             periodSeconds: 10
           readinessProbe:
             httpGet:
               path: /api/v1/health/rag
               port: 8000
             initialDelaySeconds: 5
             periodSeconds: 5
   ```

#### Option C: Traditional VPS/Server

1. **Server setup**:
   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh

   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Deploy application**:
   ```bash
   # Clone repository
   git clone your-repo-url
   cd chatbot-rag-api/backend/fastapi_server

   # Set up environment
   cp .env.example .env.production
   # Edit .env.production

   # Deploy
   docker-compose -f docker-compose.yml --env-file .env.production up -d
   ```

### 4. Reverse Proxy Setup (Nginx)

**Nginx configuration** (`nginx/nginx.conf`):
```nginx
upstream chatbot_api {
    server chatbot-rag-api:8000;
}

server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    location /api/v1/ {
        proxy_pass http://chatbot_api/api/v1/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Streaming support
        proxy_buffering off;
        proxy_cache off;
        
        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 60s;
    }

    location /health {
        proxy_pass http://chatbot_api/api/v1/health/;
        access_log off;
    }
}
```

## Monitoring and Observability

### 1. Health Checks

Configure health checks for your deployment platform:

**Docker Compose**:
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/api/v1/health/"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

**Kubernetes**:
```yaml
livenessProbe:
  httpGet:
    path: /api/v1/health/
    port: 8000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /api/v1/health/rag
    port: 8000
  initialDelaySeconds: 5
  periodSeconds: 5
```

### 2. Logging

**Structured logging configuration**:
```bash
# View logs
docker-compose logs -f chatbot-rag-api

# Follow specific log levels
docker-compose logs -f chatbot-rag-api | grep ERROR

# Export logs to external system
# Configure log driver in docker-compose.yml
```

**Log aggregation with ELK Stack**:
```yaml
# docker-compose.monitoring.yml
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.14.0
    environment:
      - discovery.type=single-node
    
  logstash:
    image: docker.elastic.co/logstash/logstash:7.14.0
    
  kibana:
    image: docker.elastic.co/kibana/kibana:7.14.0
    ports:
      - "5601:5601"
```

### 3. Metrics and Alerting

**Prometheus configuration**:
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'chatbot-api'
    static_configs:
      - targets: ['chatbot-rag-api:8000']
    metrics_path: '/api/v1/metrics/prometheus'
    scrape_interval: 30s
```

**Grafana dashboard setup**:
```bash
# Add to docker-compose.monitoring.yml
grafana:
  image: grafana/grafana:8.5.0
  ports:
    - "3000:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=your_admin_password
  volumes:
    - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
```

## Performance Optimization

### 1. Scaling Configuration

**Horizontal scaling**:
```bash
# Docker Compose
docker-compose up --scale chatbot-rag-api=3

# Kubernetes
kubectl scale deployment chatbot-rag-api --replicas=5
```

**Auto-scaling (Kubernetes)**:
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: chatbot-rag-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: chatbot-rag-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### 2. Caching Strategy

**Redis for distributed caching**:
```yaml
# Add to docker-compose.yml
redis:
  image: redis:7-alpine
  command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
  ports:
    - "6379:6379"
```

**CDN for static content**:
```nginx
# Cache API responses
location /api/v1/health {
    proxy_pass http://chatbot_api;
    proxy_cache_valid 200 1m;
    proxy_cache health_cache;
}
```

## Security Hardening

### 1. Network Security

**Firewall rules**:
```bash
# Only allow HTTP/HTTPS and SSH
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

**Docker network isolation**:
```yaml
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true
```

### 2. Container Security

**Security scanning**:
```bash
# Scan image for vulnerabilities
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  -v $(pwd):/tmp aquasec/trivy image chatbot-rag-api:latest
```

**Non-root user** (already implemented in Dockerfile):
```dockerfile
RUN groupadd -r appuser && useradd -r -g appuser appuser
USER appuser
```

### 3. Secrets Management

**Using Google Secret Manager**:
```bash
# Store API keys
gcloud secrets create chatbot-api-key --data-file=api-key.txt

# Grant access to service account
gcloud secrets add-iam-policy-binding chatbot-api-key \
    --member="serviceAccount:chatbot-rag-api@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

## Backup and Disaster Recovery

### 1. Configuration Backup

```bash
# Backup environment files
tar -czf config-backup-$(date +%Y%m%d).tar.gz .env* docker-compose*.yml

# Backup to cloud storage
gsutil cp config-backup-*.tar.gz gs://your-backup-bucket/
```

### 2. Database Backup

```bash
# If using persistent storage
docker run --rm -v chatbot_data:/data -v $(pwd):/backup alpine \
  tar czf /backup/data-backup-$(date +%Y%m%d).tar.gz -C /data .
```

### 3. Disaster Recovery Plan

1. **Infrastructure as Code**: Use Terraform or similar tools
2. **Automated deployment**: CI/CD pipeline for quick recovery
3. **Multi-region deployment**: Deploy to multiple regions for high availability
4. **Backup verification**: Regular testing of backup restoration

## Troubleshooting

### Common Issues

**1. RAG Service Not Available**:
```bash
# Check corpus configuration
curl -X GET http://localhost:8000/api/v1/health/rag

# Verify Google Cloud authentication
docker exec chatbot-rag-api gcloud auth list
```

**2. High Memory Usage**:
```bash
# Monitor container resources
docker stats chatbot-rag-api

# Check cache usage
curl http://localhost:8000/api/v1/metrics/cache
```

**3. Slow Response Times**:
```bash
# Check performance metrics
curl http://localhost:8000/api/v1/metrics/performance

# Monitor system resources
curl http://localhost:8000/api/v1/metrics/system
```

### Debug Mode

```bash
# Enable debug logging
docker-compose exec chatbot-rag-api \
  curl -X POST http://localhost:8000/api/v1/debug/loglevel \
  -H "Content-Type: application/json" \
  -d '{"level": "DEBUG"}'
```

## Maintenance

### 1. Updates

```bash
# Update application
git pull
docker-compose build --no-cache
docker-compose up -d

# Update base images
docker-compose pull
docker-compose up -d
```

### 2. Cleanup

```bash
# Remove unused images
docker image prune -f

# Clean up old logs
find logs/ -name "*.log" -mtime +30 -delete
```

### 3. Monitoring

**Set up automated monitoring**:
```bash
# Cron job for health checks
echo "*/5 * * * * curl -f http://localhost:8000/api/v1/health/ || echo 'API Down' | mail admin@yourdomain.com" | crontab -
```

## Support and Maintenance Contacts

- **Technical Lead**: [Your contact information]
- **DevOps Team**: [Team contact information]
- **On-call Support**: [Emergency contact information]

For urgent issues, check the health endpoints first, then review the application logs before escalating.