"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type DailyEntry, DAY_RATING_LABELS, ENERGY_LABELS } from "@/lib/types"
import { getEntries } from "@/lib/storage"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, Tooltip } from "recharts"
import { CalendarDays, TrendingUp, Star, BookOpen } from "lucide-react"

type TimeRange = "7d" | "30d" | "90d" | "all"

function filterEntriesByRange(entries: DailyEntry[], range: TimeRange): DailyEntry[] {
  if (range === "all") return entries

  const now = new Date()
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  const cutoffStr = cutoff.toISOString().split("T")[0]

  return entries.filter((e) => e.date >= cutoffStr)
}

function getMonthName(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

function getMonthlySummary(avgRating: number): { message: string; emoji: string } {
  if (avgRating >= 4.5)
    return {
      message: "Outstanding month! You've been consistently having great days. Keep up the excellent work!",
      emoji: "🌟",
    }
  if (avgRating >= 3.5)
    return {
      message: "Good month overall! You've had more positive days than challenging ones. Nice progress!",
      emoji: "😊",
    }
  if (avgRating >= 2.5)
    return { message: "A balanced month with ups and downs. Every day is a learning opportunity!", emoji: "💪" }
  if (avgRating >= 1.5)
    return { message: "A challenging month, but you kept showing up. That takes real strength!", emoji: "🌱" }
  return { message: "A tough month, but remember: difficult times don't last. Keep pushing forward!", emoji: "❤️" }
}

export function StatsView() {
  const [entries, setEntries] = useState<DailyEntry[]>([])
  const [timeRange, setTimeRange] = useState<TimeRange>("30d")

  useEffect(() => {
    setEntries(getEntries())
  }, [])

  const filteredEntries = useMemo(() => filterEntriesByRange(entries, timeRange), [entries, timeRange])

  const stats = useMemo(() => {
    if (filteredEntries.length === 0) {
      return {
        totalEntries: 0,
        avgDayRating: 0,
        totalAccomplishments: 0,
        streak: 0,
        dayRatingDistribution: DAY_RATING_LABELS.map((label) => ({ name: label, count: 0 })),
        dayRatingTrend: [],
        energyTimeData: [],
      }
    }

    const avgDayRating = filteredEntries.reduce((sum, e) => sum + e.dayRating, 0) / filteredEntries.length
    const totalAccomplishments = filteredEntries.reduce((sum, e) => sum + e.accomplishments.length, 0)

    const dayRatingCounts = [0, 0, 0, 0, 0]
    filteredEntries.forEach((e) => {
      dayRatingCounts[e.dayRating - 1]++
    })
    const dayRatingDistribution = DAY_RATING_LABELS.map((label, i) => ({ name: label, count: dayRatingCounts[i] }))

    // Calculate streak
    let streak = 0
    const sortedEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date))
    const today = new Date()
    const checkDate = new Date(today)

    for (const entry of sortedEntries) {
      const entryDate = entry.date
      const checkStr = checkDate.toISOString().split("T")[0]

      if (entryDate === checkStr) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else if (entryDate < checkStr) {
        break
      }
    }

    const dayRatingTrend = [...filteredEntries]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14)
      .map((e) => ({
        date: new Date(e.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        dayRating: e.dayRating,
      }))

    const energyTimeData: { hour: number; level: number; date: string }[] = []
    filteredEntries.forEach((e) => {
      if (e.energyLogs) {
        e.energyLogs.forEach((log) => {
          const date = new Date(log.timestamp)
          energyTimeData.push({
            hour: date.getHours() + date.getMinutes() / 60,
            level: log.level,
            date: e.date,
          })
        })
      }
    })

    return {
      totalEntries: filteredEntries.length,
      avgDayRating,
      totalAccomplishments,
      streak,
      dayRatingDistribution,
      dayRatingTrend,
      energyTimeData,
    }
  }, [filteredEntries, entries])

  const energyByTimeOfDay = useMemo(() => {
    if (stats.energyTimeData.length === 0) return []

    // Group by hour buckets (morning, midday, afternoon, evening, night)
    const timeBuckets = [
      { name: "Early Morning", start: 5, end: 8, total: 0, count: 0 },
      { name: "Morning", start: 8, end: 12, total: 0, count: 0 },
      { name: "Afternoon", start: 12, end: 17, total: 0, count: 0 },
      { name: "Evening", start: 17, end: 21, total: 0, count: 0 },
      { name: "Night", start: 21, end: 24, total: 0, count: 0 },
    ]

    stats.energyTimeData.forEach((d) => {
      const bucket = timeBuckets.find((b) => d.hour >= b.start && d.hour < b.end)
      if (bucket) {
        bucket.total += d.level
        bucket.count++
      }
    })

    return timeBuckets
      .filter((b) => b.count > 0)
      .map((b) => ({
        name: b.name,
        avgEnergy: Number((b.total / b.count).toFixed(2)),
        count: b.count,
      }))
  }, [stats.energyTimeData])

  const monthlySummary = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const monthEntries = entries.filter((e) => {
      const entryDate = new Date(e.date + "T00:00:00")
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear
    })

    if (monthEntries.length === 0) return null

    const avgRating = monthEntries.reduce((sum, e) => sum + e.dayRating, 0) / monthEntries.length
    const summary = getMonthlySummary(avgRating)

    return {
      month: getMonthName(now),
      avgRating,
      avgLabel: DAY_RATING_LABELS[Math.round(avgRating) - 1] || "N/A",
      totalDays: monthEntries.length,
      ...summary,
    }
  }, [entries])

  const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
  }: {
    title: string
    value: string | number
    subtitle?: string
    icon: React.ElementType
  }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Statistics</h1>
        <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No entries yet. Start tracking your progress to see statistics!</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Total Entries" value={stats.totalEntries} icon={CalendarDays} />
            <StatCard
              title="Current Streak"
              value={`${stats.streak} day${stats.streak !== 1 ? "s" : ""}`}
              icon={TrendingUp}
            />
            <StatCard
              title="Avg Day Rating"
              value={stats.avgDayRating.toFixed(1)}
              subtitle={DAY_RATING_LABELS[Math.round(stats.avgDayRating) - 1] || "-"}
              icon={Star}
            />
            <StatCard
              title="Study Items"
              value={stats.totalAccomplishments}
              subtitle="accomplishments logged"
              icon={BookOpen}
            />
          </div>

          {stats.dayRatingTrend.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">How Was Your Day - Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.dayRatingTrend}>
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis
                        domain={[1, 5]}
                        ticks={[1, 2, 3, 4, 5]}
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        stroke="hsl(var(--muted-foreground))"
                        tickFormatter={(value) => DAY_RATING_LABELS[value - 1]?.substring(0, 3) || ""}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                        }}
                        labelStyle={{ color: "hsl(var(--foreground))" }}
                        formatter={(value?: number) => {
  if (typeof value !== "number") {
    return ["—", "Day Rating"]
  }

  return [DAY_RATING_LABELS[value - 1], "Day Rating"]
}}

                      />
                      <Line
                        type="monotone"
                        dataKey="dayRating"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--chart-1))", stroke: "hsl(var(--chart-1))", strokeWidth: 0, r: 4 }}
                        activeDot={{
                          fill: "hsl(var(--chart-1))",
                          stroke: "hsl(var(--background))",
                          strokeWidth: 2,
                          r: 6,
                        }}
                        name="Day Rating"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {energyByTimeOfDay.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Energy Levels Throughout the Day</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={energyByTimeOfDay}>
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis
                        domain={[1, 5]}
                        ticks={[1, 2, 3, 4, 5]}
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        stroke="hsl(var(--muted-foreground))"
                        tickFormatter={(value) => ENERGY_LABELS[value - 1]?.substring(0, 4) || ""}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                        }}
                        labelStyle={{ color: "hsl(var(--foreground))" }}
                        formatter={(value?: number) => {
  if (typeof value !== "number") {
    return ["—", "Avg Energy"]
  }

  return [ENERGY_LABELS[Math.round(value) - 1], "Avg Energy"]
}}

                      />
                      <Bar dataKey="avgEnergy" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Average energy levels based on {stats.energyTimeData.length} logged entries
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Day Rating Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.dayRatingDistribution} layout="vertical">
                      <XAxis
                        type="number"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        stroke="hsl(var(--muted-foreground))"
                        width={70}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                        }}
                        labelStyle={{ color: "hsl(var(--foreground))" }}
                      />
                      <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Study Progress Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-3xl font-bold text-primary">{stats.totalAccomplishments}</p>
                  <p className="text-sm text-muted-foreground mt-1">study accomplishments logged</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">
                    {(stats.totalAccomplishments / Math.max(stats.totalEntries, 1)).toFixed(1)}
                  </p>
                  <p className="text-sm text-muted-foreground">avg accomplishments per day</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {monthlySummary && (
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <span>{monthlySummary.emoji}</span>
                  {monthlySummary.month} Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-4xl font-bold text-primary">{monthlySummary.avgRating.toFixed(1)}</p>
                    <p className="text-sm text-muted-foreground">avg rating</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-lg">{monthlySummary.avgLabel}</p>
                    <p className="text-sm text-muted-foreground">based on {monthlySummary.totalDays} days tracked</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-foreground leading-relaxed">{monthlySummary.message}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
