import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { FiTarget, FiCoffee } from 'react-icons/fi';
import { useToast } from './ToastContext';

const TimerContext = createContext();

const DEFAULT_DURATIONS = {
  work: 25,
  shortBreak: 5,
  longBreak: 15,
};

const DEFAULT_SESSIONS_BEFORE_LONG_BREAK = 4;

const PHASE_LABELS = {
  work: 'Focus Time',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
};

// parseInt on a corrupted/non-numeric stored value (or a literal "NaN"
// string written by a past bug) silently returns NaN, which then poisons
// every arithmetic update derived from it forever. Falling back to a
// default whenever the parse isn't a finite number makes that self-healing.
function readStoredInt(key, fallback) {
  const stored = localStorage.getItem(key);
  const parsed = stored !== null ? parseInt(stored, 10) : NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function TimerProvider({ children }) {
  const { showToast } = useToast();

  // Settings
  const [durations, setDurations] = useState(() => {
    const stored = localStorage.getItem('focusflow-durations');
    if (!stored) return DEFAULT_DURATIONS;
    try {
      const parsed = JSON.parse(stored);
      const isValid = ['work', 'shortBreak', 'longBreak'].every(k => Number.isFinite(parsed?.[k]));
      return isValid ? parsed : DEFAULT_DURATIONS;
    } catch {
      return DEFAULT_DURATIONS;
    }
  });
  const [autoStartBreaks, setAutoStartBreaks] = useState(() => {
    return localStorage.getItem('focusflow-autostart') === 'true';
  });
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const stored = localStorage.getItem('focusflow-sound');
    return stored === null ? true : stored === 'true';
  });
  const [sessionsBeforeLongBreak, setSessionsBeforeLongBreak] = useState(() => (
    readStoredInt('focusflow-sessions-before-long-break', DEFAULT_SESSIONS_BEFORE_LONG_BREAK)
  ));

  // Timer state
  const [phase, setPhase] = useState(() => {
    return localStorage.getItem('focusflow-phase') || 'work';
  });
  const [timeLeft, setTimeLeft] = useState(() => {
    const initialPhase = localStorage.getItem('focusflow-phase') || 'work';
    const fallback = (durations[initialPhase] || durations.work) * 60;
    return readStoredInt('focusflow-timeleft', fallback);
  });
  const [isRunning, setIsRunning] = useState(() => {
    return localStorage.getItem('focusflow-isrunning') === 'true';
  });
  const [sessionsCompleted, setSessionsCompleted] = useState(() => (
    readStoredInt('focusflow-sessions', 0)
  ));
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(() => (
    readStoredInt('focusflow-focus-minutes', 0)
  ));
  const [cyclePosition, setCyclePosition] = useState(() => (
    readStoredInt('focusflow-cycle', 0)
  ));

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

  useEffect(() => {
    localStorage.setItem('focusflow-sessions-before-long-break', String(sessionsBeforeLongBreak));
  }, [sessionsBeforeLongBreak]);

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
      new Notification(title, { body, icon: '/favicon.png' });
    }
  }, []);

  // Ask for notification permission the first time the user actually starts
  // a session, so the browser prompt has a user-gesture context instead of
  // firing unsolicited on page load (where it's commonly auto-denied).
  const requestNotificationPermission = useCallback(() => {
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

      if (newCyclePos >= sessionsBeforeLongBreak) {
        // Long break after N sessions
        setCyclePosition(0);
        setPhase('longBreak');
        setTimeLeft(durations.longBreak * 60);
        sendBrowserNotification('Long Break!', `Great work! Take a ${durations.longBreak} minute break.`);
        showToast({ message: `Long break — ${durations.longBreak} min. You earned it.`, icon: <FiCoffee /> });
      } else {
        setCyclePosition(newCyclePos);
        setPhase('shortBreak');
        setTimeLeft(durations.shortBreak * 60);
        sendBrowserNotification('Short Break!', `Take a ${durations.shortBreak} minute break.`);
        showToast({ message: `Short break — ${durations.shortBreak} min`, icon: <FiCoffee /> });
      }

      if (autoStartBreaks) {
        setTimeout(() => setIsRunning(true), 500);
      }
    } else {
      // Break complete, go back to work
      setPhase('work');
      setTimeLeft(durations.work * 60);
      sendBrowserNotification('Focus Time!', 'Break is over. Let\'s get back to work!');
      showToast({ message: 'Back to focus time', icon: <FiTarget /> });
    }
  }, [phase, cyclePosition, durations, autoStartBreaks, sessionsBeforeLongBreak, playNotification, sendBrowserNotification, showToast]);

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

  const start = () => {
    requestNotificationPermission();
    setIsRunning(true);
  };
  const pause = () => setIsRunning(false);
  const toggle = () => {
    requestNotificationPermission();
    setIsRunning(prev => !prev);
  };

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
      sessionsBeforeLongBreak,
      setSessionsBeforeLongBreak,

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
