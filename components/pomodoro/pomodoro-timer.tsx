"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, Timer } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePomodoro } from "./hooks/use-pomodoro"
import { formatTime, getProgress, getModeColor, getModeText } from "./utils"
import type { PomodoroSettings } from "./types"

interface PomodoroTimerProps {
  initialSettings?: Partial<PomodoroSettings>
  className?: string
}

export default function PomodoroTimer({ initialSettings, className }: PomodoroTimerProps) {
  const {
    mode,
    timeLeft,
    isActive,
    completedSessions,
    totalTimeSpent,
    settings,
    toggleTimer,
    resetTimer,
    changeMode,
    getCurrentDuration,
  } = usePomodoro(initialSettings)

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Timer className="h-5 w-5" />
          <CardTitle>Pomodoro Timer</CardTitle>
        </div>
        <Badge variant="secondary" className={cn("text-white", getModeColor(mode))}>
          {getModeText(mode)}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timer Display */}
        <div className="text-center">
          <div className="text-6xl font-mono font-bold text-foreground mb-4">{formatTime(timeLeft)}</div>
          <Progress value={getProgress(timeLeft, getCurrentDuration())} className="h-2" />
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-2">
          <Button
            onClick={toggleTimer}
            size="lg"
            className={cn("flex-1", isActive ? "bg-orange-500 hover:bg-orange-600" : "bg-green-500 hover:bg-green-600")}
          >
            {isActive ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start
              </>
            )}
          </Button>
          <Button onClick={resetTimer} variant="outline" size="lg">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Sessions</p>
            <p className="text-2xl font-bold">{completedSessions}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Time</p>
            <p className="text-2xl font-bold">{Math.floor(totalTimeSpent / 60)}m</p>
          </div>
        </div>

        {/* Mode Buttons */}
        <div className="flex gap-2">
          <Button
            variant={mode === "work" ? "default" : "outline"}
            size="sm"
            onClick={() => changeMode("work")}
            className="flex-1"
          >
            Work
          </Button>
          <Button
            variant={mode === "shortBreak" ? "default" : "outline"}
            size="sm"
            onClick={() => changeMode("shortBreak")}
            className="flex-1"
          >
            Short Break
          </Button>
          <Button
            variant={mode === "longBreak" ? "default" : "outline"}
            size="sm"
            onClick={() => changeMode("longBreak")}
            className="flex-1"
          >
            Long Break
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
