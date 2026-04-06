import { useTheme } from '../context/ThemeContext';
import { useTimer } from '../context/TimerContext';
import { FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsPanel({ isOpen, onClose }) {
  const { theme, setTheme, THEMES } = useTheme();
  const {
    durations,
    setDurations,
    autoStartBreaks,
    setAutoStartBreaks,
    soundEnabled,
    setSoundEnabled,
  } = useTimer();

  const handleDurationChange = (key, value) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num > 0 && num <= 120) {
      setDurations(prev => ({ ...prev, [key]: num }));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="settings-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          id="settings-overlay"
        >
          <motion.div
            className="settings-panel"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            id="settings-panel"
          >
            <div className="settings-header">
              <h2 className="settings-title">Settings</h2>
              <button className="settings-close" onClick={onClose} id="settings-close-btn">
                <FiX />
              </button>
            </div>

            {/* Theme */}
            <div className="settings-group">
              <div className="settings-group-title">Appearance</div>
              <div className="theme-selector">
                <button
                  className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => setTheme('light')}
                  id="theme-light-btn"
                >
                  <div className="theme-preview theme-preview-light" />
                  <span className="theme-option-label">Light</span>
                </button>
                <button
                  className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setTheme('dark')}
                  id="theme-dark-btn"
                >
                  <div className="theme-preview theme-preview-dark" />
                  <span className="theme-option-label">Dark</span>
                </button>
                <button
                  className={`theme-option ${theme === 'amoled' ? 'active' : ''}`}
                  onClick={() => setTheme('amoled')}
                  id="theme-amoled-btn"
                >
                  <div className="theme-preview theme-preview-amoled" />
                  <span className="theme-option-label">AMOLED</span>
                </button>
              </div>
            </div>

            {/* Timer Durations */}
            <div className="settings-group">
              <div className="settings-group-title">Timer Durations (minutes)</div>

              <div className="settings-row">
                <div>
                  <div className="settings-label">Focus</div>
                  <div className="settings-sublabel">Work session length</div>
                </div>
                <input
                  type="number"
                  className="settings-number-input"
                  value={durations.work}
                  onChange={(e) => handleDurationChange('work', e.target.value)}
                  min="1"
                  max="120"
                  id="setting-work-duration"
                />
              </div>

              <div className="settings-row">
                <div>
                  <div className="settings-label">Short Break</div>
                  <div className="settings-sublabel">Between work sessions</div>
                </div>
                <input
                  type="number"
                  className="settings-number-input"
                  value={durations.shortBreak}
                  onChange={(e) => handleDurationChange('shortBreak', e.target.value)}
                  min="1"
                  max="60"
                  id="setting-short-break-duration"
                />
              </div>

              <div className="settings-row">
                <div>
                  <div className="settings-label">Long Break</div>
                  <div className="settings-sublabel">After every 4 sessions</div>
                </div>
                <input
                  type="number"
                  className="settings-number-input"
                  value={durations.longBreak}
                  onChange={(e) => handleDurationChange('longBreak', e.target.value)}
                  min="1"
                  max="60"
                  id="setting-long-break-duration"
                />
              </div>
            </div>

            {/* Behavior */}
            <div className="settings-group">
              <div className="settings-group-title">Behavior</div>

              <div className="settings-row">
                <div>
                  <div className="settings-label">Auto-start Breaks</div>
                  <div className="settings-sublabel">Automatically begin break after focus</div>
                </div>
                <div
                  className={`toggle-switch ${autoStartBreaks ? 'active' : ''}`}
                  onClick={() => setAutoStartBreaks(!autoStartBreaks)}
                  id="toggle-autostart"
                  role="switch"
                  aria-checked={autoStartBreaks}
                />
              </div>

              <div className="settings-row">
                <div>
                  <div className="settings-label">Sound</div>
                  <div className="settings-sublabel">Play notification when session ends</div>
                </div>
                <div
                  className={`toggle-switch ${soundEnabled ? 'active' : ''}`}
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  id="toggle-sound"
                  role="switch"
                  aria-checked={soundEnabled}
                />
              </div>
            </div>

            {/* About */}
            <div className="settings-group">
              <div className="settings-group-title">About</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--text-secondary)' }}>PoMoDoRo v1.0</strong>
                <br />
                A beautiful Pomodoro timer designed for daily productivity.
                <br />
                Built with React & Vite.
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
