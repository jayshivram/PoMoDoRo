import { useTimer } from '../context/TimerContext';
import { FiTarget, FiClock, FiZap } from 'react-icons/fi';

export default function StatsBar() {
  const { sessionsCompleted, totalFocusMinutes } = useTimer();

  const formatFocusTime = (mins) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div className="stats-bar" id="stats-bar">
      <div className="stat-card">
        <FiTarget className="stat-icon" />
        <span className="stat-value">{sessionsCompleted}</span>
        <span className="stat-label">Sessions</span>
      </div>
      <div className="stat-card">
        <FiClock className="stat-icon" />
        <span className="stat-value">{formatFocusTime(totalFocusMinutes)}</span>
        <span className="stat-label">Focus Time</span>
      </div>
      <div className="stat-card">
        <FiZap className="stat-icon" />
        <span className="stat-value">{Math.round(sessionsCompleted * 25 / 60 * 10) / 10 || 0}h</span>
        <span className="stat-label">Productive</span>
      </div>
    </div>
  );
}
