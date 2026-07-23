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
import { LoginScreen } from './components/LoginScreen';
import { AiAssistantModal } from './components/AiAssistantModal';
import { sendTaskToGoogleSheets, fetchTasksFromGoogleSheets } from './services/googleSheetsService';
import { CheckCircle2, AlertCircle, Send, X } from 'lucide-react';

// Helper to deduplicate tasks by code and id
function deduplicateTasksList(taskList: Task[]): Task[] {
  if (!Array.isArray(taskList)) return [];
  const seenCodes = new Set<string>();
  const seenIds = new Set<string>();
  const result: Task[] = [];

  for (const task of taskList) {
    if (!task) continue;
    const codeKey = (task.code || '').trim().toLowerCase();
    const idKey = (task.id || '').trim().toLowerCase();

    if (!codeKey && !idKey) {
      result.push(task);
      continue;
    }

    const isCodeDup = codeKey ? seenCodes.has(codeKey) : false;
    const isIdDup = idKey ? seenIds.has(idKey) : false;

    if (isCodeDup || isIdDup) {
      continue;
    }

    if (codeKey) seenCodes.add(codeKey);
    if (idKey) seenIds.add(idKey);

    result.push(task);
  }

  return result;
}

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return !!localStorage.getItem('chiengsinh_police_user');
  });

  const handleAuthChange = React.useCallback((isAuth: boolean) => {
    setIsLoggedIn(isAuth);
  }, []);

  // Core Data States
  const [tasks, setTasks] = useState<Task[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<Task | null>(null);

  // Toast alert feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync tasks from Google Sheets helper
  const fetchAndSyncTasks = React.useCallback(async () => {
    const sheetTasks = await fetchTasksFromGoogleSheets();
    if (sheetTasks && sheetTasks.length > 0) {
      // Completely replace tasks state with Google Sheets data (no mock data)
      const cleanTasks = deduplicateTasksList(sheetTasks);
      setTasks(cleanTasks);
      saveTasks(cleanTasks);
      console.log('✅ [App] Đã đồng bộ thành công danh sách công việc từ Google Sheets');
    }
  }, []);

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

    // Auto load tasks from Google Sheets
    fetchAndSyncTasks();
  }, [fetchAndSyncTasks]);

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
      const raw = tasks.map(t => (t.id === taskData.id || t.code === taskData.code) ? { ...t, ...taskData } as Task : t);
      updatedTasks = deduplicateTasksList(raw);
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
      showToast(`✅ Đã cập nhật thông tin công việc [${taskData.code}] thành công!`);
      // Sync edits to Google Sheets
      sendTaskToGoogleSheets({ ...taskData });
    } else {
      // Create new
      const newTask = {
        ...taskData,
        id: taskData.code ? taskData.code : `task-${Date.now()}`
      } as Task;
      updatedTasks = deduplicateTasksList([newTask, ...tasks]);
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
      showToast(`🎉 Đã giao công việc mới [${newTask.code}] và đã lưu vào Google Sheets!`);

      // Post to Google Sheets Web App
      sendTaskToGoogleSheets(newTask);

      // Refresh from Google Sheets after a short delay
      setTimeout(() => {
        fetchAndSyncTasks();
      }, 3000);

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
  };

  const handleDeleteTask = (taskId: string) => {
    const currentUserStr = localStorage.getItem('chiengsinh_police_user');
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
    if (!currentUser || currentUser.username !== 'caxchiengsinh.db') {
      showToast('⚠️ Quyền hạn bị từ chối: Chỉ Trưởng Công an xã (caxchiengsinh.db) mới có quyền xóa công việc!');
      return;
    }

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

  // Lock interface if not logged in
  if (!isLoggedIn) {
    return (
      <LoginScreen
        onLoginSuccess={() => {
          setIsLoggedIn(true);
        }}
      />
    );
  }

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
        onAuthChange={handleAuthChange}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
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
            isLoggedIn={isLoggedIn}
            onRefreshFromSheets={async () => {
              showToast('🔄 Đang làm mới dữ liệu từ Google Sheets...');
              await fetchAndSyncTasks();
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
        existingTasksCount={tasks.length}
        existingTasks={tasks}
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

      {/* AI Assistant Drawer Modal */}
      <AiAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        tasks={tasks}
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
