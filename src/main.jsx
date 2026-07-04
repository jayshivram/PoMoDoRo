import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { TimerProvider } from './context/TimerContext.jsx'
import { TaskProvider } from './context/TaskContext.jsx'
import { WeatherProvider } from './context/WeatherContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <TimerProvider>
          <TaskProvider>
            <WeatherProvider>
              <App />
            </WeatherProvider>
          </TaskProvider>
        </TimerProvider>
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
