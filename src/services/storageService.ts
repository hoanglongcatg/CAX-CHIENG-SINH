import { Department, Officer, Task, NotificationItem, TaskStats, DepartmentStats, TaskStatus } from '../types';
import { INITIAL_DEPARTMENTS, INITIAL_OFFICERS, INITIAL_TASKS, INITIAL_NOTIFICATIONS } from '../data/mockData';

const TASKS_KEY = 'cax_chiengsinh_tasks_v2';
const DEPARTMENTS_KEY = 'cax_chiengsinh_departments_v2';
const OFFICERS_KEY = 'cax_chiengsinh_officers_v2';
const NOTIFICATIONS_KEY = 'cax_chiengsinh_notifications_v2';

// Format YYYY-MM-DD
export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Calculate days difference (dueDate - today)
export function getDaysDifference(dueDateStr: string): number {
  const today = new Date(getTodayString());
  const due = new Date(dueDateStr);
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Automatically evaluate overdue state
export function processTasksOverdueStatus(tasks: Task[]): Task[] {
  const today = getTodayString();

  return tasks.map(task => {
    // If completed or on hold, keep original status
    if (task.status === 'completed' || task.status === 'on_hold') {
      return task;
    }

    // Check if overdue
    if (task.dueDate < today) {
      return {
        ...task,
        status: 'overdue' as TaskStatus
      };
    } else if (task.status === 'overdue' && task.dueDate >= today) {
      // Reverted or updated deadline
      return {
        ...task,
        status: task.progress > 0 ? 'in_progress' : 'todo'
      };
    }

    return task;
  });
}

export function loadDepartments(): Department[] {
  try {
    const data = localStorage.getItem(DEPARTMENTS_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Lỗi đọc danh mục phòng ban:', e);
  }
  return INITIAL_DEPARTMENTS;
}

export function saveDepartments(depts: Department[]): void {
  localStorage.setItem(DEPARTMENTS_KEY, JSON.stringify(depts));
}

export function loadOfficers(): Officer[] {
  try {
    const data = localStorage.getItem(OFFICERS_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Lỗi đọc danh sách cán bộ:', e);
  }
  return INITIAL_OFFICERS;
}

export function saveOfficers(officers: Officer[]): void {
  localStorage.setItem(OFFICERS_KEY, JSON.stringify(officers));
}

export function loadTasks(): Task[] {
  try {
    const data = localStorage.getItem(TASKS_KEY);
    let tasks: Task[] = data ? JSON.parse(data) : INITIAL_TASKS;
    tasks = processTasksOverdueStatus(tasks);
    saveTasks(tasks);
    return tasks;
  } catch (e) {
    console.error('Lỗi đọc danh sách công việc:', e);
    return processTasksOverdueStatus(INITIAL_TASKS);
  }
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function loadNotifications(): NotificationItem[] {
  try {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Lỗi đọc danh sách thông báo:', e);
  }
  return INITIAL_NOTIFICATIONS;
}

export function saveNotifications(notifs: NotificationItem[]): void {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
}

// Compute aggregate statistics
export function calculateTaskStats(tasks: Task[]): TaskStats {
  const total = tasks.length;
  if (total === 0) {
    return {
      total: 0, completed: 0, inProgress: 0, todo: 0, onHold: 0, overdue: 0, dueSoon: 0, completionRate: 0, overdueRate: 0
    };
  }

  const today = getTodayString();
  let completed = 0;
  let inProgress = 0;
  let todo = 0;
  let onHold = 0;
  let overdue = 0;
  let dueSoon = 0;

  tasks.forEach(t => {
    if (t.status === 'completed') completed++;
    else if (t.status === 'on_hold') onHold++;
    else if (t.dueDate < today) overdue++;
    else {
      if (t.status === 'in_progress') inProgress++;
      else todo++;

      const days = getDaysDifference(t.dueDate);
      if (days >= 0 && days <= 2) {
        dueSoon++;
      }
    }
  });

  const completionRate = Math.round((completed / total) * 100);
  const overdueRate = Math.round((overdue / total) * 100);

  return {
    total,
    completed,
    inProgress,
    todo,
    onHold,
    overdue,
    dueSoon,
    completionRate,
    overdueRate
  };
}

export function calculateDepartmentStats(tasks: Task[], depts: Department[]): DepartmentStats[] {
  const today = getTodayString();

  return depts.map(dept => {
    const deptTasks = tasks.filter(t => t.departmentId === dept.id);
    const total = deptTasks.length;
    let completed = 0;
    let inProgress = 0;
    let overdue = 0;

    deptTasks.forEach(t => {
      if (t.status === 'completed') completed++;
      else if (t.dueDate < today && t.status !== 'on_hold') overdue++;
      else if (t.status === 'in_progress') inProgress++;
    });

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      departmentId: dept.id,
      departmentName: dept.name,
      total,
      completed,
      inProgress,
      overdue,
      completionRate
    };
  });
}
