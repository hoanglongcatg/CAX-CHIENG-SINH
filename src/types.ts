export type TaskPriority = 'normal' | 'important' | 'urgent' | 'critical';
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'on_hold' | 'overdue' | 'pending_approval';

export interface Department {
  id: string;
  name: string;
  code: string;
  managerName: string;
  email: string;
  phone: string;
  memberCount: number;
}

export interface Officer {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  departmentId: string;
  departmentName: string;
  avatarUrl?: string;
}

export interface Task {
  id: string;
  code: string;
  title: string;
  description: string;
  departmentId: string;
  departmentName: string;
  assigneeId: string;
  assigneeName: string;
  assigneeEmail: string;
  assignerName: string;
  startDate: string; // YYYY-MM-DD
  dueDate: string;   // YYYY-MM-DD
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;  // 0 - 100
  deliverable?: string; // Sản phẩm đầu ra
  notes?: string;       // Báo cáo tiến độ / Ghi chú
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  tags?: string[];
  // Quản lý phê duyệt hoàn thành sớm của Trưởng Công an xã
  approvalStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  isEarlyCompletion?: boolean;
  approvedBy?: string;
  approvedAt?: string;
  approvalNote?: string;
}

export interface NotificationItem {
  id: string;
  taskId?: string;
  taskCode?: string;
  taskTitle?: string;
  recipientType: 'officer' | 'department';
  recipientName: string;
  recipientEmail: string;
  type: 'assignment' | 'reminder' | 'overdue_warning' | 'completed' | 'progress_update' | 'approval_request' | 'approval_result';
  title: string;
  content: string;
  sentAt: string;
  read: boolean;
  isEmailSent: boolean;
}

export type ViewMode = 'dashboard' | 'table' | 'kanban' | 'notifications' | 'reports';

export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  onHold: number;
  overdue: number;
  pendingApproval: number; // Chờ Trưởng CAX phê duyệt hoàn thành sớm
  earlyCompleted: number;  // Số việc đã hoàn thành sớm
  dueSoon: number; // Trong vòng 48h
  completionRate: number; // %
  overdueRate: number;    // %
}

export interface DepartmentStats {
  departmentId: string;
  departmentName: string;
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  completionRate: number;
}
