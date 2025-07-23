"use client"

import { useState, useEffect, useCallback } from "react"
import type { TimerMode, PomodoroSettings, PomodoroState } from "../types"

const defaultSettings: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
}

export function usePomodoro(initialSettings?: Partial<PomodoroSettings>) {
  const [settings, setSettings] = useState<PomodoroSettings>({
    ...defaultSettings,
    ...initialSettings,
  })

  const [mode, setMode] = useState<TimerMode>("work")
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60)
  const [isActive, setIsActive] = useState(false)
  const [completedSessions, setCompletedSessions] = useState(0)
  const [totalTimeSpent, setTotalTimeSpent] = useState(0)

  const getCurrentDuration = useCallback(() => {
    switch (mode) {
      case "work":
        return settings.workDuration * 60
      case "shortBreak":
        return settings.shortBreakDuration * 60
      case "longBreak":
        return settings.longBreakDuration * 60
      default:
        return settings.workDuration * 60
    }
  }, [mode, settings])

  const playNotificationSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (error) {
      console.warn("Could not play notification sound:", error)
    }
  }, [])

  const switchMode = useCallback(() => {
    if (mode === "work") {
      const newCompletedSessions = completedSessions + 1
      setCompletedSessions(newCompletedSessions)

      if (newCompletedSessions % settings.longBreakInterval === 0) {
        setMode("longBreak")
        setTimeLeft(settings.longBreakDuration * 60)
      } else {
        setMode("shortBreak")
        setTimeLeft(settings.shortBreakDuration * 60)
      }
    } else {
      setMode("work")
      setTimeLeft(settings.workDuration * 60)
    }
    setIsActive(false)
    playNotificationSound()
  }, [mode, completedSessions, settings, playNotificationSound])

  const resetTimer = useCallback(() => {
    setIsActive(false)
    setTimeLeft(getCurrentDuration())
  }, [getCurrentDuration])

  const toggleTimer = useCallback(() => {
    setIsActive(!isActive)
  }, [isActive])

  const changeMode = useCallback(
    (newMode: TimerMode) => {
      setMode(newMode)
      setIsActive(false)
      switch (newMode) {
        case "work":
          setTimeLeft(settings.workDuration * 60)
          break
        case "shortBreak":
          setTimeLeft(settings.shortBreakDuration * 60)
          break
        case "longBreak":
          setTimeLeft(settings.longBreakDuration * 60)
          break
      }
    },
    [settings],
  )

  const updateSettings = useCallback(
    (newSettings: PomodoroSettings) => {
      setSettings(newSettings)
      // Reset timer with new settings if not active
      if (!isActive) {
        setTimeLeft(newSettings.workDuration * 60)
        setMode("work")
      }
    },
    [isActive],
  )

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            switchMode()
            return getCurrentDuration()
          }
          return time - 1
        })
        setTotalTimeSpent((total) => total + 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsActive(false)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, switchMode, getCurrentDuration])

  const state: PomodoroState = {
    mode,
    timeLeft,
    isActive,
    completedSessions,
    totalTimeSpent,
    settings,
  }

  return {
    ...state,
    toggleTimer,
    resetTimer,
    changeMode,
    updateSettings,
    getCurrentDuration,
  }
}
