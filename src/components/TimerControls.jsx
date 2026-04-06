import { useTimer } from '../context/TimerContext';
import { useTasks } from '../context/TaskContext';
import { FiPlay, FiPause, FiRotateCcw, FiSkipForward } from 'react-icons/fi';

export default function TimerControls() {
  const { isRunning, toggle, reset, skipToNext, phase } = useTimer();
  const { activeTask, incrementPomodoro } = useTasks();

  const handleSkip = () => {
    // If we're in work phase and there's an active task, increment its pomodoro count
    if (phase === 'work' && activeTask) {
      incrementPomodoro(activeTask.id);
    }
    skipToNext();
  };

  return (
    <div className="timer-controls" id="timer-controls">
      <button
        className="control-btn control-btn-secondary"
        onClick={reset}
        title="Reset"
        id="reset-btn"
        aria-label="Reset timer"
      >
        <FiRotateCcw />
      </button>

      <button
        className="control-btn control-btn-primary"
        onClick={toggle}
        title={isRunning ? 'Pause' : 'Start'}
        id="start-pause-btn"
        aria-label={isRunning ? 'Pause timer' : 'Start timer'}
      >
        {isRunning ? <FiPause /> : <FiPlay style={{ marginLeft: '2px' }} />}
      </button>

      <button
        className="control-btn control-btn-secondary"
        onClick={handleSkip}
        title="Skip to next"
        id="skip-btn"
        aria-label="Skip to next phase"
      >
        <FiSkipForward />
      </button>
    </div>
  );
}
