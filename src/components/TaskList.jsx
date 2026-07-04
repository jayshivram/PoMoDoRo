import { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { FiCheck, FiTrash2, FiTarget, FiClipboard, FiEdit2, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function TaskList() {
  const {
    getFilteredTasks,
    activeTaskId,
    toggleTask,
    removeTask,
    setAsActive,
    updateTask,
    filter,
    setFilter,
    completedCount,
    totalCount,
    clearCompleted,
  } = useTasks();

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const filteredTasks = getFilteredTasks();

  const startEditing = (task) => {
    setEditingId(task.id);
    setEditText(task.text);
  };

  const commitEdit = () => {
    const trimmed = editText.trim();
    if (trimmed) {
      updateTask(editingId, { text: trimmed });
    }
    setEditingId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="task-filters" id="task-filters">
        {[
          { key: 'all', label: `All (${totalCount})` },
          { key: 'active', label: `Active (${totalCount - completedCount})` },
          { key: 'completed', label: `Done (${completedCount})` },
        ].map(f => (
          <button
            key={f.key}
            className={`task-filter-btn ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
            id={`filter-${f.key}`}
          >
            {f.label}
          </button>
        ))}
        {completedCount > 0 && (
          <button
            className="task-filter-btn"
            onClick={clearCompleted}
            style={{ marginLeft: 'auto' }}
            id="clear-completed-btn"
          >
            Clear done
          </button>
        )}
      </div>

      {/* Task List */}
      <div className="task-list" id="task-list">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length === 0 && (
            <motion.div
              className="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <FiClipboard className="empty-state-icon" />
              <div className="empty-state-text">
                {filter === 'completed' ? 'No completed tasks yet' : 'No tasks for today'}
              </div>
              <div className="empty-state-subtext">
                {filter === 'all' ? 'Add a task above to get started!' : ''}
              </div>
            </motion.div>
          )}

          {filteredTasks.map(task => {
            const isEditing = editingId === task.id;
            return (
              <motion.div
                key={task.id}
                className={`task-item ${activeTaskId === task.id ? 'active-task' : ''}`}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                {/* Checkbox */}
                <button
                  className={`task-checkbox ${task.completed ? 'checked' : ''}`}
                  onClick={() => toggleTask(task.id)}
                  aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                >
                  {task.completed && <FiCheck size={12} />}
                </button>

                {/* Text & Category */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {isEditing ? (
                    <input
                      type="text"
                      className="task-edit-input"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onBlur={commitEdit}
                      onKeyDown={handleEditKeyDown}
                      aria-label="Edit task text"
                      autoFocus
                    />
                  ) : (
                    <div
                      className={`task-text ${task.completed ? 'completed' : ''}`}
                      onDoubleClick={() => !task.completed && startEditing(task)}
                    >
                      {task.text}
                    </div>
                  )}
                  <span className={`task-category ${task.category}`}>
                    {task.category}
                  </span>
                </div>

                {/* Pomodoro progress dots */}
                <div className="task-pomodoros" title={`${task.completedPomodoros}/${task.estimatedPomodoros} pomodoros`}>
                  {Array.from({ length: task.estimatedPomodoros }, (_, i) => (
                    <span
                      key={i}
                      className={`task-pomodoro-dot ${i < task.completedPomodoros ? 'filled' : ''}`}
                    />
                  ))}
                </div>

                {/* Actions */}
                {isEditing ? (
                  <div className="task-actions always-visible">
                    <button
                      className="task-action-btn set-active"
                      onClick={commitEdit}
                      title="Save"
                      aria-label="Save task"
                    >
                      <FiCheck size={14} />
                    </button>
                    <button
                      className="task-action-btn delete"
                      onClick={cancelEdit}
                      title="Cancel"
                      aria-label="Cancel edit"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ) : (
                  <div className={`task-actions ${activeTaskId === task.id ? 'always-visible' : ''}`}>
                    <button
                      className="task-action-btn"
                      onClick={() => startEditing(task)}
                      title="Edit task"
                      aria-label="Edit task"
                    >
                      <FiEdit2 size={13} />
                    </button>
                    <button
                      className={`task-action-btn set-active ${activeTaskId === task.id ? 'active' : ''}`}
                      onClick={() => setAsActive(task.id)}
                      title={activeTaskId === task.id ? 'Unset as active' : 'Set as active task'}
                      aria-label="Set as active task"
                    >
                      <FiTarget size={14} />
                    </button>
                    <button
                      className="task-action-btn delete"
                      onClick={() => removeTask(task.id)}
                      title="Delete task"
                      aria-label="Delete task"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
