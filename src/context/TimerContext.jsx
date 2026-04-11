import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const TimerContext = createContext();

const DEFAULT_DURATIONS = {
  work: 25,
  shortBreak: 5,
  longBreak: 15,
};

const PHASE_LABELS = {
  work: 'Focus Time',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
};

export function TimerProvider({ children }) {
  // Settings
  const [durations, setDurations] = useState(() => {
    const stored = localStorage.getItem('focusflow-durations');
    return stored ? JSON.parse(stored) : DEFAULT_DURATIONS;
  });
  const [autoStartBreaks, setAutoStartBreaks] = useState(() => {
    return localStorage.getItem('focusflow-autostart') === 'true';
  });
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const stored = localStorage.getItem('focusflow-sound');
    return stored === null ? true : stored === 'true';
  });

  // Timer state
  const [phase, setPhase] = useState(() => {
    return localStorage.getItem('focusflow-phase') || 'work';
  });
  const [timeLeft, setTimeLeft] = useState(() => {
    const stored = localStorage.getItem('focusflow-timeleft');
    if (stored) return parseInt(stored, 10);
    const initialPhase = localStorage.getItem('focusflow-phase') || 'work';
    return (durations[initialPhase] || durations.work) * 60;
  });
  const [isRunning, setIsRunning] = useState(() => {
    return localStorage.getItem('focusflow-isrunning') === 'true';
  });
  const [sessionsCompleted, setSessionsCompleted] = useState(() => {
    const stored = localStorage.getItem('focusflow-sessions');
    return stored ? parseInt(stored, 10) : 0;
  });
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(() => {
    const stored = localStorage.getItem('focusflow-focus-minutes');
    return stored ? parseInt(stored, 10) : 0;
  });
  const [cyclePosition, setCyclePosition] = useState(() => {
    const stored = localStorage.getItem('focusflow-cycle');
    return stored ? parseInt(stored, 10) : 0;
  });

  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  const startTimeRef = useRef(null);
  const focusAccumulatorRef = useRef(0);

  // Persist durations
  useEffect(() => {
    localStorage.setItem('focusflow-durations', JSON.stringify(durations));
  }, [durations]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('focusflow-autostart', String(autoStartBreaks));
  }, [autoStartBreaks]);

  useEffect(() => {
    localStorage.setItem('focusflow-sound', String(soundEnabled));
  }, [soundEnabled]);

  // Persist timer session states
  useEffect(() => {
    localStorage.setItem('focusflow-phase', phase);
  }, [phase]);

  useEffect(() => {
    localStorage.setItem('focusflow-timeleft', String(timeLeft));
  }, [timeLeft]);

  useEffect(() => {
    localStorage.setItem('focusflow-isrunning', String(isRunning));
  }, [isRunning]);

  useEffect(() => {
    localStorage.setItem('focusflow-cycle', String(cyclePosition));
  }, [cyclePosition]);

  // Persist sessions
  useEffect(() => {
    localStorage.setItem('focusflow-sessions', String(sessionsCompleted));
  }, [sessionsCompleted]);

  // Persist focus minutes
  useEffect(() => {
    localStorage.setItem('focusflow-focus-minutes', String(totalFocusMinutes));
  }, [totalFocusMinutes]);

  // Create audio context for notification sound
  const playNotification = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      // Play two tones
      const playTone = (freq, startAt, duration) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime + startAt);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + startAt + duration);
        osc.start(audioCtx.currentTime + startAt);
        osc.stop(audioCtx.currentTime + startAt + duration);
      };
      playTone(880, 0, 0.15);
      playTone(1047, 0.18, 0.15);
      playTone(1319, 0.36, 0.2);
    } catch (e) {
      console.log('Audio not available');
    }
  }, [soundEnabled]);

  // Browser notification
  const sendBrowserNotification = useCallback((title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/vite.svg' });
    }
  }, []);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Timer tick
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            handlePhaseComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Track focus time start
      if (phase === 'work') {
        startTimeRef.current = Date.now();
      }
    } else {
      clearInterval(intervalRef.current);
      // Accumulate focus time on pause
      if (phase === 'work' && startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 60000);
        focusAccumulatorRef.current += elapsed;
        startTimeRef.current = null;
      }
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const handlePhaseComplete = useCallback(() => {
    playNotification();
    setIsRunning(false);

    if (phase === 'work') {
      // Accumulate remaining focus time
      if (startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 60000);
        focusAccumulatorRef.current += elapsed;
        startTimeRef.current = null;
      }
      const focusGained = focusAccumulatorRef.current > 0 ? focusAccumulatorRef.current : durations.work;
      setTotalFocusMinutes(prev => prev + focusGained);
      focusAccumulatorRef.current = 0;

      setSessionsCompleted(prev => prev + 1);
      const newCyclePos = cyclePosition + 1;

      if (newCyclePos >= 4) {
        // Long break after 4 sessions
        setCyclePosition(0);
        setPhase('longBreak');
        setTimeLeft(durations.longBreak * 60);
        sendBrowserNotification('Long Break!', 'Great work! Take a 15 minute break.');
      } else {
        setCyclePosition(newCyclePos);
        setPhase('shortBreak');
        setTimeLeft(durations.shortBreak * 60);
        sendBrowserNotification('Short Break!', 'Take a 5 minute break.');
      }

      if (autoStartBreaks) {
        setTimeout(() => setIsRunning(true), 500);
      }
    } else {
      // Break complete, go back to work
      setPhase('work');
      setTimeLeft(durations.work * 60);
      sendBrowserNotification('Focus Time!', 'Break is over. Let\'s get back to work!');
    }
  }, [phase, cyclePosition, durations, autoStartBreaks, playNotification, sendBrowserNotification]);

  // Update timeLeft only when the setting for the current phase's duration is explicitly modified
  const prevDurationsRef = useRef(durations);
  useEffect(() => {
    if (prevDurationsRef.current[phase] !== durations[phase]) {
      if (!isRunning) {
        setTimeLeft(durations[phase] * 60);
      }
    }
    prevDurationsRef.current = durations;
  }, [durations, phase, isRunning]);

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);
  const toggle = () => setIsRunning(prev => !prev);

  const reset = () => {
    setIsRunning(false);
    focusAccumulatorRef.current = 0;
    startTimeRef.current = null;
    setTimeLeft(durations[phase] * 60);
  };

  const resetTimerData = () => {
    setIsRunning(false);
    focusAccumulatorRef.current = 0;
    startTimeRef.current = null;
    setPhase('work');
    setTimeLeft(durations.work * 60);
    setCyclePosition(0);
    setSessionsCompleted(0);
    setTotalFocusMinutes(0);
  };

  const switchPhase = (newPhase) => {
    setIsRunning(false);
    focusAccumulatorRef.current = 0;
    startTimeRef.current = null;
    setPhase(newPhase);
    setTimeLeft(durations[newPhase] * 60);
  };

  const skipToNext = () => {
    handlePhaseComplete();
  };

  const totalDuration = durations[phase] * 60;
  const progress = totalDuration > 0 ? (totalDuration - timeLeft) / totalDuration : 0;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <TimerContext.Provider value={{
      // State
      phase,
      timeLeft,
      isRunning,
      sessionsCompleted,
      totalFocusMinutes,
      cyclePosition,
      progress,
      totalDuration,
      phaseLabel: PHASE_LABELS[phase],

      // Settings
      durations,
      setDurations,
      autoStartBreaks,
      setAutoStartBreaks,
      soundEnabled,
      setSoundEnabled,

      // Actions
      start,
      pause,
      toggle,
      reset,
      resetTimerData,
      switchPhase,
      skipToNext,
      formatTime,
    }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error('useTimer must be used within TimerProvider');
  return ctx;
}
