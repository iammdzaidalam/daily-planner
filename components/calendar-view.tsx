"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { type DailyEntry, DAY_RATING_LABELS, ENERGY_LABELS } from "@/lib/types"
import { getEntries, deleteEntry, getTodayDate } from "@/lib/storage"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react"

const dayRatingColors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-lime-400", "bg-green-400"]

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

function getAverageEnergyLevel(energyLogs: { level: number; timestamp: string }[] | undefined): number | null {
  if (!energyLogs || energyLogs.length === 0) return null
  const sum = energyLogs.reduce((acc, log) => acc + log.level, 0)
  return Math.round(sum / energyLogs.length)
}

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [entries, setEntries] = useState<DailyEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<DailyEntry | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  useEffect(() => {
    setEntries(getEntries())
  }, [])

  const entriesMap = useMemo(() => {
    const map = new Map<string, DailyEntry>()
    entries.forEach((entry) => map.set(entry.date, entry))
    return map
  }, [entries])

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const today = getTodayDate()

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1))
    setCurrentDate(newDate)
  }

  const handleDeleteEntry = () => {
    if (selectedEntry) {
      deleteEntry(selectedEntry.date)
      setEntries(getEntries())
      setSelectedEntry(null)
    }
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  const formatFullDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00")
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const calendarDays = []
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    calendarDays.push({ day, date: dateStr, entry: entriesMap.get(dateStr) })
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <CardTitle className="text-lg">{formatMonthYear(currentDate)}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((dayData, index) => {
              if (!dayData) {
                return <div key={`empty-${index}`} className="aspect-square" />
              }

              const { day, date, entry } = dayData
              const isToday = date === today
              const isFuture = date > today
              const hasEntry = !!entry

              return (
                <button
                  key={date}
                  onClick={() => entry && setSelectedEntry(entry)}
                  disabled={!hasEntry || isFuture}
                  className={cn(
                    "aspect-square rounded-lg flex flex-col items-center justify-center text-sm relative transition-all",
                    isToday && "ring-2 ring-primary ring-offset-2",
                    isFuture && "text-muted-foreground/40",
                    hasEntry && "hover:scale-105 cursor-pointer",
                    !hasEntry && !isFuture && "text-muted-foreground",
                  )}
                >
                  <span className={cn("font-medium", hasEntry && "text-foreground")}>{day}</span>
                  {hasEntry && (
                    <div className={cn("w-2 h-2 rounded-full mt-0.5", dayRatingColors[entry.dayRating - 1])} />
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Legend</h3>
        <div className="flex flex-wrap gap-3">
          {DAY_RATING_LABELS.map((label, index) => (
            <div key={label} className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded-full", dayRatingColors[index])} />
              <span className="text-sm">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          {selectedEntry && (
            <>
              <DialogHeader>
                <DialogTitle>{formatFullDate(selectedEntry.date)}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <p className="text-sm text-muted-foreground">How was your day?</p>
                  <p className="font-medium">{DAY_RATING_LABELS[selectedEntry.dayRating - 1]}</p>
                </div>

                {selectedEntry.energyLogs && selectedEntry.energyLogs.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Average Energy Level</p>
                    <p className="font-medium">{ENERGY_LABELS[getAverageEnergyLevel(selectedEntry.energyLogs)! - 1]}</p>
                  </div>
                )}

                {selectedEntry.accomplishments.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Study Accomplishments</p>
                    <ul className="space-y-1">
                      {selectedEntry.accomplishments.map((item, i) => (
                        <li key={i} className="text-sm bg-muted rounded px-2 py-1">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedEntry.challenges.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Study Challenges</p>
                    <ul className="space-y-1">
                      {selectedEntry.challenges.map((item, i) => (
                        <li key={i} className="text-sm bg-muted rounded px-2 py-1">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedEntry.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm bg-muted rounded px-2 py-2">{selectedEntry.notes}</p>
                  </div>
                )}

                <Button variant="destructive" onClick={handleDeleteEntry} className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Entry
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
