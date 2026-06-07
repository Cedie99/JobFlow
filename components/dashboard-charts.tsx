'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

interface DashboardChartsProps {
  applications: Array<{ applied_date: string }>
  pipeline: { stages: Record<string, number>; closed: number }
}

const COLORS = {
  applied: '#3b82f6',
  screening: '#f59e0b',
  interview: '#8b5cf6',
  offer: '#10b981',
}

export default function DashboardCharts({ applications, pipeline }: DashboardChartsProps) {
  // Generate activity data for the last 30 days
  const generateActivityData = () => {
    const data: Array<{ date: string; count: number }> = []
    const today = new Date()
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const count = applications.filter(app => 
        app.applied_date === dateStr
      ).length
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count,
      })
    }
    
    return data
  }

  const activityData = generateActivityData()

  // Generate pipeline distribution data
  const pipelineData = [
    { name: 'Applied', value: pipeline.stages.applied || 0, color: COLORS.applied },
    { name: 'Screening', value: pipeline.stages.screening || 0, color: COLORS.screening },
    { name: 'Interview', value: pipeline.stages.interview || 0, color: COLORS.interview },
    { name: 'Offer', value: pipeline.stages.offer || 0, color: COLORS.offer },
  ].filter(item => item.value > 0)

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Application Activity (30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                className="text-xs"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pipeline Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pipeline Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pipelineData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                {pipelineData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
