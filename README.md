# FocusFlow — Pomodoro Timer

A beautiful, modern Pomodoro timer web application built with React & Vite. Designed for daily productivity with task planning, multiple themes, and smart session tracking.

## ✨ Features

### Core Timer
- **25/5/15 Pomodoro cycle** — Work (25 min), Short Break (5 min), Long Break (15 min after 4 sessions)
- **Start / Pause / Reset** — Full timer control
- **Skip to next phase** — Manually jump between work and break
- **Circular progress ring** — Beautiful animated SVG ring with gradient
- **Session tracking** — 4-round cycle indicator with dots
- **Sound notifications** — Custom Web Audio tones when sessions complete
- **Browser notifications** — Desktop push notifications (with permission)
- **Auto-start breaks** — Optional auto-transition to break after work

### Task Planning
- **Daily task list** — Plan your focus sessions for the day
- **Task categories** — Work, Personal, Study, Health
- **Pomodoro estimation** — Estimate how many pomodoros each task needs
- **Active task tracking** — Set an active task that shows in the timer
- **Pomodoro progress** — Visual dots showing completed vs estimated pomodoros
- **Task filtering** — Filter by All, Active, or Completed
- **Animated transitions** — Smooth Framer Motion animations

### Themes
- **Light Mode** — Clean, bright interface
- **Dark Mode** — Elegant dark theme
- **AMOLED Mode** — True black for OLED screens
- Auto-detects system preference on first visit

### Settings
- **Custom durations** — Adjust work, short break, and long break lengths (1–120 min)
- **Auto-start breaks** — Toggle on/off
- **Sound toggle** — Mute/unmute notifications
- **Theme selector** — Visual theme picker

### Additional
- **Responsive design** — Perfectly optimized for desktop and mobile
- **Data persistence** — All settings, tasks, and stats saved in localStorage
- **Dynamic page title** — Shows countdown in browser tab when running
- **Stats dashboard** — Sessions completed, total focus time, productive hours
- **Zero dependencies** for core timer logic (Web Audio API)

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- npm

### Install
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```
Or double-click `start-server.bat` on Windows.

The app will be available at **http://localhost:5173**

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🛠 Server Scripts (Windows)

| Script | Description |
|--------|-------------|
| `start-server.bat` | Start the Vite dev server |
| `stop-server.bat` | Stop the running dev server |
| `kill-port.bat` | Kill any process on a specific port |

### npm scripts
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run start    # Alias for dev
npm run stop     # Kill port 5173
npm run kill-port # Kill port 5173
```

## 📁 Project Structure

```
PoMoDoRo/
├── index.html              # Entry HTML
├── package.json
├── vite.config.js
├── start-server.bat        # Windows: start server
├── stop-server.bat         # Windows: stop server
├── kill-port.bat           # Windows: kill port
├── public/
│   └── vite.svg
└── src/
    ├── main.jsx            # App entry point
    ├── App.jsx             # Root component
    ├── index.css           # Complete design system
    ├── context/
    │   ├── ThemeContext.jsx # Light/Dark/AMOLED theme management
    │   ├── TimerContext.jsx # Pomodoro timer logic & state
    │   └── TaskContext.jsx  # Task planning & management
    └── components/
        ├── Navbar.jsx       # Top navigation bar
        ├── PhaseSelector.jsx# Work/Break mode tabs
        ├── TimerRing.jsx    # Circular SVG timer display
        ├── TimerControls.jsx# Play/Pause/Reset/Skip buttons
        ├── StatsBar.jsx     # Daily statistics cards
        ├── QuickActions.jsx # Sound & auto-break toggles
        ├── TaskInput.jsx    # Task creation form
        ├── TaskList.jsx     # Task list with filtering
        └── SettingsPanel.jsx# Full settings modal
```

## 🎨 Tech Stack

- **React 19** — UI framework
- **Vite 8** — Build tool & dev server
- **Framer Motion** — Animations
- **React Icons** — Icon library
- **CSS Custom Properties** — Design system with theme tokens
- **Web Audio API** — Sound notifications
- **localStorage** — Data persistence

## 📱 Responsive Design

The app is fully responsive:
- **Mobile (< 480px)** — Stacked layout, compact timer
- **Tablet (480–768px)** — Single column with balanced spacing
- **Desktop (768px+)** — Side-by-side timer and task panels

---

Built with ❤️ for productivity.
