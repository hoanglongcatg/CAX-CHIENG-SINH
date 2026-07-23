import React, { useState } from 'react';
import { Task, Department, TaskPriority, TaskStatus } from '../types';
import { getDaysDifference, getTodayString } from '../services/storageService';
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Send, 
  Edit3, 
  Trash2, 
  Eye, 
  Sliders, 
  Building2, 
  User, 
  Calendar,
  Sparkles,
  FileText,
  RotateCw
} from 'lucide-react';

interface TaskListProps {
  tasks?: Task[] | null;
  departments?: Department[] | null;
  onSelectTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onSendReminderEmail: (task: Task) => void;
  onUpdateProgress: (taskId: string, newProgress: number, newNotes?: string) => void;
  onOpenCreateModal: () => void;
  isLoggedIn?: boolean;
  onRefreshFromSheets?: () => void;
}

const PRIORITY_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  normal: { label: 'Bình thường', bg: 'bg-slate-100', text: 'text-slate-700' },
  medium: { label: 'Bình thường', bg: 'bg-slate-100', text: 'text-slate-700' },
  low: { label: 'Thấp', bg: 'bg-slate-100', text: 'text-slate-700' },
  high: { label: 'Cao', bg: 'bg-amber-100', text: 'text-amber-800' },
  important: { label: 'Quan trọng', bg: 'bg-blue-100', text: 'text-blue-800' },
  urgent: { label: 'Khẩn', bg: 'bg-amber-100', text: 'text-amber-800' },
  critical: { label: 'Thượng khẩn', bg: 'bg-purple-100', text: 'text-purple-800' }
};

