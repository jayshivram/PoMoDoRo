import { useTimer } from '../context/TimerContext';

export default function PhaseSelector() {
  const { phase, switchPhase } = useTimer();

  const phases = [
    { key: 'work', label: 'Focus' },
    { key: 'shortBreak', label: 'Short Break' },
    { key: 'longBreak', label: 'Long Break' },
  ];

  return (
    <div className="phase-selector" id="phase-selector">
      {phases.map(p => (
        <button
          key={p.key}
          className={`phase-btn ${phase === p.key ? 'active' : ''}`}
          data-phase={p.key}
          onClick={() => switchPhase(p.key)}
          id={`phase-btn-${p.key}`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
