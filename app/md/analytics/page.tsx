'use client'

import { useMemo } from 'react'
import { useData } from '@/lib/data-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, FileText, Users, Activity } from 'lucide-react'

export default function AnalyticsPage() {
  const { requisitions, users, activityLog } = useData()

  const stats = useMemo(() => {
    const total = requisitions.length
    const totalValue = requisitions.reduce((sum, r) => sum + (r.totalAmount || 0), 0)
    const approved = requisitions.filter(r => r.status === 'Approved').length
    const avgValue = total > 0 ? totalValue / total : 0

    return { total, totalValue, approved, avgValue }
  }, [requisitions])

  // Monthly trend data
  const monthlyData = useMemo(() => {
    const months: Record<string, { month: string; count: number; value: number }> = {}
    const now = new Date()
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = date.toLocaleDateString('en-NG', { month: 'short', year: '2-digit' })
      months[key] = { month: key, count: 0, value: 0 }
    }

    requisitions.forEach(req => {
      if (req.createdAt) {
        const date = new Date(req.createdAt)
        const key = date.toLocaleDateString('en-NG', { month: 'short', year: '2-digit' })
        if (months[key]) {
          months[key].count++
          months[key].value += (req.totalAmount || 0)
        }
      }
    })

    return Object.values(months)
  }, [requisitions])

  // Department breakdown
  const departmentData = useMemo(() => {
    const deptStats: Record<string, { name: string; count: number; value: number }> = {}
    
    requisitions.forEach(req => {
      if (req.requesterDepartment && !deptStats[req.requesterDepartment]) {
        deptStats[req.requesterDepartment] = {
          name: req.requesterDepartment.length > 12 
            ? req.requesterDepartment.substring(0, 12) + '...' 
            : req.requesterDepartment,
          count: 0,
          value: 0,
        }
      }
      if (req.requesterDepartment) {
        deptStats[req.requesterDepartment].count++
        deptStats[req.requesterDepartment].value += (req.totalAmount || 0)
      }
    })

    return Object.values(deptStats)
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
  }, [requisitions])

  // Status distribution
  const statusData = useMemo(() => [
    { name: 'Pending Procurement', value: requisitions.filter(r => r.status === 'Pending Procurement').length, fill: 'oklch(0.65 0.18 45)' },
    { name: 'Pending Account', value: requisitions.filter(r => r.status === 'Pending Account').length, fill: 'oklch(0.55 0.15 220)' },
    { name: 'Approved', value: requisitions.filter(r => r.status === 'Approved').length, fill: 'oklch(0.6 0.15 150)' },
  ], [requisitions])

  // Approval metrics
  const approvalMetrics = useMemo(() => {
    const approvedReqs = requisitions.filter(r => r.status === 'Approved' && r.procurementApprovedAt && r.accountApprovedAt)
    
    let avgProcurementTime = 0
    let avgAccountTime = 0
    let avgTotalTime = 0

    if (approvedReqs.length > 0) {
      const times = approvedReqs.map(r => {
        const created = new Date(r.createdAt).getTime()
        const procApproved = new Date(r.procurementApprovedAt!).getTime()
        const accApproved = new Date(r.accountApprovedAt!).getTime()
        return {
          procurement: (procApproved - created) / (1000 * 60 * 60),
          account: (accApproved - procApproved) / (1000 * 60 * 60),
          total: (accApproved - created) / (1000 * 60 * 60),
        }
      })

      avgProcurementTime = times.reduce((sum, t) => sum + t.procurement, 0) / times.length
      avgAccountTime = times.reduce((sum, t) => sum + t.account, 0) / times.length
      avgTotalTime = times.reduce((sum, t) => sum + t.total, 0) / times.length
    }

    return {
      avgProcurementTime: Math.round(avgProcurementTime),
      avgAccountTime: Math.round(avgAccountTime),
      avgTotalTime: Math.round(avgTotalTime),
      approvalRate: stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0,
    }
  }, [requisitions, stats])

  // Daily activity
  const dailyActivity = useMemo(() => {
    const days: Record<string, number> = {}
    const now = new Date()
    
    for (let i = 13; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const key = date.toLocaleDateString('en-NG', { day: '2-digit', month: 'short' })
      days[key] = 0
    }

    activityLog.forEach(log => {
      const date = new Date(log.timestamp)
      const key = date.toLocaleDateString('en-NG', { day: '2-digit', month: 'short' })
      if (days[key] !== undefined) {
        days[key]++
      }
    })

    return Object.entries(days).map(([day, count]) => ({ day, count }))
  }, [activityLog])

  const chartConfig = {
    count: { label: 'Count', color: 'oklch(0.35 0.12 250)' },
    value: { label: 'Value', color: 'oklch(0.55 0.15 220)' },
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">
          Comprehensive insights into requisition data and trends
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-xl font-bold">
                  {stats.totalValue.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <DollarSign className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Requisitions</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
              <div className="p-2 rounded-lg bg-[oklch(0.35_0.12_250)]/10">
                <FileText className="h-5 w-5 text-[oklch(0.35_0.12_250)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approval Rate</p>
                <p className="text-xl font-bold">{approvalMetrics.approvalRate}%</p>
              </div>
              <div className="p-2 rounded-lg bg-[oklch(0.65_0.18_45)]/10">
                <TrendingUp className="h-5 w-5 text-[oklch(0.65_0.18_45)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-xl font-bold">{users.filter(u => u.isActive).length}</p>
              </div>
              <div className="p-2 rounded-lg bg-[oklch(0.55_0.15_220)]/10">
                <Users className="h-5 w-5 text-[oklch(0.55_0.15_220)]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approval Times */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-[oklch(0.65_0.18_45)]/30">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Avg. Procurement Time</p>
            <p className="text-2xl font-bold text-[oklch(0.65_0.18_45)]">
              {approvalMetrics.avgProcurementTime}h
            </p>
            <p className="text-xs text-muted-foreground mt-1">From creation to procurement approval</p>
          </CardContent>
        </Card>
        <Card className="border-[oklch(0.55_0.15_220)]/30">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Avg. Account Time</p>
            <p className="text-2xl font-bold text-[oklch(0.55_0.15_220)]">
              {approvalMetrics.avgAccountTime}h
            </p>
            <p className="text-xs text-muted-foreground mt-1">From procurement to account approval</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/30">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Avg. Total Turnaround</p>
            <p className="text-2xl font-bold text-emerald-500">
              {approvalMetrics.avgTotalTime}h
            </p>
            <p className="text-xs text-muted-foreground mt-1">From creation to full approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Requisition Trend</CardTitle>
            <CardDescription>Number of requisitions over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <AreaChart data={monthlyData}>
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="oklch(0.35 0.12 250)"
                  fill="oklch(0.35 0.12 250)"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status Distribution</CardTitle>
            <CardDescription>Current requisition status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${value}`}
                  labelLine={false}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {statusData.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Department Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Department Performance</CardTitle>
            <CardDescription>Requisition value by department</CardDescription>
          </CardHeader>
          <CardContent>
            {departmentData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <BarChart data={departmentData} layout="vertical">
                  <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} fontSize={10} width={90} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="oklch(0.55 0.15 220)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No department data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">System Activity</CardTitle>
            <CardDescription>Daily activity over the last 2 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <LineChart data={dailyActivity}>
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={10} interval={1} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="oklch(0.65 0.18 45)"
                  strokeWidth={2}
                  dot={{ fill: 'oklch(0.65 0.18 45)', r: 3 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Value Summary */}
      <Card className="bg-gradient-to-r from-[oklch(0.35_0.12_250)] to-[oklch(0.25_0.1_250)]">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
            <div>
              <p className="text-sm opacity-80">Total Requisition Value</p>
              <p className="text-2xl font-bold mt-1">
                {stats.totalValue.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 })}
              </p>
            </div>
            <div>
              <p className="text-sm opacity-80">Average Requisition Value</p>
              <p className="text-2xl font-bold mt-1">
                {stats.avgValue.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 })}
              </p>
            </div>
            <div>
              <p className="text-sm opacity-80">Approved Value</p>
              <p className="text-2xl font-bold mt-1">
                {requisitions
                  .filter(r => r.status === 'Approved')
                  .reduce((sum, r) => sum + (r.totalAmount || 0), 0)
                  .toLocaleString('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
