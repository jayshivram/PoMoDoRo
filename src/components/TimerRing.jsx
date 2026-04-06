import { useTimer } from '../context/TimerContext';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import { useMemo } from 'react';

export default function TimerRing() {
  const { timeLeft, formatTime, progress, phase, phaseLabel, cyclePosition, isRunning } = useTimer();
  const { activeTask } = useTasks();
  const { theme } = useTheme();

  const SIZE = 300;
  const STROKE = 6;
  const CENTER = SIZE / 2;
  const RADIUS = CENTER - STROKE * 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  // Phase colors for the gradient
  const phaseColors = useMemo(() => {
    switch (phase) {
      case 'work': return { start: '#818cf8', end: '#6366f1' };
      case 'shortBreak': return { start: '#34d399', end: '#10b981' };
      case 'longBreak': return { start: '#60a5fa', end: '#3b82f6' };
      default: return { start: '#818cf8', end: '#6366f1' };
    }
  }, [phase]);

  // Session dots (show 4 dots for the cycle)
  const sessionDots = Array.from({ length: 4 }, (_, i) => i < cyclePosition);

  return (
    <div className="timer-container" id="timer-container">
      <svg className="timer-svg" viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <defs>
          <linearGradient id="gradient-ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={phaseColors.start} />
            <stop offset="100%" stopColor={phaseColors.end} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background track */}
        <circle
          className="timer-track"
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
        />

        {/* Progress ring */}
        <circle
          className="timer-progress"
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          stroke="url(#gradient-ring)"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          filter={isRunning ? "url(#glow)" : "none"}
        />
      </svg>

      <div className="timer-inner">
        <span className="timer-phase-label">{phaseLabel}</span>
        <span className="timer-display" id="timer-display">
          {formatTime(timeLeft)}
        </span>
        <div className="timer-session-count">
          {sessionDots.map((filled, i) => (
            <span
              key={i}
              className={`timer-session-dot ${filled ? 'filled' : ''}`}
            />
          ))}
          <span style={{ marginLeft: '4px' }}>
            Round {cyclePosition + 1}/4
          </span>
        </div>
        {activeTask && (
          <span style={{
            fontSize: '0.72rem',
            color: 'var(--text-tertiary)',
            marginTop: '4px',
            maxWidth: '200px',
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            🎯 {activeTask.text}
          </span>
        )}
      </div>
    </div>
  );
}
