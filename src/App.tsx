/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Task, Department, Officer, NotificationItem, ViewMode, TaskStatus } from './types';
import { 
  loadTasks, 
  saveTasks, 
  loadDepartments, 
  loadOfficers, 
  saveOfficers,
  loadNotifications, 
  saveNotifications, 
  calculateTaskStats, 
  calculateDepartmentStats,
  getTodayString
} from './services/storageService';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { TaskList } from './components/TaskList';
import { KanbanBoard } from './components/KanbanBoard';
import { TaskModal } from './components/TaskModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { ReportCenter } from './components/ReportCenter';
import { CheckCircle2, AlertCircle, Send, X } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');

  // Core Data States
  const [tasks, setTasks] = useState<Task[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<Task | null>(null);

  // Toast alert feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initial Data Loading
  useEffect(() => {
    const loadedTasks = loadTasks();
    const loadedDepts = loadDepartments();
    const loadedOffs = loadOfficers();
    const loadedNotifs = loadNotifications();

    setTasks(loadedTasks);
    setDepartments(loadedDepts);
    setOfficers(loadedOffs);
    setNotifications(loadedNotifs);
  }, []);

  // Show Toast Alert helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Stats computation
  const stats = calculateTaskStats(tasks);
  const departmentStats = calculateDepartmentStats(tasks, departments);
  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  // Officer Handlers
  const handleAddOfficer = (newOfficer: Officer) => {
    const updated = [...officers, newOfficer];
    setOfficers(updated);
    saveOfficers(updated);
    showToast(`👤 Đã thêm cán bộ mới [${newOfficer.name}] vào ${newOfficer.departmentName}!`);
  };

  const handleUpdateOfficer = (updatedOfficer: Officer) => {
    const updated = officers.map(o => o.id === updatedOfficer.id ? updatedOfficer : o);
    setOfficers(updated);
    saveOfficers(updated);

    // Also update tasks where this officer is assigned to keep names/emails in sync
    const updatedTasks = tasks.map(t => {
      if (t.assigneeId === updatedOfficer.id) {
        return {
          ...t,
          assigneeName: updatedOfficer.name,
          assigneeEmail: updatedOfficer.email
        };
      }
      return t;
    });
    setTasks(updatedTasks);
    saveTasks(updatedTasks);

    showToast(`✏️ Đã cập nhật thông tin cán bộ [${updatedOfficer.name}]!`);
  };

  // Task Handlers
  const handleSaveTask = (taskData: Partial<Task>) => {
    let updatedTasks: Task[];

    if (taskData.id) {
      // Edit existing
      updatedTasks = tasks.map(t => t.id === taskData.id ? { ...t, ...taskData } as Task : t);
      showToast(`✅ Đã cập nhật thông tin công việc [${taskData.code}] thành công!`);
    } else {
      // Create new
      const newTask = {
        ...taskData,
        id: `task-${Date.now()}`
      } as Task;
      updatedTasks = [newTask, ...tasks];
      showToast(`🎉 Đã giao công việc mới [${newTask.code}] thành công!`);

      // Auto create assignment email notification
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        taskId: newTask.id,
        taskCode: newTask.code,
        taskTitle: newTask.title,
        recipientType: 'officer',
        recipientName: newTask.assigneeName,
        recipientEmail: newTask.assigneeEmail,
        type: 'assignment',
        title: `📧 THÔNG BÁO GIAO VIỆC MỚI: ${newTask.code} - ${newTask.title}`,
        content: `Đồng chí được giao phụ trách thực hiện công việc "${newTask.title}". Thời hạn hoàn thành: ${newTask.dueDate}. Yêu cầu tập trung triển khai đúng tiến độ.`,
        sentAt: `${getTodayString()} ${new Date().toLocaleTimeString('vi-VN')}`,
        read: false,
        isEmailSent: true
      };

      const updatedNotifs = [newNotif, ...notifications];
      setNotifications(updatedNotifs);
      saveNotifications(updatedNotifs);
    }

    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    showToast('🗑️ Đã xóa công việc khỏi hệ thống.');
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: newStatus,
          progress: newStatus === 'completed' ? 100 : t.progress,
          completedAt: newStatus === 'completed' ? getTodayString() : t.completedAt
        };
      }
      return t;
    });

    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    showToast(newStatus === 'completed' ? '🎉 Đã xác nhận hoàn thành công việc!' : '✅ Đã cập nhật trạng thái.');
  };

  const handleUpdateTaskProgress = (taskId: string, newProgress: number, newNotes?: string) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        const isDone = newProgress === 100;
        return {
          ...t,
          progress: newProgress,
          status: isDone ? ('completed' as TaskStatus) : (newProgress > 0 ? ('in_progress' as TaskStatus) : t.status),
          notes: newNotes !== undefined ? newNotes : t.notes,
          completedAt: isDone ? getTodayString() : t.completedAt
        };
      }
      return t;
    });

    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    showToast(`✅ Đã cập nhật tiến độ ${newProgress}% thành công!`);
  };

  // Trigger Instant Email Reminder
  const handleSendReminderEmail = (task: Task) => {
    const isOverdue = task.status === 'overdue' || (task.dueDate < getTodayString() && task.status !== 'completed');

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      taskId: task.id,
      taskCode: task.code,
      taskTitle: task.title,
      recipientType: 'officer',
      recipientName: task.assigneeName,
      recipientEmail: task.assigneeEmail,
      type: isOverdue ? 'overdue_warning' : 'reminder',
      title: isOverdue 
        ? `⚠️ CẢNH BÁO ĐỎ CÔNG VIỆC QUÁ HẠN: ${task.code} - ${task.title}` 
        : `⏰ THƯ ĐÔN ĐỐC TIẾN ĐỘ: ${task.code} - ${task.title}`,
      content: isOverdue 
        ? `CẢNH BÁO: Công việc "${task.title}" (Mã ${task.code}) đã vượt quá thời hạn hoàn thành quy định (${task.dueDate}). Đề nghị đồng chí khẩn trương báo cáo và khắc phục tiến độ.` 
        : `Thư đôn đốc: Công việc "${task.title}" sắp đến hạn hoàn thành (${task.dueDate}). Đề nghị đồng chí rà soát và gửi sản phẩm đúng hạn.`,
      sentAt: `${getTodayString()} ${new Date().toLocaleTimeString('vi-VN')}`,
      read: false,
      isEmailSent: true
    };

    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    saveNotifications(updatedNotifs);

    showToast(`📬 Đã phát hành thư đôn đốc gửi trực tiếp tới [${task.assigneeEmail}]!`);
  };

  const handleSendCustomNotification = (notifData: Omit<NotificationItem, 'id' | 'sentAt' | 'read' | 'isEmailSent'>) => {
    const newNotif: NotificationItem = {
      ...notifData,
      id: `notif-${Date.now()}`,
      sentAt: `${getTodayString()} ${new Date().toLocaleTimeString('vi-VN')}`,
      read: false,
      isEmailSent: true
    };

    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    saveNotifications(updatedNotifs);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onSelectView={setCurrentView}
        stats={stats}
        onOpenCreateModal={() => {
          setTaskToEdit(null);
          setIsTaskModalOpen(true);
        }}
        unreadNotifsCount={unreadNotifsCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentView === 'dashboard' && (
          <Dashboard
            tasks={tasks}
            departments={departments}
            stats={stats}
            departmentStats={departmentStats}
            onSelectTask={setSelectedTaskDetail}
            onSendReminderEmail={handleSendReminderEmail}
            onNavigateToTable={() => setCurrentView('table')}
            onNavigateToReports={() => setCurrentView('reports')}
          />
        )}

        {currentView === 'table' && (
          <TaskList
            tasks={tasks}
            departments={departments}
            onSelectTask={setSelectedTaskDetail}
            onEditTask={(task) => {
              setTaskToEdit(task);
              setIsTaskModalOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
            onSendReminderEmail={handleSendReminderEmail}
            onUpdateProgress={handleUpdateTaskProgress}
            onOpenCreateModal={() => {
              setTaskToEdit(null);
              setIsTaskModalOpen(true);
            }}
          />
        )}

        {currentView === 'kanban' && (
          <KanbanBoard
            tasks={tasks}
            onSelectTask={setSelectedTaskDetail}
            onUpdateStatus={handleUpdateTaskStatus}
            onSendReminderEmail={handleSendReminderEmail}
          />
        )}

        {currentView === 'notifications' && (
          <NotificationCenterModal
            notifications={notifications}
            officers={officers}
            departments={departments}
            tasks={tasks}
            onSendCustomNotification={handleSendCustomNotification}
            onClearNotifications={() => {
              setNotifications([]);
              saveNotifications([]);
            }}
          />
        )}

        {currentView === 'reports' && (
          <ReportCenter
            tasks={tasks}
            departments={departments}
          />
        )}
      </main>

      {/* Task Create / Edit Dialog */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        departments={departments}
        officers={officers}
        onAddOfficer={handleAddOfficer}
        onUpdateOfficer={handleUpdateOfficer}
      />

      {/* Task Detail Inspector Modal */}
      <TaskDetailModal
        task={selectedTaskDetail}
        onClose={() => setSelectedTaskDetail(null)}
        onEdit={(task) => {
          setTaskToEdit(task);
          setIsTaskModalOpen(true);
        }}
        onSendEmail={handleSendReminderEmail}
        onUpdateStatus={handleUpdateTaskStatus}
      />

      {/* Toast Notification Alert Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-slate-700 flex items-center space-x-3 animate-slide-up">
          <Send className="w-5 h-5 text-blue-400" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
