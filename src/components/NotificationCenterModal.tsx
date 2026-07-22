import React, { useState } from 'react';
import { NotificationItem, Officer, Department, Task } from '../types';
import { 
  Mail, 
  Send, 
  CheckCheck, 
  AlertTriangle, 
  Clock, 
  User, 
  Building2, 
  FileText, 
  Search, 
  Plus, 
  X,
  Inbox,
  ShieldAlert
} from 'lucide-react';

interface NotificationCenterModalProps {
  notifications: NotificationItem[];
  officers: Officer[];
  departments: Department[];
  tasks: Task[];
  onSendCustomNotification: (notif: Omit<NotificationItem, 'id' | 'sentAt' | 'read' | 'isEmailSent'>) => void;
  onClearNotifications: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  notifications,
  officers,
  departments,
  tasks,
  onSendCustomNotification,
  onClearNotifications
}) => {
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Custom email trigger modal
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [recipientType, setRecipientType] = useState<'officer' | 'department'>('officer');
  const [selectedRecipientId, setSelectedRecipientId] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customContent, setCustomContent] = useState('');

  // Filtered notifications
  const filteredNotifs = notifications.filter(n => {
    const matchesSearch = 
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.recipientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (n.taskCode && n.taskCode.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterType === 'overdue') return matchesSearch && n.type === 'overdue_warning';
    if (filterType === 'reminder') return matchesSearch && n.type === 'reminder';
    return matchesSearch;
  });

  const handleOpenSendModal = () => {
    setIsSendModalOpen(true);
    setRecipientType('officer');
    if (officers.length > 0) setSelectedRecipientId(officers[0].id);
    if (tasks.length > 0) {
      setSelectedTaskId(tasks[0].id);
      setCustomTitle(`⚠️ NHẮC NHỞ ĐÔN ĐỐC TIẾN ĐỘ: ${tasks[0].code} - ${tasks[0].title}`);
      setCustomContent(`Đề nghị đồng chí khẩn trương rà soát, đẩy nhanh tiến độ hoàn thành công việc "${tasks[0].title}" (Thời hạn: ${tasks[0].dueDate}) và gửi báo cáo kết quả.`);
    }
  };

  const handleTaskSelectForEmail = (taskId: string) => {
    setSelectedTaskId(taskId);
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setCustomTitle(`⚠️ NHẮC NHỞ ĐÔN ĐỐC TIẾN ĐỘ: ${task.code} - ${task.title}`);
      setCustomContent(`Đề nghị đồng chí khẩn trương rà soát, đẩy nhanh tiến độ hoàn thành công việc "${task.title}" (Thời hạn: ${task.dueDate}) và gửi báo cáo kết quả.`);
    }
  };

  const handleSendEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let name = '';
    let email = '';

    if (recipientType === 'officer') {
      const off = officers.find(o => o.id === selectedRecipientId);
      name = off?.name || 'Cán bộ';
      email = off?.email || 'canbo@donvi.gov.vn';
    } else {
      const dept = departments.find(d => d.id === selectedRecipientId);
      name = dept?.name || 'Phòng ban';
      email = dept?.email || 'phongban@donvi.gov.vn';
    }

    const task = tasks.find(t => t.id === selectedTaskId);

    onSendCustomNotification({
      taskId: task?.id,
      taskCode: task?.code,
      taskTitle: task?.title,
      recipientType,
      recipientName: name,
      recipientEmail: email,
      type: 'overdue_warning',
      title: customTitle,
      content: customContent
    });

    setIsSendModalOpen(false);
    alert(`✅ Đã phát hành và gửi thư thông báo đến [${email}] thành công!`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <Mail className="w-6 h-6 text-blue-600" />
            <span>TRUNG TÂM THÔNG BÁO & HÒM THƯ ĐIỆN TỬ ĐÔN ĐỐC</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tự động phát hành thư đôn đốc công việc, cảnh báo quá hạn gửi trực tiếp tới thư cán bộ & bộ phận
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleOpenSendModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm rounded-lg shadow transition-all cursor-pointer flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Gửi thư đôn đốc trực tiếp</span>
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Notification List */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[650px]">
          {/* Filters */}
          <div className="p-3 border-b border-slate-200 bg-slate-50 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm thư theo cán bộ, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>

            <div className="flex space-x-1">
              <button
                onClick={() => setFilterType('all')}
                className={`flex-1 py-1 text-[11px] font-semibold rounded ${
                  filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                Tất cả ({notifications.length})
              </button>
              <button
                onClick={() => setFilterType('overdue')}
                className={`flex-1 py-1 text-[11px] font-semibold rounded ${
                  filterType === 'overdue' ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                Cảnh báo đỏ
              </button>
            </div>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredNotifs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Chưa có thư thông báo nào phù hợp.
              </div>
            ) : (
              filteredNotifs.map((notif) => {
                const isOverdueAlert = notif.type === 'overdue_warning';
                const isSelected = selectedNotif?.id === notif.id;

                return (
                  <div
                    key={notif.id}
                    onClick={() => setSelectedNotif(notif)}
                    className={`p-3.5 cursor-pointer transition-all border-l-4 ${
                      isSelected 
                        ? 'bg-blue-50 border-l-blue-600' 
                        : isOverdueAlert 
                        ? 'bg-red-50/50 hover:bg-red-50 border-l-red-500' 
                        : 'hover:bg-slate-50 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span className="font-semibold text-slate-800 flex items-center space-x-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{notif.recipientName}</span>
                      </span>
                      <span>{notif.sentAt.split(' ')[0]}</span>
                    </div>

                    <h4 className={`text-xs font-bold line-clamp-1 ${
                      isOverdueAlert ? 'text-red-900' : 'text-slate-900'
                    }`}>
                      {notif.title}
                    </h4>

                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">
                      {notif.content}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded border">
                        📧 {notif.recipientEmail}
                      </span>
                      <span className="text-emerald-600 font-medium flex items-center space-x-0.5">
                        <CheckCheck className="w-3 h-3" />
                        <span>Đã gửi Email</span>
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Email Detail Preview */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between h-[650px] overflow-y-auto">
          {selectedNotif ? (
            <div className="space-y-6">
              {/* Official Email Header */}
              <div className="border-b border-slate-200 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="bg-blue-900 text-white font-mono text-xs font-bold px-2.5 py-1 rounded">
                    MẪU THƯ THÔNG BÁO CHÍNH THỨC CỦA ĐƠN VỊ
                  </span>
                  <span className="text-xs text-slate-500">
                    Thời gian gửi: <strong>{selectedNotif.sentAt}</strong>
                  </span>
                </div>

                <h2 className="text-lg font-bold text-slate-900 mt-2">
                  {selectedNotif.title}
                </h2>

                <div className="bg-slate-50 rounded-lg p-3 border text-xs text-slate-700 space-y-1">
                  <p><strong className="text-slate-900">Người nhận:</strong> {selectedNotif.recipientName} ({selectedNotif.recipientType === 'officer' ? 'Cán bộ thụ lý' : 'Đơn vị thụ lý'})</p>
                  <p><strong className="text-slate-900">Hòm thư nhận:</strong> <span className="font-mono text-blue-700">{selectedNotif.recipientEmail}</span></p>
                  {selectedNotif.taskCode && (
                    <p><strong className="text-slate-900">Công việc liên quan:</strong> Mã {selectedNotif.taskCode} - {selectedNotif.taskTitle}</p>
                  )}
                </div>
              </div>

              {/* Email Content Body */}
              <div className="bg-slate-50/60 p-6 rounded-xl border border-slate-200 font-sans space-y-4">
                <div className="text-center border-b pb-3 border-slate-300">
                  <h3 className="font-bold text-slate-900 text-sm uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
                  <p className="text-xs font-semibold text-slate-700">Độc lập - Tự do - Hạnh phúc</p>
                  <p className="text-[11px] text-slate-500 italic mt-1">---***---</p>
                </div>

                <div className="text-xs sm:text-sm text-slate-800 leading-relaxed space-y-3">
                  <p>Kính gửi: <strong>{selectedNotif.recipientName}</strong>,</p>
                  
                  {selectedNotif.type === 'overdue_warning' && (
                    <div className="bg-red-100 border-l-4 border-red-600 p-3 text-red-900 rounded font-medium text-xs">
                      ⚠️ <strong>CẢNH BÁO TỪ HỆ THỐNG THEO DÕI TIẾN ĐỘ:</strong> Công việc thuộc phạm vi trách nhiệm của đồng chí đã vượt quá thời hạn quy định.
                    </div>
                  )}

                  <p className="whitespace-pre-line bg-white p-4 rounded border border-slate-200 shadow-inner text-slate-900 font-medium">
                    {selectedNotif.content}
                  </p>

                  <p>
                    Yêu cầu đồng chí khẩn trương truy cập Hệ thống Quản lý Tiến độ Đơn vị để cập nhật báo cáo kết quả thực hiện.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-300 flex justify-between items-end text-xs text-slate-600">
                  <div>
                    <p className="italic">Thư điện tử được phát hành tự động</p>
                    <p className="font-semibold text-slate-800">Văn phòng Lãnh đạo Đơn vị</p>
                  </div>
                  <div className="text-right font-bold text-blue-900">
                    [ĐÃ KÝ DUYỆT ĐIỆN TỬ]
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 space-y-3">
              <Inbox className="w-12 h-12 text-slate-300" />
              <div>
                <p className="font-semibold text-slate-600 text-sm">Chọn một thư thông báo ở danh sách bên trái để xem nội dung chi tiết</p>
                <p className="text-xs text-slate-400 mt-1">Hoặc bấm nút "Gửi thư đôn đốc trực tiếp" ở góc trên để tạo thư mới</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CREATE & SEND CUSTOM EMAIL MODAL */}
      {isSendModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-scale-up border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <Send className="w-5 h-5 text-blue-600" />
                <span>Gửi Thư Điện Tử Đôn Đốc Tiến Độ</span>
              </h3>
              <button
                onClick={() => setIsSendModalOpen(false)}
                className="p-1 rounded bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendEmailSubmit} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Loại đối tượng nhận:</label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-1.5 cursor-pointer font-medium text-slate-800">
                    <input
                      type="radio"
                      name="recType"
                      checked={recipientType === 'officer'}
                      onChange={() => {
                        setRecipientType('officer');
                        if (officers.length > 0) setSelectedRecipientId(officers[0].id);
                      }}
                    />
                    <span>Cán bộ cá nhân</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer font-medium text-slate-800">
                    <input
                      type="radio"
                      name="recType"
                      checked={recipientType === 'department'}
                      onChange={() => {
                        setRecipientType('department');
                        if (departments.length > 0) setSelectedRecipientId(departments[0].id);
                      }}
                    />
                    <span>Toàn bộ Phòng ban</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Chọn {recipientType === 'officer' ? 'Cán bộ thụ lý' : 'Phòng ban'}:
                </label>
                <select
                  value={selectedRecipientId}
                  onChange={(e) => setSelectedRecipientId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-medium bg-slate-50"
                >
                  {recipientType === 'officer' 
                    ? officers.map(o => <option key={o.id} value={o.id}>{o.name} - {o.departmentName} ({o.email})</option>)
                    : departments.map(d => <option key={d.id} value={d.id}>{d.name} ({d.email})</option>)
                  }
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Công việc đôn đốc liên quan:</label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => handleTaskSelectForEmail(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-medium bg-slate-50"
                >
                  {tasks.map(t => (
                    <option key={t.id} value={t.id}>
                      [{t.code}] {t.title} (Hạn: {t.dueDate})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tiêu đề thư điện tử *</label>
                <input
                  type="text"
                  required
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nội dung thư chỉ đạo đôn đốc *</label>
                <textarea
                  rows={4}
                  required
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsSendModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 font-medium text-slate-700 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow cursor-pointer flex items-center space-x-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Gửi Thư Ngay</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
