"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { type EnergyLog, ENERGY_LABELS } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Plus, X, Clock } from "lucide-react"

interface EnergyTrackerProps {
  logs: EnergyLog[]
  onChange: (logs: EnergyLog[]) => void
  disabled?: boolean
}

export function EnergyTracker({ logs, onChange, disabled }: EnergyTrackerProps) {
  const [selectedLevel, setSelectedLevel] = useState<number>(3)

  const addEnergyLog = () => {
    const newLog: EnergyLog = {
      level: selectedLevel,
      timestamp: new Date().toISOString(),
    }
    onChange([...logs, newLog])
  }

  const removeLog = (index: number) => {
    onChange(logs.filter((_, i) => i !== index))
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getEnergyColor = (level: number) => {
    const colors = [
      "bg-red-100 text-red-700 border-red-200",
      "bg-orange-100 text-orange-700 border-orange-200",
      "bg-yellow-100 text-yellow-700 border-yellow-200",
      "bg-lime-100 text-lime-700 border-lime-200",
      "bg-green-100 text-green-700 border-green-200",
    ]
    return colors[level - 1]
  }

  return (
    <div className="space-y-4">
      {/* Energy level selector */}
      {!disabled && (
        <div className="space-y-3">
          <div className="flex gap-2">
            {ENERGY_LABELS.map((label, index) => (
              <button
                key={label}
                onClick={() => setSelectedLevel(index + 1)}
                className={cn(
                  "flex-1 py-2 px-1 rounded-lg text-xs font-medium transition-all border",
                  selectedLevel === index + 1
                    ? getEnergyColor(index + 1)
                    : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <Button onClick={addEnergyLog} variant="outline" size="sm" className="w-full bg-transparent">
            <Plus className="h-4 w-4 mr-2" />
            Log Current Energy
          </Button>
        </div>
      )}

      {/* Logged entries */}
      {logs.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">Today's Energy Log</p>
          <div className="space-y-2">
            {logs.map((log, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg border",
                  getEnergyColor(log.level),
                )}
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 opacity-70" />
                  <span className="text-sm font-medium">{formatTime(log.timestamp)}</span>
                  <span className="text-sm">-</span>
                  <span className="text-sm">{ENERGY_LABELS[log.level - 1]}</span>
                </div>
                {!disabled && (
                  <button onClick={() => removeLog(index)} className="p-1 hover:bg-black/10 rounded">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {logs.length === 0 && disabled && <p className="text-sm text-muted-foreground italic">No energy logs recorded</p>}
    </div>
  )
}
