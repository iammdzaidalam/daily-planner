"use client"

import { cn } from "@/lib/utils"

interface RatingSelectorProps {
  value: number
  onChange: (value: number) => void
  labels: string[]
  colorScheme?: "mood" | "energy"
  disabled?: boolean
}

const moodColors = [
  "bg-red-100 text-red-700 border-red-200 hover:bg-red-200",
  "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200",
  "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200",
  "bg-lime-100 text-lime-700 border-lime-200 hover:bg-lime-200",
  "bg-green-100 text-green-700 border-green-200 hover:bg-green-200",
]

const moodActiveColors = [
  "bg-red-500 text-red-50 border-red-500",
  "bg-orange-500 text-orange-50 border-orange-500",
  "bg-yellow-500 text-yellow-50 border-yellow-500",
  "bg-lime-500 text-lime-50 border-lime-500",
  "bg-green-500 text-green-50 border-green-500",
]

const energyColors = [
  "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200",
  "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200",
  "bg-cyan-100 text-cyan-700 border-cyan-200 hover:bg-cyan-200",
  "bg-teal-100 text-teal-700 border-teal-200 hover:bg-teal-200",
  "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200",
]

const energyActiveColors = [
  "bg-slate-500 text-slate-50 border-slate-500",
  "bg-blue-500 text-blue-50 border-blue-500",
  "bg-cyan-500 text-cyan-50 border-cyan-500",
  "bg-teal-500 text-teal-50 border-teal-500",
  "bg-emerald-500 text-emerald-50 border-emerald-500",
]

export function RatingSelector({
  value,
  onChange,
  labels,
  colorScheme = "mood",
  disabled = false,
}: RatingSelectorProps) {
  const colors = colorScheme === "mood" ? moodColors : energyColors
  const activeColors = colorScheme === "mood" ? moodActiveColors : energyActiveColors

  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((label, index) => {
        const rating = index + 1
        const isSelected = value === rating
        return (
          <button
            key={rating}
            type="button"
            onClick={() => !disabled && onChange(rating)}
            disabled={disabled}
            className={cn(
              "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
              isSelected ? activeColors[index] : colors[index],
              disabled && "cursor-not-allowed opacity-70 hover:bg-transparent",
            )}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
