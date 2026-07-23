import React from 'react';
import { Task } from '../types';
import { getDaysDifference, getTodayString } from '../services/storageService';
import { 
  X, 
  Building2, 
  User, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Send, 
  Edit3, 
  FileText,
  Tag
} from 'lucide-react';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onSendEmail: (task: Task) => void;
  onUpdateStatus: (taskId: string, status: any) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onEdit,
  onSendEmail,
  onUpdateStatus
}) => {
  if (!task) return null;

  const today = getTodayString();
  const isOverdue = task.status === 'overdue' || (task.dueDate < today && task.status !== 'completed');
  const daysDiff = getDaysDifference(task.dueDate);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full overflow-hidden animate-scale-up border border-slate-200 my-8">
        {/* Header */}
        <div className={`p-5 flex items-center justify-between text-white ${
          isOverdue ? 'bg-red-700' : 'bg-slate-900'
        }`}>
          <div className="flex items-center space-x-2">
            <span className="bg-white/20 px-2 py-0.5 rounded font-mono font-bold text-xs">
              {task.code}
            </span>
            <span className="font-bold text-sm sm:text-base">
              {isOverdue ? '⚠️ CÔNG VIỆC QUÁ HẠN XỬ LÝ' : 'CHI TIẾT CÔNG VIỆC ĐƠN VỊ'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4 text-xs sm:text-sm text-slate-800">
          {/* Overdue Warning Callout Box */}
          {isOverdue && (
            <div className="bg-red-50 border-l-4 border-red-600 p-3.5 rounded-r-lg space-y-1">
              <div className="flex items-center space-x-2 text-red-900 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>CẢNH BÁO ĐỎ: CÔNG VIỆC ĐÃ QUÁ HẠN {Math.abs(daysDiff)} NGÀY!</span>
              </div>
              <p className="text-xs text-red-700">
                Thời hạn hoàn thành ấn định: <strong className="underline">{task.dueDate}</strong>. Yêu cầu cán bộ thụ lý báo cáo ngay lý do chậm tiến độ.
              </p>
            </div>
          )}

          {/* Title & Description */}
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {task.title}
            </h3>
            <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-3 rounded-lg border leading-relaxed">
              {task.description || 'Chưa có mô tả chi tiết.'}
            </p>
          </div>

          {/* Parameters Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border">
              <span className="text-slate-500 font-medium block">Phòng ban thụ lý:</span>
              <strong className="text-slate-900 text-sm">{task.departmentName}</strong>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border">
              <span className="text-slate-500 font-medium block">Cán bộ phụ trách:</span>
              <strong className="text-slate-900 text-sm">{task.assigneeName || (task as any).assignee || 'Cán bộ chưa phân công'}</strong>
              <p className="text-[11px] text-blue-600 font-mono">{task.assigneeEmail}</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border">
              <span className="text-slate-500 font-medium block">Lãnh đạo giao việc:</span>
              <strong className="text-slate-900">{task.assignerName}</strong>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border">
              <span className="text-slate-500 font-medium block">Mức độ ưu tiên:</span>
              <strong className="text-purple-700 uppercase">{task.priority}</strong>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border">
              <span className="text-slate-500 font-medium block">Ngày giao:</span>
              <strong className="text-slate-800">{task.startDate}</strong>
            </div>

            <div className={`p-3 rounded-lg border ${isOverdue ? 'bg-red-50 border-red-300' : 'bg-slate-50'}`}>
              <span className="text-slate-500 font-medium block">Thời hạn hoàn thành:</span>
              <strong className={isOverdue ? 'text-red-700 font-extrabold text-sm' : 'text-slate-900'}>
                {task.dueDate}
              </strong>
            </div>
          </div>

          {/* Progress Slider Display */}
          <div className="space-y-1 bg-slate-50 p-3 rounded-lg border">
            <div className="flex justify-between font-bold">
              <span>Tiến độ thực hiện:</span>
              <span className="text-blue-600">{task.progress}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div 
                className={`h-2.5 rounded-full ${isOverdue ? 'bg-red-600' : 'bg-emerald-500'}`} 
                style={{ width: `${task.progress}%` }} 
              />
            </div>
          </div>

          {/* Deliverables */}
          {task.deliverable && (
            <div>
              <span className="font-bold text-slate-800 block mb-1">📦 Sản phẩm bàn giao:</span>
              <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200 text-slate-800 text-xs font-medium">
                {task.deliverable}
              </div>
            </div>
          )}

          {/* Notes */}
          {task.notes && (
            <div>
              <span className="font-bold text-slate-800 block mb-1">📝 Nhật ký / Báo cáo tiến độ:</span>
              <p className="p-3 bg-amber-50/50 rounded-lg border border-amber-200 text-slate-800 text-xs italic">
                "{task.notes}"
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={() => onSendEmail(task)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow cursor-pointer flex items-center space-x-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Gửi Thư Nhắc Nhở Ngay</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => { onClose(); onEdit(task); }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-lg cursor-pointer flex items-center space-x-1"
              >
                <Edit3 className="w-4 h-4" />
                <span>Chỉnh Sửa</span>
              </button>

              {task.status !== 'completed' && (
                <button
                  onClick={() => { onUpdateStatus(task.id, 'completed'); onClose(); }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg cursor-pointer"
                >
                  ✓ Hoàn Thành
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
