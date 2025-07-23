// Dashboard widget
<PomodoroWidget expandUrl="/focus" />

// Custom timer page
<PomodoroTimer initialSettings={{ workDuration: 45 }} />

// Build your own UI
const { timeLeft, isActive, toggleTimer } = usePomodoro()