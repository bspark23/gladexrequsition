'use client'

import { useMemo } from 'react'
import { useData } from '@/lib/data-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts'
import { FileText, Clock, Calculator, CheckCircle, TrendingUp, Activity, Timer } from 'lucide-react'
import { formatDistanceToNow } from '@/lib/date-utils'
import type { Requisition, ActivityLogEntry } from '@/lib/types'

interface DashboardOverviewProps {
  showExecutiveMetrics?: boolean
}

export function DashboardOverview({ showExecutiveMetrics = false }: DashboardOverviewProps) {
  const { requisitions, activityLog, users } = useData()

  const stats = useMemo(() => {
    const total = requisitions.length
    const pendingProcurement = requisitions.filter(r => r.status === 'Pending Procurement').length
    const pendingAccount = requisitions.filter(r => r.status === 'Pending Account').length
    const approved = requisitions.filter(r => r.status === 'Approved').length
    const totalValue = requisitions.reduce((sum, r) => sum + (r.totalAmount || 0), 0)

    return { total, pendingProcurement, pendingAccount, approved, totalValue }
  }, [requisitions])

  const statusChartData = useMemo(() => [
    { name: 'Pending Procurement', value: stats.pendingProcurement, fill: 'oklch(0.65 0.18 45)' },
    { name: 'Pending Account', value: stats.pendingAccount, fill: 'oklch(0.55 0.15 220)' },
    { name: 'Approved', value: stats.approved, fill: 'oklch(0.6 0.15 150)' },
  ], [stats])

  const timelineData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return {
        date: date.toLocaleDateString('en-NG', { weekday: 'short' }),
        fullDate: date.toISOString().split('T')[0],
        count: 0,
      }
    })

    requisitions.forEach(req => {
      const reqDate = new Date(req.createdAt).toISOString().split('T')[0]
      const dayIndex = last7Days.findIndex(d => d.fullDate === reqDate)
      if (dayIndex !== -1) {
        last7Days[dayIndex].count++
      }
    })

    return last7Days
  }, [requisitions])

  const departmentData = useMemo(() => {
    const deptCounts: Record<string, number> = {}
    requisitions.forEach(req => {
      if (req.requesterDepartment) {
        deptCounts[req.requesterDepartment] = (deptCounts[req.requesterDepartment] || 0) + 1
      }
    })
    return Object.entries(deptCounts)
      .map(([name, value]) => ({ name: name.length > 15 ? name.substring(0, 15) + '...' : name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [requisitions])

  const executiveMetrics = useMemo(() => {
    if (!showExecutiveMetrics) return null

    // Calculate average approval time for fully approved requisitions
    const approvedReqs = requisitions.filter(r => 
      r.status === 'Approved' && 
      r.procurementApprovedAt && 
      r.accountApprovedAt &&
      r.createdAt
    )
    let avgTurnaroundHours = 0
    if (approvedReqs.length > 0) {
      const totalHours = approvedReqs.reduce((sum, r) => {
        const created = new Date(r.createdAt!).getTime()
        const approved = new Date(r.accountApprovedAt!).getTime()
        return sum + (approved - created) / (1000 * 60 * 60)
      }, 0)
      avgTurnaroundHours = totalHours / approvedReqs.length
    }

    // Active users count
    const activeUsers = users.filter(u => u.isActive).length

    return {
      avgTurnaroundHours: Math.round(avgTurnaroundHours),
      activeUsers,
      approvalRate: stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0,
    }
  }, [showExecutiveMetrics, requisitions, users, stats])

  const recentActivity = activityLog.slice(0, 8)

  const chartConfig = {
    count: { label: 'Requisitions', color: 'oklch(0.35 0.12 250)' },
    value: { label: 'Count', color: 'oklch(0.55 0.15 220)' },
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[oklch(0.35_0.12_250)]/10">
                <FileText className="h-5 w-5 text-[oklch(0.35_0.12_250)]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Requisitions</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[oklch(0.65_0.18_45)]/10">
                <Clock className="h-5 w-5 text-[oklch(0.65_0.18_45)]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Procurement</p>
                <p className="text-2xl font-bold">{stats.pendingProcurement}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[oklch(0.55_0.15_220)]/10">
                <Calculator className="h-5 w-5 text-[oklch(0.55_0.15_220)]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Account</p>
                <p className="text-2xl font-bold">{stats.pendingAccount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Executive Metrics (MD only) */}
      {showExecutiveMetrics && executiveMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-[oklch(0.65_0.18_45)]/30 bg-gradient-to-br from-[oklch(0.65_0.18_45)]/5 to-transparent">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[oklch(0.65_0.18_45)]/20">
                  <Timer className="h-5 w-5 text-[oklch(0.65_0.18_45)]" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Turnaround Time</p>
                  <p className="text-2xl font-bold">{executiveMetrics.avgTurnaroundHours}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[oklch(0.55_0.15_220)]/30 bg-gradient-to-br from-[oklch(0.55_0.15_220)]/5 to-transparent">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[oklch(0.55_0.15_220)]/20">
                  <TrendingUp className="h-5 w-5 text-[oklch(0.55_0.15_220)]" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Approval Rate</p>
                  <p className="text-2xl font-bold">{executiveMetrics.approvalRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <Activity className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">{executiveMetrics.activeUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requisitions Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Requisitions Over Time</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <LineChart data={timelineData}>
                <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="oklch(0.35 0.12 250)"
                  strokeWidth={2}
                  dot={{ fill: 'oklch(0.35 0.12 250)', r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status Breakdown</CardTitle>
            <CardDescription>Current requisition statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {statusChartData.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Activity & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Department Activity</CardTitle>
            <CardDescription>Top 5 departments by requisitions</CardDescription>
          </CardHeader>
          <CardContent>
            {departmentData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[200px] w-full">
                <BarChart data={departmentData} layout="vertical">
                  <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} fontSize={11} width={100} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="oklch(0.55 0.15 220)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No department data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <CardDescription>Latest system activities</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map(activity => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-[oklch(0.65_0.18_45)] mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{activity.userName}</span>{' '}
                        <span className="text-muted-foreground">{activity.action.toLowerCase()}</span>
                        {activity.requisitionNumber && (
                          <span className="font-medium"> {activity.requisitionNumber}</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.timestamp ? formatDistanceToNow(activity.timestamp) : 'Unknown time'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No recent activity
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Total Value Card */}
      <Card className="bg-gradient-to-r from-[oklch(0.35_0.12_250)] to-[oklch(0.25_0.1_250)]">
        <CardContent className="p-6">
          <div className="text-white">
            <p className="text-sm opacity-80">Total Requisition Value</p>
            <p className="text-3xl font-bold mt-1">
              {stats.totalValue.toLocaleString('en-NG', {
                style: 'currency',
                currency: 'NGN',
              })}
            </p>
            <p className="text-sm opacity-80 mt-2">Across {stats.total} requisitions</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
