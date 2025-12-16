"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RatingSelector } from "@/components/rating-selector"
import { ListInput } from "@/components/list-input"
import { EnergyTracker } from "@/components/energy-tracker"
import { type DailyEntry, DAY_RATING_LABELS, type Settings } from "@/lib/types"
import { getEntryByDate, saveEntry, getSettings, getTodayDate } from "@/lib/storage"
import { Check, ChevronLeft, ChevronRight, Pencil } from "lucide-react"

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

export function DailyForm() {
  const [currentDate, setCurrentDate] = useState(getTodayDate())
  const [settings, setSettings] = useState<Settings | null>(null)
  const [entry, setEntry] = useState<Partial<DailyEntry>>({
    dayRating: 3,
    energyLogs: [],
    accomplishments: [],
    challenges: [],
    notes: "",
  })
  const [saved, setSaved] = useState(false)
  const [hasExistingEntry, setHasExistingEntry] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    setSettings(getSettings())
  }, [])

  useEffect(() => {
    const existingEntry = getEntryByDate(currentDate)
    if (existingEntry) {
      setEntry(existingEntry)
      setHasExistingEntry(true)
      setIsEditing(false)
    } else {
      setEntry({
        dayRating: 3,
        energyLogs: [],
        accomplishments: [],
        challenges: [],
        notes: "",
      })
      setHasExistingEntry(false)
      setIsEditing(true)
    }
    setSaved(false)
  }, [currentDate])

  const handleSave = () => {
    const now = new Date().toISOString()
    const fullEntry: DailyEntry = {
      id: entry.id || generateId(),
      date: currentDate,
      dayRating: entry.dayRating || 3,
      energyLogs: entry.energyLogs || [],
      accomplishments: entry.accomplishments || [],
      challenges: entry.challenges || [],
      notes: entry.notes || "",
      createdAt: entry.createdAt || now,
      updatedAt: now,
    }
    saveEntry(fullEntry)
    setEntry(fullEntry)
    setHasExistingEntry(true)
    setIsEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const isReadOnly = hasExistingEntry && !isEditing

  const navigateDate = (direction: "prev" | "next") => {
    const date = new Date(currentDate)
    date.setDate(date.getDate() + (direction === "next" ? 1 : -1))
    const newDate = date.toISOString().split("T")[0]
    const today = getTodayDate()
    if (newDate <= today) {
      setCurrentDate(newDate)
    }
  }

  const isToday = currentDate === getTodayDate()

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00")
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (!settings) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigateDate("prev")}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground">
            {isToday ? "Today's Check-in" : formatDisplayDate(currentDate)}
          </h2>
          {isToday && <p className="text-sm text-muted-foreground">{formatDisplayDate(currentDate)}</p>}
        </div>
        <Button variant="ghost" size="icon" onClick={() => navigateDate("next")} disabled={isToday}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {isReadOnly && (
        <div className="flex items-center justify-between bg-muted/50 border rounded-lg px-4 py-3">
          <p className="text-sm text-muted-foreground">Entry saved. Click Edit to make changes.</p>
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      )}

      {settings.enabledSections.dayRating && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">How was your day?</CardTitle>
          </CardHeader>
          <CardContent>
            <RatingSelector
              value={entry.dayRating || 3}
              onChange={(dayRating) => setEntry({ ...entry, dayRating })}
              labels={DAY_RATING_LABELS}
              colorScheme="mood"
              disabled={isReadOnly}
            />
          </CardContent>
        </Card>
      )}

      {settings.enabledSections.energy && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Energy Level</CardTitle>
          </CardHeader>
          <CardContent>
            <EnergyTracker
              logs={entry.energyLogs || []}
              onChange={(energyLogs) => setEntry({ ...entry, energyLogs })}
              disabled={isReadOnly}
            />
          </CardContent>
        </Card>
      )}

      {settings.enabledSections.accomplishments && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Study Accomplishments</CardTitle>
          </CardHeader>
          <CardContent>
            <ListInput
              items={entry.accomplishments || []}
              onChange={(accomplishments) => setEntry({ ...entry, accomplishments })}
              placeholder="What did you study or accomplish today?"
              disabled={isReadOnly}
            />
          </CardContent>
        </Card>
      )}

      {settings.enabledSections.challenges && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Study Challenges</CardTitle>
          </CardHeader>
          <CardContent>
            <ListInput
              items={entry.challenges || []}
              onChange={(challenges) => setEntry({ ...entry, challenges })}
              placeholder="What study challenges did you face?"
              disabled={isReadOnly}
            />
          </CardContent>
        </Card>
      )}

      {settings.enabledSections.notes && (
        <Card className="overflow-hidden" style={{ backgroundImage: "url('/images/poki-sheet.png')",backgroundRepeat:"no-repeat",backgroundSize:"100% 100%"}}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Additional Notes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div
              className="relative w-full min-h-[300px] bg-cover bg-center bg-no-repeat"
              // style={{ backgroundImage: "url('/images/poki-sheet.png')",backgroundRepeat:"no-repeat",backgroundSize:"100% 100%"}}
            >
              {isReadOnly ? (
                <div className="absolute inset-0 w-full h-full min-h-[300px] pt-16 px-6 pb-16 text-gray-700 overflow-auto">
                  {entry.notes || <span className="italic text-gray-400">No notes added</span>}
                </div>
              ) : (
                <Textarea
                  value={entry.notes || ""}
                  onChange={(e) => setEntry({ ...entry, notes: e.target.value })}
                  placeholder="Any other thoughts or reflections..."
                  className="absolute inset-0 w-full h-full min-h-[300px] bg-transparent border-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 pt-16 px-6 pb-16 text-gray-700 placeholder:text-gray-400"
                  style={{ caretColor: "#ec4899" }}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!isReadOnly && (
        <Button onClick={handleSave} className="w-full" size="lg">
          {saved ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Saved!
            </>
          ) : (
            "Save Entry"
          )}
        </Button>
      )}
    </div>
  )
}
