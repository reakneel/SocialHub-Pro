export type TimerMode = "work" | "shortBreak" | "longBreak"

export interface PomodoroSettings {
  workDuration: number // in minutes
  shortBreakDuration: number
  longBreakDuration: number
  longBreakInterval: number // after how many work sessions
}

export interface PomodoroState {
  mode: TimerMode
  timeLeft: number
  isActive: boolean
  completedSessions: number
  totalTimeSpent: number
  settings: PomodoroSettings
}
