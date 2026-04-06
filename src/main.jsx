import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { TimerProvider } from './context/TimerContext.jsx'
import { TaskProvider } from './context/TaskContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <TimerProvider>
        <TaskProvider>
          <App />
        </TaskProvider>
      </TimerProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
