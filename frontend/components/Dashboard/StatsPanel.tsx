'use client'

import { useState, useEffect } from 'react'
import { 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Clock, 
  Mic,
  Bot,
  Database,
  Activity,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Download,
  Calendar
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import styles from './Dashboard.module.css'

interface StatsData {
  totalConversations: number
  totalMessages: number
  uniqueUsers: number
  avgResponseTime: number
  voiceMessages: number
  textMessages: number
  ragQueries: number
  satisfaction: number
  activeUsers: number
  peakHour: string
  popularModel: string
  avgSessionDuration: number
  conversationTrends: Array<{ date: string; count: number }>
  modelUsage: Array<{ model: string; percentage: number }>
  responseTimeDistribution: Array<{ range: string; count: number }>
}

interface StatsPanelProps {
  chatbotId?: string
  timeRange?: '24h' | '7d' | '30d' | '90d'
  onRefresh?: () => void
  onExport?: () => void
}

export default function StatsPanel({ 
  chatbotId,
  timeRange: initialTimeRange = '7d',
  onRefresh,
  onExport 
}: StatsPanelProps) {
  const [timeRange, setTimeRange] = useState(initialTimeRange)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<StatsData | null>(null)

  // Fetch chatbot-specific analytics
  const fetchAnalytics = async () => {
    if (!chatbotId) return

    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/analytics/${chatbotId}?timeRange=${timeRange}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.status}`)
      }
      
      const analyticsData = await response.json()
      setStats(analyticsData)
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setIsLoading(false)
    }
  }

  // Load analytics when component mounts or dependencies change
  useEffect(() => {
    fetchAnalytics()
  }, [chatbotId, timeRange])

  // Refresh data
  const handleRefresh = async () => {
    await fetchAnalytics()
    onRefresh?.()
  }

  // Calculate percentage changes (mock previous values for demo)
  const calculateChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change > 0
    }
  }

  // Mock previous values for percentage change calculation
  const conversationChange = stats ? calculateChange(stats.totalConversations, Math.floor(stats.totalConversations * 0.85)) : { value: '0', isPositive: true }
  const userChange = stats ? calculateChange(stats.uniqueUsers, Math.floor(stats.uniqueUsers * 0.9)) : { value: '0', isPositive: true }
  const responseTimeChange = stats ? calculateChange(stats.avgResponseTime, stats.avgResponseTime * 1.1) : { value: '0', isPositive: false }
  const satisfactionChange = stats ? calculateChange(stats.satisfaction, stats.satisfaction * 0.95) : { value: '0', isPositive: true }

  // Show loading state
  if (isLoading && !stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading analytics...</span>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading analytics: {error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show empty state
  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">No analytics data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Monitor your chatbot performance</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as '24h' | '7d' | '30d' | '90d')}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={onExport}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#667eea' }}>
            <MessageSquare className="w-6 h-6" />
          </div>
          <div className={styles.statValue}>
            {stats.totalConversations.toLocaleString()}
          </div>
          <div className={styles.statLabel}>Total Conversations</div>
          <div className={`${styles.statChange} ${conversationChange.isPositive ? styles.positive : styles.negative}`}>
            {conversationChange.isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {conversationChange.value}%
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.success}`}>
          <div className={styles.statIcon} style={{ color: '#48bb78' }}>
            <Users className="w-6 h-6" />
          </div>
          <div className={styles.statValue}>
            {stats.uniqueUsers.toLocaleString()}
          </div>
          <div className={styles.statLabel}>Unique Users</div>
          <div className={`${styles.statChange} ${userChange.isPositive ? styles.positive : styles.negative}`}>
            {userChange.isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {userChange.value}%
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.warning}`}>
          <div className={styles.statIcon} style={{ color: '#ed8936' }}>
            <Clock className="w-6 h-6" />
          </div>
          <div className={styles.statValue}>
            {stats.avgResponseTime}s
          </div>
          <div className={styles.statLabel}>Avg Response Time</div>
          <div className={`${styles.statChange} ${!responseTimeChange.isPositive ? styles.positive : styles.negative}`}>
            {!responseTimeChange.isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {responseTimeChange.value}%
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#9f7aea' }}>
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className={styles.statValue}>
            {stats.satisfaction}%
          </div>
          <div className={styles.statLabel}>Satisfaction Rate</div>
          <div className={`${styles.statChange} ${satisfactionChange.isPositive ? styles.positive : styles.negative}`}>
            {satisfactionChange.isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {satisfactionChange.value}%
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Message Distribution
            </CardTitle>
            <CardDescription>Breakdown of message types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Text Messages</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.textMessages.toLocaleString()} ({((stats.textMessages / stats.totalMessages) * 100).toFixed(1)}%)
                  </span>
                </div>
                <Progress value={(stats.textMessages / stats.totalMessages) * 100} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Voice Messages</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.voiceMessages.toLocaleString()} ({((stats.voiceMessages / stats.totalMessages) * 100).toFixed(1)}%)
                  </span>
                </div>
                <Progress value={(stats.voiceMessages / stats.totalMessages) * 100} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">RAG Queries</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.ragQueries.toLocaleString()} ({((stats.ragQueries / stats.totalMessages) * 100).toFixed(1)}%)
                  </span>
                </div>
                <Progress value={(stats.ragQueries / stats.totalMessages) * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Model Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Model Usage
            </CardTitle>
            <CardDescription>AI model distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.modelUsage.map(model => (
                <div key={model.model}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">{model.model}</span>
                    <span className="text-sm text-muted-foreground">{model.percentage}%</span>
                  </div>
                  <Progress value={model.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Weekly Activity
            </CardTitle>
            <CardDescription>Conversations over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-32 gap-2">
              {stats.conversationTrends.map((day, index) => {
                const height = (day.count / 250) * 100
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-t relative" style={{ height: '100px' }}>
                      <div 
                        className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t transition-all duration-500"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{day.date}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Quick Stats
            </CardTitle>
            <CardDescription>Real-time metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Active Users Now</span>
                <span className="text-2xl font-bold text-green-600">{stats.activeUsers}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Peak Hour Today</span>
                <span className="text-lg font-semibold">{stats.peakHour}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Most Used Model</span>
                <span className="text-lg font-semibold">{stats.popularModel}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Avg Session Duration</span>
                <span className="text-lg font-semibold">{stats.avgSessionDuration} min</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Response Time Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Response Time Distribution
          </CardTitle>
          <CardDescription>How quickly the bot responds to messages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {stats.responseTimeDistribution.map(item => (
              <div key={item.range} className="text-center">
                <div className="text-2xl font-bold text-blue-600">{item.count}</div>
                <div className="text-sm text-muted-foreground">{item.range}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}