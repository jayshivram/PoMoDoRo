import { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FiTrash2, FiCheckCircle } from 'react-icons/fi';
import { useToast } from './ToastContext';

const TaskContext = createContext();

const CATEGORIES = ['work', 'personal', 'study', 'health'];

function getStorageKey() {
  return `focusflow-tasks-persistent`;
}

export function TaskProvider({ children }) {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState(() => {
    const stored = localStorage.getItem(getStorageKey());
    return stored ? JSON.parse(stored) : [];
  });
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, completed

  // Persist tasks
  useEffect(() => {
    localStorage.setItem(getStorageKey(), JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (text, category = 'work', estimatedPomodoros = 1) => {
    if (!text.trim()) return;
    const newTask = {
      id: uuidv4(),
      text: text.trim(),
      category,
      estimatedPomodoros,
      completedPomodoros: 0,
      completed: false,
      createdAt: Date.now(),
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  };

  const removeTask = (id) => {
    const removedTask = tasks.find(t => t.id === id);
    if (!removedTask) return;

    setTasks(prev => prev.filter(t => t.id !== id));
    if (activeTaskId === id) setActiveTaskId(null);

    showToast({
      message: `Deleted "${removedTask.text}"`,
      icon: <FiTrash2 />,
      actionLabel: 'Undo',
      onAction: () => setTasks(prev => [removedTask, ...prev]),
    });
  };

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const incrementPomodoro = (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const completedPomodoros = task.completedPomodoros + 1;
    const justFinished = !task.completed && completedPomodoros >= task.estimatedPomodoros;

    setTasks(prev => prev.map(t =>
      t.id === id
        ? { ...t, completedPomodoros, completed: t.completed || completedPomodoros >= t.estimatedPomodoros }
        : t
    ));

    if (justFinished) {
      showToast({
        message: `"${task.text}" complete — nice work!`,
        icon: <FiCheckCircle />,
      });
    }
  };

  const setAsActive = (id) => {
    setActiveTaskId(activeTaskId === id ? null : id);
  };

  const updateTask = (id, updates) => {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, ...updates } : t
    ));
  };

  const clearCompleted = () => {
    const removed = tasks.filter(t => t.completed);
    if (removed.length === 0) return;

    setTasks(prev => prev.filter(t => !t.completed));

    showToast({
      message: `Cleared ${removed.length} completed task${removed.length > 1 ? 's' : ''}`,
      icon: <FiTrash2 />,
      actionLabel: 'Undo',
      onAction: () => setTasks(prev => [...removed, ...prev]),
    });
  };

  const resetData = () => {
    setTasks([]);
    setActiveTaskId(null);
  };

  const getFilteredTasks = () => {
    switch (filter) {
      case 'active': return tasks.filter(t => !t.completed);
      case 'completed': return tasks.filter(t => t.completed);
      default: return tasks;
    }
  };

  const activeTask = tasks.find(t => t.id === activeTaskId) || null;
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;

  return (
    <TaskContext.Provider value={{
      tasks,
      activeTaskId,
      activeTask,
      filter,
      setFilter,
      completedCount,
      totalCount,
      categories: CATEGORIES,

      addTask,
      removeTask,
      toggleTask,
      incrementPomodoro,
      setAsActive,
      updateTask,
      clearCompleted,
      getFilteredTasks,
      resetData,
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within TaskProvider');
  return ctx;
}
