import { useTimer } from '../context/TimerContext';
import { useSessionSkip } from '../hooks/useSessionSkip';
import { FiPlay, FiPause, FiRotateCcw, FiSkipForward } from 'react-icons/fi';

export default function TimerControls() {
  const { isRunning, toggle, reset } = useTimer();
  const handleSkip = useSessionSkip();

  return (
    <div className="timer-controls" id="timer-controls">
      <button
        className="control-btn control-btn-secondary"
        onClick={reset}
        title="Reset (R)"
        id="reset-btn"
        aria-label="Reset timer"
      >
        <FiRotateCcw />
      </button>

      <button
        className="control-btn control-btn-primary"
        onClick={toggle}
        title={isRunning ? 'Pause (Space)' : 'Start (Space)'}
        id="start-pause-btn"
        aria-label={isRunning ? 'Pause timer' : 'Start timer'}
      >
        {isRunning ? <FiPause /> : <FiPlay style={{ marginLeft: '2px' }} />}
      </button>

      <button
        className="control-btn control-btn-secondary"
        onClick={handleSkip}
        title="Skip to next (N)"
        id="skip-btn"
        aria-label="Skip to next phase"
      >
        <FiSkipForward />
      </button>
    </div>
  );
}
