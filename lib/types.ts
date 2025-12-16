export interface EnergyLog {
  level: number // 1-5
  timestamp: string // ISO timestamp
}

export interface DailyEntry {
  id: string
  date: string // ISO date string YYYY-MM-DD
  dayRating: number // 1-5 (How was your day?)
  energyLogs: EnergyLog[] // Multiple energy entries throughout the day
  accomplishments: string[] // Study accomplishments
  challenges: string[] // Study challenges
  notes: string
  createdAt: string
  updatedAt: string
}

export interface Settings {
  enabledSections: {
    dayRating: boolean
    energy: boolean
    accomplishments: boolean
    challenges: boolean
    notes: boolean
  }
  theme: "light" | "dark" | "system"
  reminderTime: string | null
}

export const DEFAULT_SETTINGS: Settings = {
  enabledSections: {
    dayRating: true,
    energy: true,
    accomplishments: true,
    challenges: true,
    notes: true,
  },
  theme: "system",
  reminderTime: null,
}

export type DayRatingLabel = "Terrible" | "Bad" | "Okay" | "Good" | "Amazing"
export type EnergyLabel = "Exhausted" | "Tired" | "Normal" | "Energized" | "Very Energized"

export const DAY_RATING_LABELS: DayRatingLabel[] = ["Terrible", "Bad", "Okay", "Good", "Amazing"]
export const ENERGY_LABELS: EnergyLabel[] = ["Exhausted", "Tired", "Normal", "Energized", "Very Energized"]
