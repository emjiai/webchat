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
  timeRange?: '24h' | '7d' | '30d' | '90d'
  onRefresh?: () => void
  onExport?: () => void
}

export default function StatsPanel({ 
  timeRange: initialTimeRange = '7d',
  onRefresh,
  onExport 
}: StatsPanelProps) {
  const [timeRange, setTimeRange] = useState(initialTimeRange)
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<StatsData>({
    totalConversations: 1247,
    totalMessages: 8934,
    uniqueUsers: 423,
    avgResponseTime: 1.3,
    voiceMessages: 2341,
    textMessages: 6593,
    ragQueries: 1876,
    satisfaction: 94.7,
    activeUsers: 87,
    peakHour: '2:00 PM',
    popularModel: 'GPT-4',
    avgSessionDuration: 8.5,
    conversationTrends: [
      { date: 'Mon', count: 145 },
      { date: 'Tue', count: 189 },
      { date: 'Wed', count: 203 },
      { date: 'Thu', count: 178 },
      { date: 'Fri', count: 221 },
      { date: 'Sat', count: 156 },
      { date: 'Sun', count: 155 }
    ],
    modelUsage: [
      { model: 'GPT-4', percentage: 45 },
      { model: 'Claude', percentage: 28 },
      { model: 'Gemini', percentage: 15 },
      { model: 'Grok', percentage: 8 },
      { model: 'DeepSeek', percentage: 4 }
    ],
    responseTimeDistribution: [
      { range: '0-1s', count: 456 },
      { range: '1-2s', count: 312 },
      { range: '2-3s', count: 189 },
      { range: '3-5s', count: 98 },
      { range: '5s+', count: 23 }
    ]
  })

  // Simulate data refresh
  const handleRefresh = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Update with new random data
    setStats(prev => ({
      ...prev,
      totalConversations: prev.totalConversations + Math.floor(Math.random() * 50),
      totalMessages: prev.totalMessages + Math.floor(Math.random() * 200),
      uniqueUsers: prev.uniqueUsers + Math.floor(Math.random() * 10),
      activeUsers: Math.floor(Math.random() * 50) + 50
    }))
    
    setIsLoading(false)
    onRefresh?.()
  }

  // Calculate percentage changes
  const calculateChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change > 0
    }
  }

  const conversationChange = calculateChange(stats.totalConversations, 1100)
  const userChange = calculateChange(stats.uniqueUsers, 380)
  const responseTimeChange = calculateChange(stats.avgResponseTime, 1.5)
  const satisfactionChange = calculateChange(stats.satisfaction, 92.3)

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