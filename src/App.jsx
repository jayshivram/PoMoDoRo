import { useState, useEffect } from 'react';
import { useTimer } from './context/TimerContext';
import Navbar from './components/Navbar';
import PhaseSelector from './components/PhaseSelector';
import TimerRing from './components/TimerRing';
import TimerControls from './components/TimerControls';
import StatsBar from './components/StatsBar';
import QuickActions from './components/QuickActions';
import TaskInput from './components/TaskInput';
import TaskList from './components/TaskList';
import SettingsPanel from './components/SettingsPanel';
import { FiCheckSquare } from 'react-icons/fi';

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { phase, isRunning, timeLeft, formatTime, phaseLabel } = useTimer();

  // Update document title with timer
  useEffect(() => {
    if (isRunning) {
      document.title = `${formatTime(timeLeft)} — ${phaseLabel} | PoMoDoRo`;
    } else {
      document.title = 'PoMoDoRo — Focus Timer';
    }
  }, [isRunning, timeLeft, phaseLabel, formatTime]);

  return (
    <div className="app-container" id="app-container">
      <div className="app-bg-gradient" />
      <Navbar onOpenSettings={() => setSettingsOpen(true)} />

      <main className="main-content">
        {/* Timer Section */}
        <section className="timer-section animate-fade-in" id="timer-section">
          <PhaseSelector />
          <TimerRing />
          <TimerControls />
          <StatsBar />
          <QuickActions />
        </section>

        {/* Tasks Section */}
        <section className="tasks-section animate-fade-in" id="tasks-section" style={{ animationDelay: '0.1s' }}>
          <div className="section-header">
            <h2 className="section-title">
              <FiCheckSquare className="section-title-icon" />
              Today's Tasks
            </h2>
          </div>
          <TaskInput />
          <TaskList />
        </section>
      </main>

      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}

export default App;
