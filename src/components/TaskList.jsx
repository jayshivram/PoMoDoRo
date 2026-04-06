import { useTasks } from '../context/TaskContext';
import { FiCheck, FiTrash2, FiTarget } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function TaskList() {
  const {
    getFilteredTasks,
    activeTaskId,
    toggleTask,
    removeTask,
    setAsActive,
    filter,
    setFilter,
    completedCount,
    totalCount,
    clearCompleted,
  } = useTasks();

  const filteredTasks = getFilteredTasks();

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
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-text">
                {filter === 'completed' ? 'No completed tasks yet' : 'No tasks for today'}
              </div>
              <div className="empty-state-subtext">
                {filter === 'all' ? 'Add a task above to get started!' : ''}
              </div>
            </motion.div>
          )}

          {filteredTasks.map(task => (
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
                <div className={`task-text ${task.completed ? 'completed' : ''}`}>
                  {task.text}
                </div>
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
              <div className="task-actions">
                <button
                  className="task-action-btn set-active"
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
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
