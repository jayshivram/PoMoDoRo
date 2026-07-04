import { useState, useEffect } from 'react';
import { useTimer } from './context/TimerContext';
import { useSessionSkip } from './hooks/useSessionSkip';
import Navbar from './components/Navbar';
import PhaseSelector from './components/PhaseSelector';
import DurationPresets from './components/DurationPresets';
import TimerRing from './components/TimerRing';
import TimerControls from './components/TimerControls';
import StatsBar from './components/StatsBar';
import QuickActions from './components/QuickActions';
import TaskInput from './components/TaskInput';
import TaskList from './components/TaskList';
import Pastebin from './components/Pastebin';
import SettingsPanel from './components/SettingsPanel';

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { isRunning, timeLeft, formatTime, phaseLabel, durations, toggle, reset } = useTimer();
  const skipToNext = useSessionSkip();

  // Update document title with timer
  useEffect(() => {
    if (isRunning) {
      document.title = `${formatTime(timeLeft)} — ${phaseLabel} | PoMoDoRo`;
    } else {
      document.title = 'PoMoDoRo — Focus Timer';
    }
  }, [isRunning, timeLeft, phaseLabel, formatTime]);

  // Keyboard shortcuts: Space = start/pause, R = reset, N = skip.
  // Disabled while typing in a field or while the settings modal is open.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (settingsOpen) return;
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) return;

      if (e.code === 'Space') {
        e.preventDefault();
        toggle();
      } else if (e.code === 'KeyR') {
        reset();
      } else if (e.code === 'KeyN') {
        skipToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settingsOpen, toggle, reset, skipToNext]);

  return (
    <div className="app-container" id="app-container">
      <div className="app-bg-gradient" />
      <div className="app-grain" />
      <Navbar onOpenSettings={() => setSettingsOpen(true)} />

      <main className="main-content">
        {/* Timer Section */}
        <section className="timer-section animate-fade-in" id="timer-section">
          <div className="section-kicker">
            <span className="kicker-index">01</span>
            <h2 className="section-title">Focus Session</h2>
          </div>
          <PhaseSelector />
          <DurationPresets />
          <TimerRing />
          <TimerControls />
          <StatsBar />
          <QuickActions />
        </section>

        <div className="content-stack">
          {/* Tasks Section */}
          <section className="tasks-section animate-fade-in" id="tasks-section" style={{ animationDelay: '0.1s' }}>
            <div className="section-header">
              <div className="section-kicker">
                <span className="kicker-index">02</span>
                <h2 className="section-title">Today's Tasks</h2>
              </div>
            </div>
            <TaskInput />
            <TaskList />
          </section>

          {/* Scratch Pad Section */}
          <section className="pastebin-section animate-fade-in" id="pastebin-section" style={{ animationDelay: '0.2s' }}>
            <div className="section-header">
              <div className="section-kicker">
                <span className="kicker-index">03</span>
                <h2 className="section-title">Scratch Pad</h2>
              </div>
            </div>
            <Pastebin />
          </section>
        </div>
      </main>

      <footer className="footer">
        <span className="footer-mark">{durations.work} · {durations.shortBreak} · {durations.longBreak}</span>
        <span>Crafted for deep work</span>
      </footer>

      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}

export default App;
