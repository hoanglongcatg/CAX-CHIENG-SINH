import React, { useState, useEffect } from 'react';
import { Task, Department, Officer, TaskPriority, TaskStatus } from '../types';
import { getTodayString } from '../services/storageService';
import { X, Save, Building2, User, Calendar, FileText, AlertTriangle, CheckCircle2, UserPlus, Edit3, UserCheck, Plus, Sparkles, Wand2, Loader2 } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => void;
  taskToEdit?: Task | null;
  departments: Department[];
  officers: Officer[];
  existingTasksCount?: number;
  existingTasks?: Task[];
  onAddOfficer?: (officer: Officer) => void;
  onUpdateOfficer?: (officer: Officer) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
  departments,
  officers,
  existingTasksCount,
  existingTasks,
  onAddOfficer,
  onUpdateOfficer
}) => {
  if (!isOpen) return null;

  const today = getTodayString();

  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [assignerName, setAssignerName] = useState('Trưởng Công an xã Chiềng Sinh');
  const [startDate, setStartDate] = useState(today);
  const [dueDate, setDueDate] = useState(today);
  const [priority, setPriority] = useState<TaskPriority>('important');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [progress, setProgress] = useState<number>(0);
  const [deliverable, setDeliverable] = useState('');
  const [notes, setNotes] = useState('');

  // Sub-modal state for Add/Edit Officer
  const [isOfficerModalOpen, setIsOfficerModalOpen] = useState(false);
  const [officerToEdit, setOfficerToEdit] = useState<Officer | null>(null);
  const [offName, setOffName] = useState('');
  const [offTitle, setOffTitle] = useState('');
  const [offEmail, setOffEmail] = useState('');
  const [offPhone, setOffPhone] = useState('');
  const [offDeptId, setOffDeptId] = useState('');

  const [assigneeNameInput, setAssigneeNameInput] = useState('');

  // AI Directive Parser State
  const [showAiParser, setShowAiParser] = useState(false);
  const [directiveInput, setDirectiveInput] = useState('');
  const [isParsingAi, setIsParsingAi] = useState(false);

  const handleParseDirectiveAi = async () => {
    if (!directiveInput.trim() || isParsingAi) return;
    setIsParsingAi(true);
    try {
      const res = await fetch('/api/ai/draft-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textInput: directiveInput.trim() })
      });
      const data = await res.json();
      if (res.ok && data.taskDraft) {
        const draft = data.taskDraft;
        if (draft.title) setTitle(draft.title);
        if (draft.code) setCode(draft.code);
        if (draft.description) setDescription(draft.description);
        if (draft.priority) setPriority(draft.priority as TaskPriority);
        if (draft.dueDate) setDueDate(draft.dueDate);

        // Find matching dept
        if (draft.departmentName) {
          const matchedDept = departments.find(d => 
            d.name.toLowerCase().includes(draft.departmentName.toLowerCase()) || 
            draft.departmentName.toLowerCase().includes(d.name.toLowerCase())
          );
          if (matchedDept) {
            setDepartmentId(matchedDept.id);
            const matchingOfficers = officers.filter(o => o.departmentId === matchedDept.id);
            if (draft.assigneeName) {
              const matchedOff = matchingOfficers.find(o => o.name.toLowerCase().includes(draft.assigneeName.toLowerCase()));
              if (matchedOff) {
                setAssigneeId(matchedOff.id);
                setAssigneeNameInput(matchedOff.name);
              } else {
                setAssigneeNameInput(draft.assigneeName);
              }
            } else if (matchingOfficers.length > 0) {
              setAssigneeId(matchingOfficers[0].id);
              setAssigneeNameInput(matchingOfficers[0].name);
            }
          }
        }
        setShowAiParser(false);
        setDirectiveInput('');
      } else {
        alert("Lỗi khi phân tích bằng AI: " + (data.error || "Vui lòng thử lại."));
      }
    } catch (e) {
      alert("Không thể kết nối máy chủ Gemini AI.");
    } finally {
      setIsParsingAi(false);
    }
  };

  // Department suffix helper
  const getDeptSuffix = (dId: string, dName?: string): string => {
    const norm = (dName || '').toLowerCase();
    if (norm.includes('an ninh') || dId === 'dept-2') return 'PA03';
    if (norm.includes('cskv') || norm.includes('khu vực') || dId === 'dept-3') return 'PC02';
    if (norm.includes('pctp') || norm.includes('tội phạm') || dId === 'dept-4') return 'PC02';
    if (norm.includes('cstt') || norm.includes('trật tự') || dId === 'dept-5') return 'PV01';
    return 'PV01';
  };

  const totalCount = existingTasksCount !== undefined ? existingTasksCount : (existingTasks?.length || 0);

  // Populate data when editing or creating
  useEffect(() => {
    if (taskToEdit) {
      setCode(taskToEdit.code);
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setDepartmentId(taskToEdit.departmentId);
      setAssigneeId(taskToEdit.assigneeId);
      setAssigneeNameInput(taskToEdit.assigneeName || '');
      setAssignerName(taskToEdit.assignerName || 'Trưởng Công an xã Chiềng Sinh');
      setStartDate(taskToEdit.startDate);
      setDueDate(taskToEdit.dueDate);
      setPriority(taskToEdit.priority);
      setStatus(taskToEdit.status);
      setProgress(taskToEdit.progress);
      setDeliverable(taskToEdit.deliverable || '');
      setNotes(taskToEdit.notes || '');
    } else {
      // Auto code e.g. 252/KH-PA03
      const defaultDept = departments[0]?.id || '';
      const defaultDeptObj = departments.find(d => d.id === defaultDept);
      const suffix = getDeptSuffix(defaultDept, defaultDeptObj?.name);
      const autoCode = `${252 + totalCount}/KH-${suffix}`;
      
      setCode(autoCode);
      setTitle('');
      setDescription('');
      setDepartmentId(defaultDept);

      const defaultOff = officers.find(o => o.departmentId === defaultDept) || officers[0];
      setAssigneeId(defaultOff?.id || '');
      setAssigneeNameInput(defaultOff?.name || 'Cán bộ thụ lý');

      setStartDate(today);
      
      // Default due date +7 days
      const d = new Date();
      d.setDate(d.getDate() + 7);
      setDueDate(d.toISOString().split('T')[0]);

      setPriority('important');
      setStatus('todo');
      setProgress(0);
      setDeliverable('');
      setNotes('');
    }
  }, [taskToEdit, isOpen]);

  // Filter officers by department
  const availableOfficers = officers.filter(o => o.departmentId === departmentId);
  const selectedOfficer = officers.find(o => o.id === assigneeId);

  // When department changes, set first officer and update code format
  const handleDepartmentChange = (deptId: string) => {
    setDepartmentId(deptId);
    const deptObj = departments.find(d => d.id === deptId);
    
    if (!taskToEdit) {
      const suffix = getDeptSuffix(deptId, deptObj?.name);
      setCode(`${252 + totalCount}/KH-${suffix}`);
    }

    const matching = officers.filter(o => o.departmentId === deptId);
    if (matching.length > 0) {
      setAssigneeId(matching[0].id);
      setAssigneeNameInput(matching[0].name);
    } else {
      setAssigneeId('');
      setAssigneeNameInput('');
    }
  };

  // When officer dropdown selection changes
  const handleOfficerChange = (offId: string) => {
    setAssigneeId(offId);
    const off = officers.find(o => o.id === offId);
    if (off) {
      setAssigneeNameInput(off.name);
    }
  };

  // Open modal to add new officer
  const handleOpenAddOfficer = () => {
    setOfficerToEdit(null);
    setOffName('');
    setOffTitle('Cán bộ');
    const currentDeptObj = departments.find(d => d.id === departmentId);
    setOffEmail(currentDeptObj ? currentDeptObj.email : 'canbo.chiengsinh@congan.sonla.gov.vn');
    setOffPhone('0912.345.678');
    setOffDeptId(departmentId || departments[0]?.id || '');
    setIsOfficerModalOpen(true);
  };

  // Open modal to edit existing officer
  const handleOpenEditOfficer = () => {
    if (!selectedOfficer) return;
    setOfficerToEdit(selectedOfficer);
    setOffName(selectedOfficer.name);
    setOffTitle(selectedOfficer.title);
    setOffEmail(selectedOfficer.email);
    setOffPhone(selectedOfficer.phone);
    setOffDeptId(selectedOfficer.departmentId);
    setIsOfficerModalOpen(true);
  };

  // Save officer from sub-modal
  const handleSaveOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offName.trim()) {
      alert('Vui lòng nhập họ tên cán bộ!');
      return;
    }

    const deptObj = departments.find(d => d.id === offDeptId);
    const deptName = deptObj ? deptObj.name : 'Tổ công tác';

    if (officerToEdit) {
      // Edit officer
      const updated: Officer = {
        ...officerToEdit,
        name: offName.trim(),
        title: offTitle.trim() || 'Cán bộ',
        email: offEmail.trim() || 'canbo@congan.sonla.gov.vn',
        phone: offPhone.trim() || '0912.345.678',
        departmentId: offDeptId,
        departmentName: deptName
      };
      if (onUpdateOfficer) {
        onUpdateOfficer(updated);
      }
      setDepartmentId(offDeptId);
      setAssigneeId(updated.id);
    } else {
      // Add officer
      const newOff: Officer = {
        id: `off-${Date.now()}`,
        name: offName.trim(),
        title: offTitle.trim() || 'Cán bộ',
        email: offEmail.trim() || 'canbo@congan.sonla.gov.vn',
        phone: offPhone.trim() || '0912.345.678',
        departmentId: offDeptId,
        departmentName: deptName
      };
      if (onAddOfficer) {
        onAddOfficer(newOff);
      }
      setDepartmentId(offDeptId);
      setAssigneeId(newOff.id);
    }

    setIsOfficerModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Vui lòng nhập Tên công việc!');
      return;
    }

    const selectedDept = departments.find(d => d.id === departmentId);
    const selectedOff = officers.find(o => o.id === assigneeId);

    const fallbackCode = `${252 + totalCount}/KH-CAT-PV01`;
    const finalDeptName = selectedDept?.name || 'Tổ Tổng hợp';
    const finalAssigneeName = assigneeNameInput.trim() || selectedOff?.name || 'Cán bộ chưa phân công';

    onSave({
      id: taskToEdit?.id,
      code: code ? code.trim() : fallbackCode,
      title,
      description,
      departmentId,
      departmentName: finalDeptName,
      department: finalDeptName,
      assigneeId,
      assigneeName: finalAssigneeName,
      assignee: finalAssigneeName,
      assigneeEmail: selectedOff ? selectedOff.email : (selectedDept?.email || 'canbo@congan.sonla.gov.vn'),
      assignerName,
      startDate,
      dueDate,
      priority,
      status,
      progress,
      deliverable,
      notes,
      updatedAt: today,
      createdAt: taskToEdit ? taskToEdit.createdAt : today
    } as any);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden animate-scale-up border border-slate-200 relative">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold text-sm">
              CV
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {taskToEdit ? `Chỉnh Sửa Công Việc: ${taskToEdit.code}` : 'Giao Công Việc Mới Cho Cán Bộ / Tổ Công Tác'}
              </h2>
              <p className="text-xs text-slate-400">Nhập đầy đủ thông tin nhiệm vụ, thời hạn và sản phẩm bàn giao</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          
          {/* AI Directive Parser Section */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 p-3.5 rounded-xl border border-amber-500/30 shadow-md text-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="font-bold text-xs text-amber-200">
                  Tự động điền Form bằng Gemini AI
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAiParser(!showAiParser)}
                className="text-xs bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-amber-300 font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center space-x-1"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>{showAiParser ? 'Đóng AI Parser' : '✨ Dán văn bản chỉ thị để AI bóc tách'}</span>
              </button>
            </div>

            {showAiParser && (
              <div className="mt-3 pt-3 border-t border-slate-700/60 space-y-2 animate-in fade-in duration-150">
                <p className="text-[11px] text-slate-300">
                  Dán nội dung công văn, thông báo chỉ đạo hoặc ghi chú giao việc vào ô dưới đây. Trợ lý AI Gemini sẽ tự động trích xuất Tên việc, Mã CV, Tổ phụ trách, Cán bộ và Hạn hoàn thành:
                </p>
                <textarea
                  rows={3}
                  value={directiveInput}
                  onChange={(e) => setDirectiveInput(e.target.value)}
                  placeholder="Ví dụ: Chỉ đạo của Trưởng Công an thành phố: Giao Tổ CSKV kiểm tra lưu trú toàn bộ các khu nhà trọ tại phường Chiềng Sinh hoàn thành trước ngày 30/7/2026, phân công Đ/c Lò Văn Nghiệp phụ trách..."
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 placeholder:text-slate-500 text-xs focus:outline-none focus:border-amber-400 font-sans"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleParseDirectiveAi}
                    disabled={!directiveInput.trim() || isParsingAi}
                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-amber-100 font-semibold text-xs shadow-md border border-amber-400/40 flex items-center space-x-1.5 cursor-pointer disabled:opacity-40"
                  >
                    {isParsingAi ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>AI đang phân tích...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Trích xuất dữ liệu vào Form</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Row 1: Code & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Mã công việc *</label>
              <input
                type="text"
                placeholder="Ví dụ: 252/KH-CAT-PV01"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-bold text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Tên công việc / Nhiệm vụ *</label>
              <input
                type="text"
                placeholder="Ví dụ: Rà soát danh sách đối tượng trọng điểm ma túy..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full p-2.5 rounded-lg border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Mô tả nội dung chi tiết cần thực hiện</label>
            <textarea
              rows={3}
              placeholder="Chi tiết yêu cầu, quy mô, các văn bản căn cứ chỉ đạo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
            />
          </div>

          {/* Row 2: Department & Assignee with Add/Edit Officer buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Tổ công tác thụ lý *</label>
              <select
                value={departmentId}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                required
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">Cán bộ phụ trách *</label>
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={handleOpenAddOfficer}
                    className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 transition-colors cursor-pointer flex items-center space-x-1"
                    title="Thêm cán bộ mới vào danh sách"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>+ Thêm mới</span>
                  </button>
                  {selectedOfficer && (
                    <button
                      type="button"
                      onClick={handleOpenEditOfficer}
                      className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded border border-slate-300 transition-colors cursor-pointer flex items-center space-x-1"
                      title="Sửa thông tin cán bộ đang chọn"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Sửa</span>
                    </button>
                  )}
                </div>
              </div>
              <select
                value={assigneeId}
                onChange={(e) => handleOfficerChange(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
              >
                {availableOfficers.map(o => (
                  <option key={o.id} value={o.id}>{o.name} ({o.title})</option>
                ))}
                {availableOfficers.length === 0 && (
                  <option value="">Lãnh đạo Tổ công tác phụ trách</option>
                )}
              </select>
              <div className="mt-1.5">
                <input
                  type="text"
                  placeholder="Nhập tên Cán bộ đảm nhận..."
                  value={assigneeNameInput}
                  onChange={(e) => setAssigneeNameInput(e.target.value)}
                  required
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white font-semibold text-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {selectedOfficer && (
                <p className="text-[11px] text-slate-500 mt-1 truncate">
                  📧 Email: <span className="font-mono text-slate-700">{selectedOfficer.email}</span> | 📞 SĐT: {selectedOfficer.phone}
                </p>
              )}
            </div>
          </div>

          {/* Row 3: Assigner & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Lãnh đạo / Người giao việc</label>
              <input
                type="text"
                value={assignerName}
                onChange={(e) => setAssignerName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Độ ưu tiên / Mức độ khẩn</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="critical">⚡ Thượng khẩn (Gấp nhất)</option>
                <option value="urgent">🔥 Khẩn</option>
                <option value="important">⭐ Quan trọng</option>
                <option value="normal">🔹 Bình thường</option>
              </select>
            </div>
          </div>

          {/* Row 4: Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Ngày giao việc</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Thời hạn hoàn thành (Deadline) *</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full p-2.5 rounded-lg border border-red-300 bg-red-50/40 font-bold text-red-900 focus:ring-2 focus:ring-red-500"
              />
              <p className="text-[11px] text-red-600 mt-1">
                * Tự động chuyển màu đỏ & phát cảnh báo quá hạn nếu vượt ngày này.
              </p>
            </div>
          </div>

          {/* Row 5: Status & Progress */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Trạng thái công việc</label>
              <select
                value={status}
                onChange={(e) => {
                  const newStatus = e.target.value as TaskStatus;
                  setStatus(newStatus);
                  if (newStatus === 'completed') setProgress(100);
                }}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="todo">Chưa thực hiện</option>
                <option value="in_progress">Đang thực hiện</option>
                <option value="completed">Đã hoàn thành</option>
                <option value="on_hold">Tạm hoãn</option>
                <option value="overdue">🔴 Quá hạn (Cảnh báo đỏ)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">Tỷ lệ tiến độ:</label>
                <span className="font-extrabold text-blue-600">{progress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progress}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setProgress(val);
                  if (val === 100) setStatus('completed');
                  else if (val > 0 && status === 'todo') setStatus('in_progress');
                }}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
            </div>
          </div>

          {/* Deliverables */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Kết quả / Sản phẩm đầu ra yêu cầu bàn giao</label>
            <input
              type="text"
              placeholder="Ví dụ: Báo cáo PDF + Bảng tổng hợp đính kèm + Tờ trình ban hành..."
              value={deliverable}
              onChange={(e) => setDeliverable(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md transition-all cursor-pointer flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{taskToEdit ? 'Lưu Thay Đổi' : 'Tạo & Giao Việc'}</span>
            </button>
          </div>
        </form>

        {/* Inner Sub-Modal: Add / Edit Officer */}
        {isOfficerModalOpen && (
          <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-300 animate-scale-up">
              <div className="bg-slate-800 text-white p-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UserPlus className="w-5 h-5 text-blue-400" />
                  <h3 className="font-bold text-sm sm:text-base">
                    {officerToEdit ? 'Cập Nhật Thông Tin Cán Bộ' : 'Thêm Mới Cán Bộ Phụ Trách'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOfficerModalOpen(false)}
                  className="p-1 rounded bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveOfficer} className="p-5 space-y-3.5 text-xs sm:text-sm">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Cấp bậc & Họ và tên cán bộ *</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Thượng úy Nguyễn Văn A"
                    value={offName}
                    onChange={(e) => setOffName(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Chức danh / Vị trí công tác *</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Cán bộ CSKV / Trinh sát PCTP / Tổ trưởng"
                    value={offTitle}
                    onChange={(e) => setOffTitle(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tổ công tác trực thuộc *</label>
                  <select
                    value={offDeptId}
                    onChange={(e) => setOffDeptId(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Email nhận thư đôn đốc *</label>
                    <input
                      type="email"
                      placeholder="canbo@congan.sonla.gov.vn"
                      value={offEmail}
                      onChange={(e) => setOffEmail(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-slate-800 text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Số điện thoại</label>
                    <input
                      type="text"
                      placeholder="0912.345.678"
                      value={offPhone}
                      onChange={(e) => setOffPhone(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsOfficerModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow transition-all cursor-pointer flex items-center space-x-1.5"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{officerToEdit ? 'Lưu Cán Bộ' : 'Thêm Cán Bộ'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

