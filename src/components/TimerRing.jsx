import { useTimer } from '../context/TimerContext';
import { useTasks } from '../context/TaskContext';
import { useMemo } from 'react';
import { FiTarget } from 'react-icons/fi';

const TICK_COUNT = 60;

export default function TimerRing() {
  const { timeLeft, formatTime, progress, phase, phaseLabel, cyclePosition, sessionsBeforeLongBreak } = useTimer();
  const { activeTask } = useTasks();

  const SIZE = 300;
  const STROKE = 8;
  const CENTER = SIZE / 2;
  const RADIUS = CENTER - STROKE * 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  const phaseColor = useMemo(() => {
    switch (phase) {
      case 'shortBreak': return 'var(--phase-short-break)';
      case 'longBreak': return 'var(--phase-long-break)';
      default: return 'var(--phase-work)';
    }
  }, [phase]);

  // Progress indicator dot travels along the arc, like a clock hand tip
  const dotAngle = progress * 360 - 90;
  const dotX = CENTER + RADIUS * Math.cos((dotAngle * Math.PI) / 180);
  const dotY = CENTER + RADIUS * Math.sin((dotAngle * Math.PI) / 180);

  const ticks = useMemo(() => Array.from({ length: TICK_COUNT }, (_, i) => {
    const isMajor = i % 5 === 0;
    return { i, isMajor, angle: i * (360 / TICK_COUNT) };
  }), []);

  const sessionDots = Array.from({ length: sessionsBeforeLongBreak }, (_, i) => i < cyclePosition);

  return (
    <div className="timer-container" id="timer-container">
      <svg className="timer-svg" viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {/* Background track */}
        <circle className="timer-track" cx={CENTER} cy={CENTER} r={RADIUS} />

        {/* Tick marks — analog dial */}
        {ticks.map(({ i, isMajor, angle }) => (
          <line
            key={i}
            className={`timer-tick ${isMajor ? 'major' : ''}`}
            x1={CENTER}
            y1={CENTER - (RADIUS - (isMajor ? 22 : 18))}
            x2={CENTER}
            y2={CENTER - (RADIUS - 10)}
            transform={`rotate(${angle} ${CENTER} ${CENTER})`}
          />
        ))}

        {/* Progress arc */}
        <circle
          className="timer-progress"
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          stroke={phaseColor}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
        />

        {/* Progress tip marker */}
        {progress > 0.01 && (
          <circle
            className="timer-progress-dot"
            cx={dotX}
            cy={dotY}
            r={STROKE * 0.85}
            fill={phaseColor}
            stroke="var(--bg-primary)"
            strokeWidth="2"
            transform={`rotate(90 ${CENTER} ${CENTER})`}
          />
        )}
      </svg>

      <div className="timer-inner">
        <span className="timer-phase-label" style={{ background: phaseColor }}>
          {phaseLabel}
        </span>
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
            Round {cyclePosition + 1}/{sessionsBeforeLongBreak}
          </span>
        </div>
        {activeTask && (
          <span className="timer-active-task">
            <FiTarget size={11} />
            {activeTask.text}
          </span>
        )}
      </div>
    </div>
  );
}
