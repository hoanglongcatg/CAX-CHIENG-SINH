import React, { useState } from 'react';
import { Task, Department, TaskStats, DepartmentStats } from '../types';
import { 
  matchDepartment, 
  calculateTaskStats, 
  calculateDepartmentStats, 
  getTodayString 
} from '../services/storageService';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Building2, 
  Send, 
  ArrowRight, 
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  ShieldAlert,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';

interface DashboardProps {
  tasks: Task[];
  departments: Department[];
  stats: TaskStats;
  departmentStats: DepartmentStats[];
  onSelectTask: (task: Task) => void;
  onSendReminderEmail: (task: Task) => void;
  onNavigateToTable: () => void;
  onNavigateToReports: () => void;
}

const STATUS_COLORS = {
  completed: '#10b981', // green
  in_progress: '#3b82f6', // blue
  todo: '#64748b',      // slate
  on_hold: '#f59e0b',   // amber
  overdue: '#ef4444'     // red
};

export const Dashboard: React.FC<DashboardProps> = ({
  tasks,
  departments,
  stats: initialStats,
  departmentStats: initialDeptStats,
  onSelectTask,
  onSendReminderEmail,
  onNavigateToTable,
  onNavigateToReports
}) => {
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeDepts = Array.isArray(departments) ? departments : [];

  const selectedDeptObj = safeDepts.find(d => d.id === selectedDeptId);

  // Filter tasks based on selected department using normalized matching
  const filteredTasks = selectedDeptId === 'all' 
    ? safeTasks 
    : safeTasks.filter(t => t && matchDepartment(t.departmentId, t.departmentName, selectedDeptId, selectedDeptObj?.name));

  // Compute stats directly from tasks for real-time reactivity
  const currentStats = selectedDeptId === 'all' 
    ? calculateTaskStats(safeTasks) 
    : calculateTaskStats(filteredTasks);

  const currentDeptStats = calculateDepartmentStats(safeTasks, safeDepts);

  const todayStr = getTodayString();
  // Extract overdue tasks
  const overdueTasks = filteredTasks.filter(t => {
    if (!t) return false;
    const taskDueDate = t.dueDate || todayStr;
    return t.status === 'overdue' || (taskDueDate < todayStr && t.status !== 'completed' && t.status !== 'on_hold' && t.status !== 'pending_approval');
  });

  // Extract tasks pending early completion approval
  const pendingApprovalTasks = filteredTasks.filter(t => {
    if (!t) return false;
    return t.status === 'pending_approval' || t.approvalStatus === 'pending';
  });

  // Chart Data: Status Pie Chart
  const statusPieData = [
    { name: 'Đã hoàn thành', value: currentStats.completed, color: STATUS_COLORS.completed },
    { name: 'Đang thực hiện', value: currentStats.inProgress, color: STATUS_COLORS.in_progress },
    { name: 'Chưa thực hiện', value: currentStats.todo, color: STATUS_COLORS.todo },
    { name: 'Tạm hoãn', value: currentStats.onHold, color: STATUS_COLORS.on_hold },
    { name: 'Quá hạn (Đỏ)', value: currentStats.overdue, color: STATUS_COLORS.overdue }
  ].filter(item => item.value > 0);

  // Chart Data: Department Bar Chart
  const deptBarData = currentDeptStats.map(ds => ({
    name: ds.departmentName.length > 22 ? ds.departmentName.substring(0, 20) + '...' : ds.departmentName,
    'Hoàn thành': ds.completed,
    'Đang làm': ds.inProgress,
    'Quá hạn': ds.overdue
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Department Selector Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <span>BẢNG ĐIỀU KHIỂN CÔNG TÁC - CÔNG AN XÃ CHIỀNG SINH</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi chỉ số thực hiện nhiệm vụ các Tổ công tác, cảnh báo đỏ quá hạn và chỉ đạo điều hành
          </p>
        </div>

        {/* Filter dropdown */}
        <div className="flex items-center space-x-3">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Tổ công tác:
          </label>
          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="px-3.5 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">-- Toàn Công an xã (Tất cả Tổ công tác) --</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 🟡 AMBER BANNER FOR TASKS PENDING EARLY COMPLETION APPROVAL */}
      {pendingApprovalTasks.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-500 rounded-xl p-5 shadow-md relative overflow-hidden animate-fade-in">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-amber-600 text-white rounded-lg shadow-md animate-pulse">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-bold text-amber-950 tracking-tight">
                    THÔNG BÁO DÀNH CHO TRƯỞNG CÔNG AN XÃ: CÓ {pendingApprovalTasks.length} NHIỆM VỤ HOÀN THÀNH SỚM ĐANG TRÌNH PHÊ DUYỆT!
                  </h2>
                  <span className="bg-amber-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    Cần phê duyệt
                  </span>
                </div>
                <p className="text-xs text-amber-800 mt-0.5">
                  Cán bộ các tổ công tác đã hoàn thành 100% nhiệm vụ trước thời hạn. Đề nghị Trưởng Công an xã rà soát sản phẩm và phê duyệt.
                </p>
              </div>
            </div>

            <button
              onClick={onNavigateToTable}
              className="text-xs font-bold text-amber-900 flex items-center space-x-1 bg-amber-200 hover:bg-amber-300 px-3 py-1.5 rounded-lg border border-amber-400 transition-all cursor-pointer shadow-sm"
            >
              <span>Phê duyệt ngay</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingApprovalTasks.slice(0, 3).map((task) => (
              <div 
                key={task.id}
                onClick={() => onSelectTask(task)}
                className="bg-white rounded-lg border border-amber-300 p-3.5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-mono font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded">
                      {task.code}
                    </span>
                    <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-300 flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3 text-amber-600" />
                      <span>Chờ CAX Duyệt</span>
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm hover:text-blue-600 line-clamp-2">
                    {task.title}
                  </h3>
                  <div className="mt-2 text-xs text-slate-600 space-y-1">
                    <p><span className="font-medium text-slate-500">Cán bộ thực hiện:</span> <strong className="text-slate-900">{task.assigneeName}</strong></p>
                    <p><span className="font-medium text-slate-500">Hạn giao ban đầu:</span> <span className="text-slate-800 font-semibold">{task.dueDate}</span></p>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 text-right">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 inline-block">
                    ✓ Hoàn thành 100% trước hạn
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🔴 RED ALERT BANNER FOR OVERDUE TASKS (If overdue > 0) */}
      {overdueTasks.length > 0 && (
        <div className="bg-red-50 border-2 border-red-500 rounded-xl p-5 shadow-md relative overflow-hidden animate-fade-in">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-red-600 text-white rounded-lg shadow-md animate-bounce">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-bold text-red-900 tracking-tight">
                    CẢNH BÁO ĐỎ: CÓ {overdueTasks.length} CÔNG VIỆC ĐÃ QUÁ HẠN XỬ LÝ!
                  </h2>
                  <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    Cần xử lý khẩn cấp
                  </span>
                </div>
                <p className="text-xs text-red-700 mt-0.5">
                  Hệ thống tự động phát hiện các việc chậm tiến độ. Đề nghị lãnh đạo kiểm tra và chỉ đạo gửi thông báo đôn đốc.
                </p>
              </div>
            </div>

            <button
              onClick={onNavigateToTable}
              className="text-xs font-semibold text-red-700 hover:text-red-900 flex items-center space-x-1 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg border border-red-300 transition-all cursor-pointer"
            >
              <span>Xem toàn bộ việc quá hạn</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Overdue Task Cards List */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {overdueTasks.slice(0, 3).map((task) => (
              <div 
                key={task.id}
                className="bg-white rounded-lg border border-red-300 p-3.5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-mono font-bold text-red-800 bg-red-100 px-1.5 py-0.5 rounded">
                      {task.code}
                    </span>
                    <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                      ⚠️ Quá hạn!
                    </span>
                  </div>
                  <h3 
                    onClick={() => onSelectTask(task)}
                    className="font-semibold text-slate-900 text-sm hover:text-blue-600 cursor-pointer line-clamp-2"
                  >
                    {task.title}
                  </h3>
                  <div className="mt-2 text-xs text-slate-600 space-y-1">
                    <p><span className="font-medium text-slate-500">Bộ phận:</span> {task.departmentName}</p>
                    <p><span className="font-medium text-slate-500">Cán bộ phụ trách:</span> <strong className="text-slate-800">{task.assigneeName}</strong></p>
                    <p><span className="font-medium text-slate-500">Thời hạn:</span> <span className="text-red-600 font-bold">{task.dueDate}</span></p>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Tiến độ: <strong className="text-slate-800">{task.progress}%</strong>
                  </div>
                  <button
                    onClick={() => onSendReminderEmail(task)}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-medium shadow transition-all cursor-pointer"
                    title="Gửi thư cảnh báo quá hạn trực tiếp"
                  >
                    <Send className="w-3 h-3" />
                    <span>Gửi Thư Nhắc Nhở</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4 KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">TỔNG SỐ CÔNG VIỆC</p>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">{currentStats.total}</h2>
            <p className="text-xs text-slate-500 mt-1">Đang được quản lý hệ thống</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ĐÃ HOÀN THÀNH</p>
            <div className="flex items-baseline space-x-2 mt-1">
              <h2 className="text-3xl font-extrabold text-emerald-600">{currentStats.completed}</h2>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                {currentStats.completionRate}% Đạt
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Nhiệm vụ đúng tiến độ bàn giao</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ĐANG THỰC HIỆN</p>
            <h2 className="text-3xl font-extrabold text-blue-600 mt-1">{currentStats.inProgress}</h2>
            <p className="text-xs text-slate-500 mt-1">Trong hạn xử lý ({currentStats.dueSoon} việc sắp đến hạn)</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Overdue Red Card */}
        <div className={`rounded-xl p-5 border shadow-sm flex items-center justify-between transition-all ${
          currentStats.overdue > 0 
            ? 'bg-red-600 text-white border-red-700 shadow-red-200' 
            : 'bg-white text-slate-900 border-slate-200'
        }`}>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider ${
              currentStats.overdue > 0 ? 'text-red-100' : 'text-slate-500'
            }`}>
              CẢNH BÁO QUÁ HẠN
            </p>
            <div className="flex items-baseline space-x-2 mt-1">
              <h2 className="text-3xl font-extrabold">{currentStats.overdue}</h2>
              {currentStats.overdue > 0 && (
                <span className="text-xs font-extrabold bg-white text-red-700 px-2 py-0.5 rounded-full animate-pulse">
                  {currentStats.overdueRate}% Tỷ lệ
                </span>
              )}
            </div>
            <p className={`text-xs mt-1 ${currentStats.overdue > 0 ? 'text-red-100' : 'text-slate-500'}`}>
              Cần lãnh đạo đôn đốc ngay
            </p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            currentStats.overdue > 0 ? 'bg-red-700 text-white' : 'bg-red-50 text-red-600'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Progress Bar Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span>Thống Kê Tiến Độ Theo Bộ Phận / Phòng Ban</span>
              </h3>
              <p className="text-xs text-slate-500">So sánh số công việc hoàn thành, đang làm và quá hạn</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptBarData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px' }} 
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Hoàn thành" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Đang làm" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Quá hạn" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Donut Pie Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base flex items-center space-x-2">
              <PieIcon className="w-5 h-5 text-indigo-600" />
              <span>Cơ Cấu Trạng Thái Công Việc</span>
            </h3>
            <p className="text-xs text-slate-500">Tỷ lệ phân bổ trạng thái xử lý công việc</p>
          </div>

          <div className="h-60 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px' }} 
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Tỷ lệ quá hạn đỏ: <strong className="text-red-600">{currentStats.overdueRate}%</strong></span>
            <span>Tỷ lệ hoàn thành: <strong className="text-emerald-600">{currentStats.completionRate}%</strong></span>
          </div>
        </div>
      </div>

      {/* DEPARTMENT STATS BREAKDOWN TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              Bảng Đánh Giá Tỷ Lệ Hoàn Thành Công Việc Các Phòng Ban
            </h3>
            <p className="text-xs text-slate-500">Căn cứ để xếp loại thi đua và kiểm tra đôn đốc nhiệm vụ</p>
          </div>

          <button
            onClick={onNavigateToReports}
            className="flex items-center space-x-1 px-3.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition-all cursor-pointer"
          >
            <span>Xuất Báo Cáo Tuần / Tháng (AI)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Tên Phòng Ban / Đơn Vị</th>
                <th className="py-3 px-4 text-center">Tổng Số Việc</th>
                <th className="py-3 px-4 text-center">Đã Hoàn Thành</th>
                <th className="py-3 px-4 text-center">Đang Thực Hiện</th>
                <th className="py-3 px-4 text-center">Cảnh Báo Quá Hạn</th>
                <th className="py-3 px-4 text-center">Tỷ Lệ Hoàn Thành</th>
                <th className="py-3 px-4 text-right">Đánh Giá Tiến Độ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentDeptStats.map((ds) => (
                <tr key={ds.departmentId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {ds.departmentName}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                    {ds.total}
                  </td>
                  <td className="py-3.5 px-4 text-center text-emerald-600 font-semibold">
                    {ds.completed}
                  </td>
                  <td className="py-3.5 px-4 text-center text-blue-600 font-semibold">
                    {ds.inProgress}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {ds.overdue > 0 ? (
                      <span className="bg-red-100 text-red-700 font-bold border border-red-300 px-2 py-0.5 rounded-full text-xs animate-pulse">
                        ⚠️ {ds.overdue} việc quá hạn
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">0</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-20 bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full" 
                          style={{ width: `${ds.completionRate}%` }} 
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700">{ds.completionRate}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {ds.overdue > 0 ? (
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                        Cần đôn đốc khẩn
                      </span>
                    ) : ds.completionRate >= 80 ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                        Tiến độ Tốt
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                        Bình thường
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
