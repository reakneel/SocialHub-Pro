"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Timer, Maximize2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePomodoro } from "./hooks/use-pomodoro"
import { formatTime, getModeColor } from "./utils"
import type { PomodoroSettings } from "./types"

interface PomodoroWidgetProps {
  initialSettings?: Partial<PomodoroSettings>
  className?: string
  expandUrl?: string
}

export default function PomodoroWidget({ initialSettings, className, expandUrl = "/pomodoro" }: PomodoroWidgetProps) {
  const { mode, timeLeft, isActive, toggleTimer } = usePomodoro(initialSettings)

  const getModeLabel = () => {
    switch (mode) {
      case "work":
        return "Work"
      case "shortBreak":
        return "Break"
      case "longBreak":
        return "Long Break"
      default:
        return "Work"
    }
  }

  return (
    <Card className={cn("w-full max-w-xs", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            <Badge variant="secondary" className={cn("text-white text-xs", getModeColor(mode))}>
              {getModeLabel()}
            </Badge>
          </div>
          <Link href={expandUrl}>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Maximize2 className="h-3 w-3" />
            </Button>
          </Link>
        </div>

        <div className="text-center mb-3">
          <div className="text-2xl font-mono font-bold">{formatTime(timeLeft)}</div>
        </div>

        <Button
          onClick={toggleTimer}
          size="sm"
          className={cn("w-full", isActive ? "bg-orange-500 hover:bg-orange-600" : "bg-green-500 hover:bg-green-600")}
        >
          {isActive ? (
            <>
              <Pause className="h-3 w-3 mr-1" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-3 w-3 mr-1" />
              Start
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
