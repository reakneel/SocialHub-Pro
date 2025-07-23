export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export function getProgress(timeLeft: number, totalDuration: number): number {
  return ((totalDuration - timeLeft) / totalDuration) * 100
}

export function getModeColor(mode: string): string {
  switch (mode) {
    case "work":
      return "bg-red-500"
    case "shortBreak":
      return "bg-green-500"
    case "longBreak":
      return "bg-blue-500"
    default:
      return "bg-red-500"
  }
}

export function getModeText(mode: string): string {
  switch (mode) {
    case "work":
      return "Work Time"
    case "shortBreak":
      return "Short Break"
    case "longBreak":
      return "Long Break"
    default:
      return "Work Time"
  }
}
