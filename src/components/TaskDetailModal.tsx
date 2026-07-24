import React, { useState } from 'react';
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
  Tag,
  ShieldCheck,
  Check,
  XCircle,
  MessageSquare
} from 'lucide-react';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onSendEmail: (task: Task) => void;
  onUpdateStatus: (taskId: string, status: any) => void;
  onApproveEarlyCompletion?: (taskId: string, note?: string) => void;
  onRejectEarlyCompletion?: (taskId: string, note?: string) => void;
  isChiefOfPolice?: boolean;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onEdit,
  onSendEmail,
  onUpdateStatus,
  onApproveEarlyCompletion,
  onRejectEarlyCompletion,
  isChiefOfPolice = false
}) => {
  const [approvalNoteInput, setApprovalNoteInput] = useState('');
  const [showNoteBox, setShowNoteBox] = useState(false);

  if (!task) return null;

  const today = getTodayString();
  const isOverdue = task.status === 'overdue' || (task.dueDate < today && task.status !== 'completed' && task.status !== 'pending_approval');
  const daysDiff = getDaysDifference(task.dueDate);
  const isPendingApproval = task.status === 'pending_approval' || task.approvalStatus === 'pending';
  const isEarlyApproved = task.approvalStatus === 'approved' || (task.status === 'completed' && task.isEarlyCompletion);

  const handleApprove = () => {
    if (onApproveEarlyCompletion) {
      onApproveEarlyCompletion(task.id, approvalNoteInput.trim());
      onClose();
    } else {
      onUpdateStatus(task.id, 'completed');
      onClose();
    }
  };

  const handleReject = () => {
    if (onRejectEarlyCompletion) {
      onRejectEarlyCompletion(task.id, approvalNoteInput.trim());
      onClose();
    } else {
      onUpdateStatus(task.id, 'in_progress');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full overflow-hidden animate-scale-up border border-slate-200 my-8">
        {/* Header */}
        <div className={`p-5 flex items-center justify-between text-white ${
          isOverdue ? 'bg-red-700' : isPendingApproval ? 'bg-amber-800' : isEarlyApproved ? 'bg-emerald-900' : 'bg-slate-900'
        }`}>
          <div className="flex items-center space-x-2">
            <span className="bg-white/20 px-2 py-0.5 rounded font-mono font-bold text-xs">
              {task.code}
            </span>
            <span className="font-bold text-sm sm:text-base">
              {isOverdue 
                ? '⚠️ CÔNG VIỆC QUÁ HẠN XỬ LÝ' 
                : isPendingApproval 
                ? '🟡 CHỜ TRƯỞNG CAX PHÊ DUYỆT HOÀN THÀNH SỚM' 
                : isEarlyApproved 
                ? '🛡️ ĐÃ PHÊ DUYỆT HOÀN THÀNH SỚM'
                : 'CHI TIẾT CÔNG VIỆC ĐƠN VỊ'}
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

          {/* Pending Approval Banner */}
          {isPendingApproval && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-3.5 rounded-r-lg space-y-1.5">
              <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-amber-600 animate-pulse" />
                <span>NHIỆM VỤ ĐÃ HOÀN THÀNH SỚM — DANG CHỜ TRƯỞNG CAX PHÊ DUYỆT</span>
              </div>
              <p className="text-xs text-amber-800">
                Cán bộ phụ trách <strong className="font-semibold">{task.assigneeName}</strong> đã báo cáo hoàn thành 100% nhiệm vụ trước thời hạn (<strong className="underline">{task.dueDate}</strong>).
              </p>
            </div>
          )}

          {/* Early Approved Banner */}
          {isEarlyApproved && (
            <div className="bg-emerald-50 border-l-4 border-emerald-600 p-3.5 rounded-r-lg space-y-1">
              <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>ĐÃ ĐƯỢC TRƯỞNG CÔNG AN XÃ PHÊ DUYỆT HOÀN THÀNH SỚM</span>
              </div>
              <p className="text-xs text-emerald-800">
                Phê duyệt bởi: <strong>{task.approvedBy || 'Trưởng Công an xã Chiềng Sinh'}</strong> | Ngày duyệt: <strong>{task.approvedAt || task.completedAt || today}</strong>
              </p>
              {task.approvalNote && (
                <p className="text-xs italic text-emerald-900 bg-white/80 p-2 rounded border border-emerald-200 mt-1">
                  💬 Ý kiến chỉ đạo: "{task.approvalNote}"
                </p>
              )}
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

          {/* CHIEF OF POLICE APPROVAL PANEL */}
          {isChiefOfPolice && (isPendingApproval || (task.progress === 100 && task.status !== 'completed')) && (
            <div className="p-4 bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 rounded-xl border-2 border-amber-500 text-slate-100 space-y-3 shadow-lg">
              <div className="flex items-center space-x-2 text-amber-300 font-bold text-sm border-b border-amber-500/30 pb-2">
                <ShieldCheck className="w-5 h-5 text-amber-400 animate-pulse" />
                <span>QUYỀN PHÊ DUYỆT HOÀN THÀNH SỚM — TRƯỞNG CÔNG AN XÃ</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-amber-200 flex items-center space-x-1">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ý kiến chỉ đạo / Nhận xét biểu dương (không bắt buộc):</span>
                </label>
                <input
                  type="text"
                  value={approvalNoteInput}
                  onChange={(e) => setApprovalNoteInput(e.target.value)}
                  placeholder="Ví dụ: Đã kiểm tra sản phẩm, biểu dương tinh thần hoàn thành xuất sắc nhiệm vụ sớm."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={handleReject}
                  className="px-3.5 py-2 rounded-lg bg-red-950 hover:bg-red-900 border border-red-600 text-red-200 font-bold text-xs cursor-pointer flex items-center space-x-1.5 transition-all"
                >
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span>Từ Chối / Yêu Cầu Chỉnh Sửa</span>
                </button>

                <button
                  type="button"
                  onClick={handleApprove}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold text-xs shadow-lg border border-emerald-400 flex items-center space-x-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-200" />
                  <span>PHÊ DUYỆT HOÀN THÀNH SỚM</span>
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onSendEmail(task)}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow cursor-pointer flex items-center space-x-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Gửi Thư Email</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              {isChiefOfPolice && (
                <button
                  onClick={() => { onClose(); onEdit(task); }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-lg cursor-pointer flex items-center space-x-1"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Chỉnh Sửa</span>
                </button>
              )}

              {task.status !== 'completed' && task.status !== 'pending_approval' && !isChiefOfPolice && (
                <button
                  onClick={() => { onUpdateStatus(task.id, 'completed'); onClose(); }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-extrabold text-xs rounded-lg shadow border border-amber-400 cursor-pointer flex items-center space-x-1.5 transition-all active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-200" />
                  <span>Báo Hoàn Thành (Trình CAX Duyệt)</span>
                </button>
              )}

              {(task.status === 'pending_approval' || task.approvalStatus === 'pending') && !isChiefOfPolice && (
                <span className="px-4 py-2 bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded-lg flex items-center space-x-1.5 animate-pulse">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>🟡 Đã Báo Hoàn Thành (Chờ CAX Duyệt)</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

