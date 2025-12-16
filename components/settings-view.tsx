"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { type Settings, DEFAULT_SETTINGS } from "@/lib/types"
import { getSettings, saveSettings, getEntries } from "@/lib/storage"
import { Sun, Moon, Monitor, Trash2, Download, Upload, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const ENTRIES_KEY = "daily-progress-entries"
const SETTINGS_KEY = "daily-progress-settings"

export function SettingsView() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [saved, setSaved] = useState(false)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)

  useEffect(() => {
    setSettings(getSettings())
  }, [])

  useEffect(() => {
    // Apply theme
    const root = document.documentElement
    if (settings.theme === "dark") {
      root.classList.add("dark")
    } else if (settings.theme === "light") {
      root.classList.remove("dark")
    } else {
      // System preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      root.classList.toggle("dark", prefersDark)
    }
  }, [settings.theme])

  const updateSettings = (updates: Partial<Settings>) => {
    const newSettings = { ...settings, ...updates }
    setSettings(newSettings)
    saveSettings(newSettings)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const updateEnabledSection = (section: keyof Settings["enabledSections"], enabled: boolean) => {
    updateSettings({
      enabledSections: { ...settings.enabledSections, [section]: enabled },
    })
  }

  const handleClearData = () => {
    localStorage.removeItem(ENTRIES_KEY)
    localStorage.removeItem(SETTINGS_KEY)
    setSettings(DEFAULT_SETTINGS)
    setClearDialogOpen(false)
    window.location.reload()
  }

  const handleExportData = () => {
    const entries = getEntries()
    const data = {
      entries,
      settings,
      exportedAt: new Date().toISOString(),
      version: "1.0",
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `daily-progress-export-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportData = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string)
          if (data.entries) {
            localStorage.setItem(ENTRIES_KEY, JSON.stringify(data.entries))
          }
          if (data.settings) {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings))
            setSettings(data.settings)
          }
          window.location.reload()
        } catch (error) {
          alert("Failed to import data. Please check the file format.")
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ] as const

  const sectionLabels: Record<keyof Settings["enabledSections"], string> = {
    dayRating: "How Was Your Day",
    energy: "Energy Level",
    accomplishments: "Study Accomplishments",
    challenges: "Study Challenges",
    notes: "Additional Notes",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Settings</h1>
        {saved && (
          <span className="text-sm text-primary flex items-center gap-1">
            <Check className="h-4 w-4" />
            Saved
          </span>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription>Choose your preferred theme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {themeOptions.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => updateSettings({ theme: value })}
                className={cn(
                  "flex-1 flex flex-col items-center gap-2 p-4 rounded-lg border transition-all",
                  settings.theme === value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-muted",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Check-in Sections</CardTitle>
          <CardDescription>Choose which sections to show in your daily check-in</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(Object.keys(settings.enabledSections) as Array<keyof Settings["enabledSections"]>).map((section) => (
            <div key={section} className="flex items-center justify-between">
              <Label htmlFor={section} className="cursor-pointer">
                {sectionLabels[section]}
              </Label>
              <Switch
                id={section}
                checked={settings.enabledSections[section]}
                onCheckedChange={(checked) => updateEnabledSection(section, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data Management</CardTitle>
          <CardDescription>Export, import, or clear your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleImportData}>
            <Upload className="h-4 w-4 mr-2" />
            Import Data
          </Button>
          <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-destructive hover:text-destructive bg-transparent"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Data
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Clear All Data</DialogTitle>
                <DialogDescription>
                  This will permanently delete all your entries and reset settings. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setClearDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleClearData}>
                  Delete Everything
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">About</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>Daily Progress Tracker v1.0</p>
          <p>Your data is stored locally in your browser and never sent to any server.</p>
        </CardContent>
      </Card>
    </div>
  )
}
