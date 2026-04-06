import { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { FiPlus, FiMinus } from 'react-icons/fi';

export default function TaskInput() {
  const { addTask, categories } = useTasks();
  const [text, setText] = useState('');
  const [category, setCategory] = useState('work');
  const [estimatedPomos, setEstimatedPomos] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    addTask(text, category, estimatedPomos);
    setText('');
    setEstimatedPomos(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
      <div className="task-input-container">
        <input
          type="text"
          className="task-input"
          placeholder="What will you focus on today?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          id="task-input"
          aria-label="Task name"
        />
        <button
          type="submit"
          className="task-add-btn"
          id="add-task-btn"
          aria-label="Add task"
        >
          <FiPlus />
        </button>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <select
          className="category-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          id="category-select"
          aria-label="Task category"
        >
          {categories.map(c => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>

        <div className="pomo-estimate">
          <button
            type="button"
            className="pomo-estimate-btn"
            onClick={() => setEstimatedPomos(prev => Math.max(1, prev - 1))}
            aria-label="Decrease estimated pomodoros"
          >
            <FiMinus size={12} />
          </button>
          <span className="pomo-estimate-value">{estimatedPomos}</span>
          <button
            type="button"
            className="pomo-estimate-btn"
            onClick={() => setEstimatedPomos(prev => Math.min(10, prev + 1))}
            aria-label="Increase estimated pomodoros"
          >
            <FiPlus size={12} />
          </button>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginLeft: '2px' }}>🍅</span>
        </div>
      </div>
    </form>
  );
}
