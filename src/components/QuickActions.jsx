import { useTimer } from '../context/TimerContext';
import { FiVolume2, FiVolumeX, FiZap } from 'react-icons/fi';
import { HiOutlineBolt } from 'react-icons/hi2';

export default function QuickActions() {
  const { soundEnabled, setSoundEnabled, autoStartBreaks, setAutoStartBreaks } = useTimer();

  return (
    <div className="quick-actions" id="quick-actions">
      <button
        className={`quick-action-btn ${soundEnabled ? 'active' : ''}`}
        onClick={() => setSoundEnabled(!soundEnabled)}
        id="sound-toggle"
      >
        {soundEnabled ? <FiVolume2 size={14} /> : <FiVolumeX size={14} />}
        Sound {soundEnabled ? 'On' : 'Off'}
      </button>

      <button
        className={`quick-action-btn ${autoStartBreaks ? 'active' : ''}`}
        onClick={() => setAutoStartBreaks(!autoStartBreaks)}
        id="auto-break-toggle"
      >
        <HiOutlineBolt size={14} />
        Auto-break {autoStartBreaks ? 'On' : 'Off'}
      </button>
    </div>
  );
}
