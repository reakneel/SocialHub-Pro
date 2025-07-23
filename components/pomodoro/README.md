# Pomodoro Timer Components

A complete Pomodoro timer module for Next.js applications with TypeScript support.

## Installation

1. Copy the entire `pomodoro` folder to your `components` directory
2. Ensure you have the required shadcn/ui components installed:
   - Button, Card, Progress, Badge, Dialog, Input, Label

## Usage

### Basic Import
\`\`\`tsx
import { PomodoroTimer, PomodoroWidget, usePomodoro } from '@/components/pomodoro'
\`\`\`

### Full Timer Component
\`\`\`tsx
<PomodoroTimer 
  initialSettings={{ workDuration: 30 }}
  className="my-custom-class"
/>
\`\`\`

### Widget Component
\`\`\`tsx
<PomodoroWidget 
  initialSettings={{ workDuration: 25 }}
  expandUrl="/my-timer-page"
  className="my-widget-class"
/>
\`\`\`

### Custom Hook
\`\`\`tsx
const {
  mode,
  timeLeft,
  isActive,
  toggleTimer,
  resetTimer,
  changeMode
} = usePomodoro({ workDuration: 30 })
\`\`\`

## Features

- ✅ Classic Pomodoro Technique (25/5/15 minutes)
- ✅ Customizable timer durations
- ✅ Audio notifications
- ✅ Session tracking
- ✅ Progress visualization
- ✅ Responsive design
- ✅ TypeScript support
- ✅ Accessible components

## Components

- **PomodoroTimer**: Full-featured timer with all controls
- **PomodoroWidget**: Compact widget for dashboards
- **PomodoroSettings**: Settings dialog component
- **usePomodoro**: Custom hook for timer logic

## Props

### PomodoroTimer
- `initialSettings?: Partial<PomodoroSettings>`
- `className?: string`

### PomodoroWidget
- `initialSettings?: Partial<PomodoroSettings>`
- `className?: string`
- `expandUrl?: string` (default: "/pomodoro")

### PomodoroSettings
- `settings: PomodoroSettings`
- `onSettingsChange: (settings: PomodoroSettings) => void`
- `trigger?: React.ReactNode`
