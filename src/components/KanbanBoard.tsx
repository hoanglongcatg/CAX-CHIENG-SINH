import React from 'react';
import { Task, TaskStatus } from '../types';
import { getDaysDifference, getTodayString } from '../services/storageService';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  User, 
  Building2, 
  Calendar, 
  Send,
  ChevronRight,
  ChevronLeft,
  ShieldCheck
} from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onSendReminderEmail: (task: Task) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onSelectTask,
  onUpdateStatus,
  onSendReminderEmail
}) => {
  const today = getTodayString();

  const currentUserStr = localStorage.getItem('chiengsinh_police_user');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const isChiefOfPolice = currentUser?.username === 'caxchiengsinh.db';

  // Group tasks by status column
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const pendingApprovalTasks = tasks.filter(t => t.status === 'pending_approval' || t.approvalStatus === 'pending');
  const overdueTasks = tasks.filter(t => t.status === 'overdue' || (t.dueDate < today && t.status !== 'completed' && t.status !== 'pending_approval'));
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const renderTaskCard = (task: Task) => {
    const isOverdue = task.status === 'overdue' || (task.dueDate < today && task.status !== 'completed' && task.status !== 'pending_approval');
    const isPendingApproval = task.status === 'pending_approval' || task.approvalStatus === 'pending';
    const isEarlyApproved = task.approvalStatus === 'approved' || (task.status === 'completed' && task.isEarlyCompletion);
    const daysDiff = getDaysDifference(task.dueDate);

    return (
      <div 
        key={task.id}
        className={`bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
          isOverdue 
            ? 'border-red-400 bg-red-50/70 text-red-950' 
            : isPendingApproval 
            ? 'border-amber-400 bg-amber-50/80 text-amber-950' 
            : 'border-slate-200'
        }`}
      >
        <div>
          {/* Header Code & Badges */}
          <div className="flex items-center justify-between text-xs mb-2">
            <span className={`font-mono font-bold px-2 py-0.5 rounded ${
              isOverdue ? 'bg-red-200 text-red-900 border border-red-300' : isPendingApproval ? 'bg-amber-200 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-700'
            }`}>
              {task.code}
            </span>
            {isOverdue && (
              <span className="bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-pulse flex items-center space-x-1">
                <AlertTriangle className="w-3 h-3" />
                <span>QUÁ HẠN {Math.abs(daysDiff)} NGÀY</span>
              </span>
            )}
            {isPendingApproval && (
              <span className="bg-amber-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-pulse flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-amber-200" />
                <span>CHỜ CAX DUYỆT</span>
              </span>
            )}
            {isEarlyApproved && (
              <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-emerald-200" />
                <span>DUYỆT SỚM</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h4 
            onClick={() => onSelectTask(task)}
            className={`font-semibold text-sm cursor-pointer hover:underline line-clamp-2 ${
              isOverdue ? 'text-red-900 font-bold' : 'text-slate-900'
            }`}
          >
            {task.title}
          </h4>

          {/* Dept & Assignee */}
          <div className="mt-2.5 text-xs text-slate-600 space-y-1">
            <div className="flex items-center space-x-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="line-clamp-1">{task.departmentName}</span>
            </div>
            <div className="flex items-center space-x-1">
              <User className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-medium text-slate-800">{task.assigneeName}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Hạn: <strong className={isOverdue ? 'text-red-600' : 'text-slate-800'}>{task.dueDate}</strong></span>
            </div>
          </div>

          {/* Deliverables */}
          {task.deliverable && (
            <p className="mt-2 text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-200 line-clamp-2">
              📦 <strong className="text-slate-700">Sản phẩm:</strong> {task.deliverable}
            </p>
          )}
        </div>

        {/* Card Footer Actions */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
          {/* Progress bar */}
          <div className="w-20">
            <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-0.5">
              <span>Tiến độ</span>
              <span>{task.progress}%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-1.5 rounded-full ${isOverdue ? 'bg-red-600' : 'bg-blue-600'}`} 
                style={{ width: `${task.progress}%` }} 
              />
            </div>
          </div>

          {/* Quick Status Move buttons */}
          <div className="flex items-center space-x-1">
            {isOverdue && (
              <button
                onClick={() => onSendReminderEmail(task)}
                className="p-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-medium cursor-pointer"
                title="Gửi thư nhắc nhở đôn đốc"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            )}

            {task.status !== 'completed' && task.status !== 'pending_approval' && (
              <button
                onClick={() => onUpdateStatus(task.id, 'completed')}
                className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded cursor-pointer flex items-center space-x-1 shadow-sm transition-all active:scale-95"
                title="Báo hoàn thành nhiệm vụ cho tổ — Trình Trưởng CAX phê duyệt"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-200" />
                <span>Báo Hoàn Thành</span>
              </button>
            )}

            {isPendingApproval && isChiefOfPolice && (
              <button
                onClick={() => onUpdateStatus(task.id, 'completed')}
                className="px-2 py-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-[11px] font-extrabold rounded cursor-pointer flex items-center space-x-1 shadow animate-bounce"
                title="Trưởng Công an xã Phê duyệt hoàn thành"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Phê Duyệt</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-12">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">BẢNG KANBAN THEO DÕI TRẠNG THÁI TIẾN ĐỘ</h2>
          <p className="text-xs text-slate-500">Phân luồng trực quan các công việc theo tiến trình thực hiện</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {/* Column 1: Todo */}
        <div className="bg-slate-100 rounded-xl p-3 border border-slate-200 flex flex-col space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-300">
            <h3 className="font-bold text-slate-700 text-sm flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span>Chưa Thực Hiện</span>
            </h3>
            <span className="bg-slate-200 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {todoTasks.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
            {todoTasks.map(renderTaskCard)}
          </div>
        </div>

        {/* Column 2: In Progress */}
        <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-200 flex flex-col space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-blue-300">
            <h3 className="font-bold text-blue-900 text-sm flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Đang Thực Hiện</span>
            </h3>
            <span className="bg-blue-200 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {inProgressTasks.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
            {inProgressTasks.map(renderTaskCard)}
          </div>
        </div>

        {/* Column 3: PENDING APPROVAL COLUMN */}
        <div className="bg-amber-100/80 rounded-xl p-3 border-2 border-amber-400 flex flex-col space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-amber-300">
            <h3 className="font-bold text-amber-950 text-sm flex items-center space-x-1.5 animate-pulse">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>🟡 CHỜ CAX DUYỆT</span>
            </h3>
            <span className="bg-amber-600 text-white text-xs font-extrabold px-2 py-0.5 rounded-full shadow-sm">
              {pendingApprovalTasks.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
            {pendingApprovalTasks.length === 0 ? (
              <p className="text-center text-xs text-amber-800 py-8 italic font-medium">
                Không có nhiệm vụ chờ phê duyệt.
              </p>
            ) : (
              pendingApprovalTasks.map(renderTaskCard)
            )}
          </div>
        </div>

        {/* Column 4: OVERDUE RED ALERT COLUMN */}
        <div className="bg-red-100/70 rounded-xl p-3 border-2 border-red-400 flex flex-col space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-red-300">
            <h3 className="font-bold text-red-900 text-sm flex items-center space-x-1.5 animate-pulse">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>🔴 QUÁ HẠN</span>
            </h3>
            <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
              {overdueTasks.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
            {overdueTasks.length === 0 ? (
              <p className="text-center text-xs text-red-700 py-8 italic font-medium">
                🎉 Không có công việc quá hạn.
              </p>
            ) : (
              overdueTasks.map(renderTaskCard)
            )}
          </div>
        </div>

        {/* Column 5: Completed */}
        <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-200 flex flex-col space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-300">
            <h3 className="font-bold text-emerald-900 text-sm flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Đã Hoàn Thành</span>
            </h3>
            <span className="bg-emerald-200 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {completedTasks.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
            {completedTasks.map(renderTaskCard)}
          </div>
        </div>
      </div>
    </div>
  );
};
