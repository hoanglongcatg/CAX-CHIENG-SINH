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
export function normalizeDeptString(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[()]/g, '');
}

export function matchDepartment(
  taskDeptId?: string,
  taskDeptName?: string,
  targetDeptId?: string,
  targetDeptName?: string
): boolean {
  if (!targetDeptId && !targetDeptName) return false;

  // 1. Direct ID equality
  if (taskDeptId && targetDeptId && taskDeptId.trim().toLowerCase() === targetDeptId.trim().toLowerCase()) {
    return true;
  }

  const normTaskName = normalizeDeptString(taskDeptName || '');
  const normTaskId = normalizeDeptString(taskDeptId || '');
  const normTargetName = normalizeDeptString(targetDeptName || '');
  const normTargetId = normalizeDeptString(targetDeptId || '');

  const normTask = normTaskName || normTaskId;
  const normTarget = normTargetName || normTargetId;

  if (!normTask || !normTarget) return false;

  if (normTask === normTarget) return true;

  // Specific team keywords matching for Chiềng Sinh Police:
  // 1. Tổ Tổng hợp: "tổng hợp", "tth", "dept-1"
  if ((normTargetName.includes('tổng hợp') || normTargetId.includes('dept-1')) &&
      (normTask.includes('tổng hợp') || normTask.includes('tth'))) return true;

  // 2. Tổ An ninh: "an ninh", "tan", "dept-2"
  if ((normTargetName.includes('an ninh') || normTargetId.includes('dept-2')) &&
      (normTask.includes('an ninh') || normTask.includes('tan'))) return true;

  // 3. Tổ CSKV (Cảnh sát khu vực): "cskv", "cảnh sát khu vực", "dept-3"
  if ((normTargetName.includes('cskv') || normTargetName.includes('cảnh sát khu vực') || normTargetId.includes('dept-3')) &&
      (normTask.includes('cskv') || normTask.includes('cảnh sát khu vực'))) return true;

  // 4. Tổ PCTP (Phòng chống tội phạm): "pctp", "phòng chống tội phạm", "tội phạm", "dept-4"
  if ((normTargetName.includes('pctp') || normTargetName.includes('phòng chống tội phạm') || normTargetId.includes('dept-4')) &&
      (normTask.includes('pctp') || normTask.includes('phòng chống tội phạm') || normTask.includes('tội phạm'))) return true;

  // 5. Tổ CSTT (Cảnh sát trật tự): "cstt", "cảnh sát trật tự", "trật tự", "dept-5"
  if ((normTargetName.includes('cstt') || normTargetName.includes('cảnh sát trật tự') || normTargetId.includes('dept-5')) &&
      (normTask.includes('cstt') || normTask.includes('cảnh sát trật tự') || normTask.includes('trật tự'))) return true;

  // Fallback containment
  if (normTask.includes(normTargetName) || normTargetName.includes(normTask)) return true;

  return false;
}

export function calculateTaskStats(tasks: Task[]): TaskStats {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const total = safeTasks.length;
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

  safeTasks.forEach(t => {
    if (!t) return;
    const taskDueDate = t.dueDate || today;
    const isOverdue = t.status === 'overdue' || (taskDueDate < today && t.status !== 'completed' && t.status !== 'on_hold');

    if (t.status === 'completed') {
      completed++;
    } else if (t.status === 'on_hold') {
      onHold++;
    } else if (isOverdue) {
      overdue++;
    } else if (t.status === 'in_progress') {
      inProgress++;
      const days = getDaysDifference(taskDueDate);
      if (!isNaN(days) && days >= 0 && days <= 2) {
        dueSoon++;
      }
    } else {
      todo++;
      const days = getDaysDifference(taskDueDate);
      if (!isNaN(days) && days >= 0 && days <= 2) {
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
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeDepts = Array.isArray(depts) && depts.length > 0 ? depts : INITIAL_DEPARTMENTS;
  const today = getTodayString();

  return safeDepts.map(dept => {
    const deptTasks = safeTasks.filter(t => {
      if (!t) return false;
      return matchDepartment(t.departmentId, t.departmentName, dept.id, dept.name);
    });

    const total = deptTasks.length;
    let completed = 0;
    let inProgress = 0;
    let overdue = 0;

    deptTasks.forEach(t => {
      const taskDueDate = t.dueDate || today;
      const isOverdue = t.status === 'overdue' || (taskDueDate < today && t.status !== 'completed' && t.status !== 'on_hold');

      if (t.status === 'completed') {
        completed++;
      } else if (isOverdue) {
        overdue++;
      } else {
        inProgress++;
      }
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
