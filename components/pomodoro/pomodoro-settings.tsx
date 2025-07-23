"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Settings } from "lucide-react"
import type { PomodoroSettings } from "./types"

interface PomodoroSettingsProps {
  settings: PomodoroSettings
  onSettingsChange: (settings: PomodoroSettings) => void
  trigger?: React.ReactNode
}

export default function PomodoroSettings({ settings, onSettingsChange, trigger }: PomodoroSettingsProps) {
  const [localSettings, setLocalSettings] = useState(settings)
  const [isOpen, setIsOpen] = useState(false)

  const handleSave = () => {
    onSettingsChange(localSettings)
    setIsOpen(false)
  }

  const handleReset = () => {
    const defaultSettings = {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      longBreakInterval: 4,
    }
    setLocalSettings(defaultSettings)
  }

  const defaultTrigger = (
    <Button variant="outline" size="icon">
      <Settings className="h-4 w-4" />
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Timer Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="work-duration">Work Duration (minutes)</Label>
            <Input
              id="work-duration"
              type="number"
              min="1"
              max="60"
              value={localSettings.workDuration}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  workDuration: Number.parseInt(e.target.value) || 25,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="short-break">Short Break (minutes)</Label>
            <Input
              id="short-break"
              type="number"
              min="1"
              max="30"
              value={localSettings.shortBreakDuration}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  shortBreakDuration: Number.parseInt(e.target.value) || 5,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="long-break">Long Break (minutes)</Label>
            <Input
              id="long-break"
              type="number"
              min="1"
              max="60"
              value={localSettings.longBreakDuration}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  longBreakDuration: Number.parseInt(e.target.value) || 15,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="long-break-interval">Long Break Interval (sessions)</Label>
            <Input
              id="long-break-interval"
              type="number"
              min="2"
              max="10"
              value={localSettings.longBreakInterval}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  longBreakInterval: Number.parseInt(e.target.value) || 4,
                })
              }
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              Save Settings
            </Button>
            <Button onClick={handleReset} variant="outline">
              Reset
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