const DEFAULT_PRIORITY = { label: 'Bình thường', bg: 'bg-slate-100', text: 'text-slate-700' };

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  departments,
  onSelectTask,
  onEditTask,
  onDeleteTask,
  onSendReminderEmail,
  onUpdateProgress,
  onOpenCreateModal,
  isLoggedIn = false,
  onRefreshFromSheets
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Quick progress update modal state
  const [editingProgressTask, setEditingProgressTask] = useState<Task | null>(null);
  const [progressValue, setProgressValue] = useState<number>(0);
  const [progressNotes, setProgressNotes] = useState<string>('');

  const today = getTodayString();

  // Safety checks for props
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeDepartments = Array.isArray(departments) ? departments : [];

  // Filter tasks
  const filteredTasks = safeTasks.filter(task => {
    if (!task) return false;

    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (task.title || '').toLowerCase().includes(searchLower) ||
      (task.code || '').toLowerCase().includes(searchLower) ||
      (task.assigneeName || '').toLowerCase().includes(searchLower) ||
      (task.deliverable || '').toLowerCase().includes(searchLower);

    // Dept filter
    const matchesDept = selectedDept === 'all' || task.departmentId === selectedDept;

    // Status filter
    const taskDueDate = task.dueDate || today;
    let matchesStatus = true;
    if (selectedStatus === 'overdue') {
      matchesStatus = task.status === 'overdue' || (taskDueDate < today && task.status !== 'completed');
    } else if (selectedStatus !== 'all') {
      matchesStatus = task.status === selectedStatus;
    }

    // Priority filter
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;

    return matchesSearch && matchesDept && matchesStatus && matchesPriority;
  });

  const handleOpenProgressModal = (task: Task) => {
    if (!task) return;
    setEditingProgressTask(task);
    setProgressValue(task.progress ?? 0);
    setProgressNotes(task.notes || '');
  };

  const handleSaveProgress = () => {
    if (editingProgressTask) {
      onUpdateProgress(editingProgressTask.id, progressValue, progressNotes);
      setEditingProgressTask(null);
    }
  };

  if (tasks === null || tasks === undefined) {
    return (
      <div className="bg-white rounded-xl p-8 text-center border border-slate-200 shadow-sm space-y-3">
        <div className="inline-flex p-3 rounded-full bg-blue-50 text-blue-600">
          <RotateCw className="w-6 h-6 animate-spin" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Đang tải danh sách công việc...</h3>
        <p className="text-xs text-slate-500">Vui lòng chờ trong giây lát hoặc làm mới từ Google Sheets.</p>
        {onRefreshFromSheets && (
          <button
            onClick={onRefreshFromSheets}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 cursor-pointer"
          >
            Tải dữ liệu từ Google Sheets
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-12">
      {/* FILTER & CONTROL PANEL */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>DANH SÁCH CÔNG VIỆC THỰC HIỆN TIẾN ĐỘ</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Tự động cảnh báo đỏ quá hạn - Gửi thông báo đôn đốc - Cập nhật báo cáo sản phẩm bàn giao
            </p>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            {onRefreshFromSheets && (
              <button
                onClick={onRefreshFromSheets}
                title="Tải lại công việc từ Google Sheets"
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs sm:text-sm rounded-lg border border-slate-300 shadow-sm transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <RotateCw className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden md:inline">Làm mới từ Google Sheets</span>
              </button>
            )}

            {isLoggedIn && (
              <button
                onClick={onOpenCreateModal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm rounded-lg shadow transition-all cursor-pointer flex items-center space-x-2"
              >
                <span>+ Giao công việc mới</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo Mã CV, Tên, Cán bộ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Department filter */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">-- Tất cả Phòng ban --</option>
              {safeDepartments.map(d => (
                <option key={d.id || d.name} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Status filter (With Red Alert Overdue option) */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">-- Tất cả Trạng thái --</option>
              <option value="overdue" className="text-red-600 font-bold">🔴 CẢNH BÁO QUÁ HẠN</option>
              <option value="in_progress">🔵 Đang thực hiện</option>
              <option value="todo">⚪ Chưa thực hiện</option>
              <option value="completed">🟢 Đã hoàn thành</option>
              <option value="on_hold">🟡 Tạm hoãn</option>
            </select>
          </div>

          {/* Priority filter */}
          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">-- Tất cả Độ ưu tiên --</option>
              <option value="critical">⚡ Thượng khẩn</option>
              <option value="urgent">🔥 Khẩn</option>
              <option value="important">⭐ Quan trọng</option>
              <option value="normal">🔹 Bình thường</option>
            </select>
          </div>
        </div>
      </div>

      {/* TASK TABLE LIST */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-28">Mã CV</th>
                <th className="py-3 px-4 min-w-[220px]">Tên Công Việc / Sản Phẩm</th>
                <th className="py-3 px-4 w-44">Phòng Ban & Cán Bộ</th>
                <th className="py-3 px-4 w-36 text-center">Thời Hạn Complete</th>
                <th className="py-3 px-4 w-32 text-center">Tiến Độ</th>
                <th className="py-3 px-4 w-36 text-center">Trạng Thái Cảnh Báo</th>
                <th className="py-3 px-4 w-36 text-right">Thao Tác Tức Thời</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <p className="text-base font-medium">Không tìm thấy công việc phù hợp với bộ lọc.</p>
                    <p className="text-xs mt-1">Vui lòng thử thay đổi điều kiện tìm kiếm hoặc tạo công việc mới.</p>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task, idx) => {
                  const taskDueDate = task.dueDate || today;
                  const isOverdue = task.status === 'overdue' || (taskDueDate < today && task.status !== 'completed');
                  const rawDaysDiff = getDaysDifference(taskDueDate);
                  const daysDiff = isNaN(rawDaysDiff) ? 0 : rawDaysDiff;
                  const isDueSoon = !isOverdue && task.status !== 'completed' && daysDiff >= 0 && daysDiff <= 2;
                  const priorityObj = (task.priority && PRIORITY_LABELS[task.priority]) || DEFAULT_PRIORITY;
                  const taskProgress = typeof task.progress === 'number' ? task.progress : 0;

                  return (
                    <tr 
                      key={task.id || `task-row-${idx}`}
                      className={`transition-colors border-l-4 ${
                        isOverdue 
                          ? 'bg-red-50/80 hover:bg-red-100/80 border-l-red-600 text-red-950' 
                          : isDueSoon 
                          ? 'bg-amber-50/70 hover:bg-amber-100/70 border-l-amber-500' 
                          : task.status === 'completed'
                          ? 'bg-slate-50/50 hover:bg-slate-100/50 border-l-emerald-500'
                          : 'hover:bg-slate-50 border-l-transparent'
                      }`}
                    >
                      {/* Code & Priority */}
                      <td className="py-3.5 px-4 align-top">
                        <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                          isOverdue ? 'bg-red-200 text-red-900 border border-red-400' : 'bg-slate-200 text-slate-800'
                        }`}>
                          {task.code || 'N/A'}
                        </span>
                        <div className="mt-1.5">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${priorityObj.bg} ${priorityObj.text}`}>
                            {priorityObj.label}
                          </span>
                        </div>
                      </td>

                      {/* Title & Description & Deliverables */}
                      <td className="py-3.5 px-4 align-top">
                        <h4 
                          onClick={() => onSelectTask(task)}
                          className={`font-semibold text-sm cursor-pointer hover:underline ${
                            isOverdue ? 'text-red-900 font-bold' : 'text-slate-900'
                          }`}
                        >
                          {task.title || '(Không có tiêu đề)'}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {task.description || ''}
                        </p>
                        {task.deliverable && (
                          <div className="mt-1 text-[11px] text-slate-600 bg-white/80 px-2 py-0.5 rounded border border-slate-200 inline-block">
                            📦 <strong className="text-slate-700">Sản phẩm:</strong> {task.deliverable}
                          </div>
                        )}
                      </td>

                      {/* Department & Assignee */}
                      <td className="py-3.5 px-4 align-top text-xs space-y-1">
                        <div className="flex items-center space-x-1 text-slate-700 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="line-clamp-1">{task.departmentName || 'Chưa xác định'}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-slate-800">
                          <User className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="font-semibold">{task.assigneeName || 'Chưa phân công'}</span>
                        </div>
                      </td>

                      {/* Due Date & Overdue Count */}
                      <td className="py-3.5 px-4 align-top text-center">
                        <div className={`font-bold text-xs flex items-center justify-center space-x-1 ${
                          isOverdue ? 'text-red-600' : 'text-slate-700'
                        }`}>
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{task.dueDate || '--/--/----'}</span>
                        </div>

                        {/* Overdue Days Warning */}
                        {isOverdue && (
                          <div className="mt-1 inline-block bg-red-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                            Quá hạn {Math.abs(daysDiff)} ngày!
                          </div>
                        )}

                        {isDueSoon && (
                          <div className="mt-1 inline-block bg-amber-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
                            Còn {daysDiff === 0 ? 'Hôm nay' : `${daysDiff} ngày`}
                          </div>
                        )}
                      </td>

                      {/* Progress Bar */}
                      <td className="py-3.5 px-4 align-top text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-bold text-xs text-slate-800 mb-1">{taskProgress}%</span>
                          <div className="w-20 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-2 rounded-full ${
                                isOverdue 
                                  ? 'bg-red-600' 
                                  : taskProgress === 100 
                                  ? 'bg-emerald-500' 
                                  : 'bg-blue-600'
                              }`} 
                              style={{ width: `${Math.min(100, Math.max(0, taskProgress))}%` }} 
                            />
                          </div>
                          <button
                            onClick={() => handleOpenProgressModal(task)}
                            className="text-[10px] text-blue-600 hover:underline mt-1 cursor-pointer font-medium"
                          >
                            Cập nhật %
                          </button>
                        </div>
                      </td>

                      {/* Status Warning Badge */}
                      <td className="py-3.5 px-4 align-top text-center">
                        {isOverdue ? (
                          <span className="bg-red-600 text-white font-bold text-xs px-2.5 py-1 rounded-md shadow-sm border border-red-700 inline-flex items-center space-x-1 animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>🔴 CẢNH BÁO ĐỎ</span>
                          </span>
                        ) : task.status === 'completed' ? (
                          <span className="bg-emerald-100 text-emerald-800 font-semibold text-xs px-2.5 py-1 rounded-md border border-emerald-300 inline-flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Hoàn thành</span>
                          </span>
                        ) : task.status === 'in_progress' ? (
                          <span className="bg-blue-100 text-blue-800 font-semibold text-xs px-2.5 py-1 rounded-md border border-blue-200 inline-flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            <span>Đang làm</span>
                          </span>
                        ) : task.status === 'on_hold' ? (
                          <span className="bg-amber-100 text-amber-800 font-medium text-xs px-2.5 py-1 rounded-md">
                            Tạm hoãn
                          </span>
                        ) : (
                          <span className="bg-slate-200 text-slate-700 font-medium text-xs px-2.5 py-1 rounded-md">
                            Chưa làm
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 align-top text-right space-y-1">
                        <div className="flex items-center justify-end space-x-1">
                          {/* Send Reminder Email */}
                          <button
                            onClick={() => onSendReminderEmail(task)}
                            className={`p-1.5 rounded transition-all cursor-pointer ${
                              isOverdue 
                                ? 'bg-red-600 hover:bg-red-700 text-white font-bold' 
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                            title="Gửi thư điện tử nhắc nhở/cảnh báo"
                          >
                            <Send className="w-4 h-4" />
                          </button>

                          {/* Detail */}
                          <button
                            onClick={() => onSelectTask(task)}
                            className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => onEditTask(task)}
                            className="p-1.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 transition-all cursor-pointer"
                            title="Sửa công việc"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc chắn muốn xóa công việc ${task.code}?`)) {
                                onDeleteTask(task.id);
                              }
                            }}
                            className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-600 transition-all cursor-pointer"
                            title="Xóa công việc"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK PROGRESS UPDATE MODAL */}
      {editingProgressTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 animate-scale-up">
            <h3 className="text-lg font-bold text-slate-900 border-b pb-2">
              Cập Nhật Tiến Độ Thực Hiện Công Việc
            </h3>

            <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg border">
              <p><strong className="text-slate-800">Mã CV:</strong> {editingProgressTask.code}</p>
              <p><strong className="text-slate-800">Tên:</strong> {editingProgressTask.title}</p>
              <p><strong className="text-slate-800">Cán bộ phụ trách:</strong> {editingProgressTask.assigneeName}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold text-slate-800">
                <span>Tỷ lệ hoàn thành:</span>
                <span className="text-blue-600 font-extrabold text-base">{progressValue}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                step="5"
                value={progressValue}
                onChange={(e) => setProgressValue(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>0% (Chưa làm)</span>
                <span>50% (Đang làm)</span>
                <span>100% (Hoàn thành)</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Báo cáo tiến độ / Sản phẩm bàn giao bổ sung:
              </label>
              <textarea
                rows={3}
                value={progressNotes}
                onChange={(e) => setProgressNotes(e.target.value)}
                placeholder="Nhập ghi chú hoặc kết quả sản phẩm công việc..."
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t">
              <button
                onClick={() => setEditingProgressTask(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSaveProgress}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow cursor-pointer"
              >
                Lưu Tiến Độ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
