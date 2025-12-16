import { type DailyEntry, type Settings, DEFAULT_SETTINGS } from "./types"

const ENTRIES_KEY = "daily-progress-entries"
const SETTINGS_KEY = "daily-progress-settings"

export function getEntries(): DailyEntry[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(ENTRIES_KEY)
  if (!data) return []

  const entries = JSON.parse(data)
  return entries.map((e: any) => ({
    ...e,
    dayRating: e.dayRating ?? e.mood ?? 3,
    energyLogs: e.energyLogs ?? (e.energy ? [{ level: e.energy, timestamp: e.createdAt }] : []),
  }))
}

export function saveEntry(entry: DailyEntry): void {
  const entries = getEntries()
  const existingIndex = entries.findIndex((e) => e.date === entry.date)

  if (existingIndex >= 0) {
    entries[existingIndex] = { ...entry, updatedAt: new Date().toISOString() }
  } else {
    entries.push(entry)
  }

  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries))
}

export function getEntryByDate(date: string): DailyEntry | null {
  const entries = getEntries()
  return entries.find((e) => e.date === date) || null
}

export function deleteEntry(date: string): void {
  const entries = getEntries().filter((e) => e.date !== date)
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries))
}

export function getSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS
  const data = localStorage.getItem(SETTINGS_KEY)
  return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]
}

export function getTodayDate(): string {
  return formatDate(new Date())
}
