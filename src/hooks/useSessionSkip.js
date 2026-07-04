import { useTimer } from '../context/TimerContext';
import { useTasks } from '../context/TaskContext';

// Skipping a work session should count toward the active task's pomodoro
// estimate, same as letting it run out naturally. Shared between the
// on-screen skip button and the "N" keyboard shortcut.
export function useSessionSkip() {
  const { phase, skipToNext } = useTimer();
  const { activeTask, incrementPomodoro } = useTasks();

  return () => {
    if (phase === 'work' && activeTask) {
      incrementPomodoro(activeTask.id);
    }
    skipToNext();
  };
}
