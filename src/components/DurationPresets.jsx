import { useState } from 'react';
import { useTimer } from '../context/TimerContext';
import { useToast } from '../context/ToastContext';

const PRESETS = {
  work: [15, 25, 45, 50, 90],
  shortBreak: [5, 10, 15],
  longBreak: [15, 20, 30],
};

const PHASE_NAMES = {
  work: 'Focus session',
  shortBreak: 'Short break',
  longBreak: 'Long break',
};

export default function DurationPresets() {
  const { phase, durations, setDurations, isRunning } = useTimer();
  const { showToast } = useToast();
  const [customValue, setCustomValue] = useState('');

  const presets = PRESETS[phase] || PRESETS.work;
  const activeValue = durations[phase];

  const applyDuration = (minutes) => {
    if (minutes === activeValue) return;
    setDurations(prev => ({ ...prev, [phase]: minutes }));
    showToast({
      message: isRunning
        ? `${PHASE_NAMES[phase]} set to ${minutes} min — applies next round`
        : `${PHASE_NAMES[phase]} set to ${minutes} min`,
    });
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const num = parseInt(customValue, 10);
    if (!isNaN(num) && num > 0 && num <= 180) {
      applyDuration(num);
      setCustomValue('');
    }
  };

  return (
    <div className="duration-presets" id="duration-presets">
      {presets.map(minutes => (
        <button
          key={minutes}
          type="button"
          className={`duration-preset-btn ${activeValue === minutes ? 'active' : ''}`}
          onClick={() => applyDuration(minutes)}
        >
          {minutes}m
        </button>
      ))}
      <form onSubmit={handleCustomSubmit} className="duration-custom-form">
        <input
          type="number"
          className="duration-custom-input"
          placeholder="Custom"
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          min="1"
          max="180"
          aria-label="Custom session length in minutes"
        />
      </form>
    </div>
  );
}
