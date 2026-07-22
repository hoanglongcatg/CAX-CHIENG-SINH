import React, { useState } from 'react';
import { Task, Department, TaskStats } from '../types';
import { calculateTaskStats, getTodayString } from '../services/storageService';
import * as XLSX from 'xlsx';
import { 
  FileSpreadsheet, 
  Printer, 
  Sparkles, 
  Calendar, 
  Building2, 
  Download, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Loader2,
  Share2
} from 'lucide-react';

interface ReportCenterProps {
  tasks: Task[];
  departments: Department[];
}

export const ReportCenter: React.FC<ReportCenterProps> = ({
  tasks,
  departments
}) => {
  const [reportType, setReportType] = useState<'weekly' | 'monthly'>('weekly');
  const [periodName, setPeriodName] = useState<string>('Tuần này (T7/2026)');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');

  // AI Loading & Result state
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);

  // Filter tasks according to department
  const filteredTasks = selectedDeptId === 'all'
    ? tasks
    : tasks.filter(t => t.departmentId === selectedDeptId);

  const stats = calculateTaskStats(filteredTasks);
  const overdueTasks = filteredTasks.filter(t => t.status === 'overdue' || (t.dueDate < getTodayString() && t.status !== 'completed'));
  const selectedDeptObj = departments.find(d => d.id === selectedDeptId);

  // Call Gemini API server backend
  const handleGenerateAiReport = async () => {
    setIsAiLoading(true);
    setAiAnalysisResult(null);

    try {
      const response = await fetch('/api/reports/generate-ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType,
          periodName,
          departmentName: selectedDeptObj ? selectedDeptObj.name : 'Toàn Đơn Vị',
          stats,
          overdueTasks: overdueTasks.map(t => ({
            code: t.code,
            title: t.title,
            department: t.departmentName,
            assignee: t.assigneeName,
            dueDate: t.dueDate,
            daysOverdue: Math.max(1, Math.ceil((new Date().getTime() - new Date(t.dueDate).getTime()) / (1000*3600*24)))
          })),
          totalTasks: filteredTasks.length
        })
      });

      const data = await response.json();
      if (response.ok && data.summary) {
        setAiAnalysisResult(data.summary);
      } else {
        setAiAnalysisResult("❌ Lỗi khi tổng hợp báo cáo AI: " + (data.error || "Vui lòng thử lại."));
      }
    } catch (e: any) {
      console.error("Lỗi gọi API AI report:", e);
      setAiAnalysisResult("❌ Không thể kết nối máy chủ AI. Vui lòng kiểm tra GEMINI_API_KEY.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Export Excel (.XLSX)
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Summary Stats
    const summaryData = [
      ["BÁO CÁO TỔNG HỢP TIẾN ĐỘ CÔNG VIỆC ĐƠN VỊ"],
      [`Kỳ báo cáo: ${reportType === 'weekly' ? 'Báo cáo Tuần' : 'Báo cáo Tháng'} - ${periodName}`],
      [`Đơn vị: ${selectedDeptObj ? selectedDeptObj.name : 'Toàn Đơn Vị'}`],
      [`Ngày xuất báo cáo: ${getTodayString()}`],
      [""],
      ["CHỈ SỐ THỐNG KÊ TIẾN ĐỘ", "SỐ LƯỢNG", "TỶ LỆ (%)"],
      ["Tổng số công việc", stats.total, "100%"],
      ["Đã hoàn thành", stats.completed, `${stats.completionRate}%`],
      ["Đang thực hiện", stats.inProgress, `${Math.round((stats.inProgress/stats.total)*100 || 0)}%`],
      ["Chưa thực hiện", stats.todo, `${Math.round((stats.todo/stats.total)*100 || 0)}%`],
      ["QUÁ HẠN (CẢNH BÁO ĐỎ)", stats.overdue, `${stats.overdueRate}%`]
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "TongHopTienDo");

    // Sheet 2: All Tasks
    const tasksTable = filteredTasks.map(t => ({
      "Mã CV": t.code,
      "Tên Công Việc": t.title,
      "Phòng Ban Thụ Lý": t.departmentName,
      "Cán Bộ Phụ Trách": t.assigneeName,
      "Ngày Giao": t.startDate,
      "Thời Hạn (Deadline)": t.dueDate,
      "Tiến Độ (%)": `${t.progress}%`,
      "Trạng Thái": t.status === 'completed' ? 'Đã hoàn thành' : t.dueDate < getTodayString() ? 'QUÁ HẠN' : 'Đang làm',
      "Độ Ưu Tiên": t.priority,
      "Sản Phẩm Bàn Giao": t.deliverable || ''
    }));
    const wsTasks = XLSX.utils.json_to_sheet(tasksTable);
    XLSX.utils.book_append_sheet(wb, wsTasks, "DanhSachCongViec");

    // Sheet 3: Overdue Tasks
    const overdueTable = overdueTasks.map(t => ({
      "Mã CV": t.code,
      "Tên Công Việc": t.title,
      "Phòng Ban": t.departmentName,
      "Cán Bộ Thụ Lý": t.assigneeName,
      "Hạn Hoàn Thành": t.dueDate,
      "Tiến Độ Hiện Tại": `${t.progress}%`,
      "Ghi Chú Tiến Độ": t.notes || ''
    }));
    const wsOverdue = XLSX.utils.json_to_sheet(overdueTable);
    XLSX.utils.book_append_sheet(wb, wsOverdue, "CongViecQuaHan");

    // Write file
    XLSX.writeFile(wb, `BaoCao_TienDo_DonVi_${getTodayString()}.xlsx`);
  };

  // Print PDF
  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            <span>TỰ ĐỘNG XUẤT BÁO CÁO TIẾN ĐỘ & PHÂN TÍCH AI</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổng hợp dữ liệu báo cáo tuần/tháng, kết xuất Excel và bản in PDF chuẩn văn bản hành chính công vụ
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleGenerateAiReport}
            disabled={isAiLoading}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-lg shadow-md transition-all cursor-pointer flex items-center space-x-2 disabled:opacity-50"
          >
            {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{isAiLoading ? 'AI Đang Phân Tích...' : 'Phân Tích AI Gemini'}</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-lg shadow transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Excel (.xlsx)</span>
          </button>

          <button
            onClick={handlePrintPdf}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs sm:text-sm rounded-lg shadow transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>In / Xuất PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Selector Row */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 print:hidden">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Loại Báo Cáo:</label>
          <div className="flex space-x-2">
            <button
              onClick={() => { setReportType('weekly'); setPeriodName('Tuần này'); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                reportType === 'weekly' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-slate-50 text-slate-700 border-slate-300'
              }`}
            >
              📅 Báo Cáo Tuần
            </button>
            <button
              onClick={() => { setReportType('monthly'); setPeriodName('Tháng 07/2026'); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                reportType === 'monthly' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-slate-50 text-slate-700 border-slate-300'
              }`}
            >
              📆 Báo Cáo Tháng
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Kỳ Báo Cáo:</label>
          <select
            value={periodName}
            onChange={(e) => setPeriodName(e.target.value)}
            className="w-full p-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-slate-50"
          >
            {reportType === 'weekly' ? (
              <>
                <option value="Tuần 29 (15/07 - 21/07/2026)">Tuần hiện tại (T7/2026)</option>
                <option value="Tuần 28 (08/07 - 14/07/2026)">Tuần trước</option>
                <option value="Tuần 30 (22/07 - 28/07/2026)">Tuần kế tiếp</option>
              </>
            ) : (
              <>
                <option value="Tháng 07/2026">Tháng 07/2026</option>
                <option value="Tháng 06/2026">Tháng 06/2026</option>
                <option value="Tháng 08/2026">Tháng 08/2026</option>
                <option value="Quý III năm 2026">Báo cáo Quý III/2026</option>
              </>
            )}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Đơn Vị / Phòng Ban:</label>
          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="w-full p-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-slate-50"
          >
            <option value="all">-- Toàn Cơ Quan Đơn Vị --</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* PRINTABLE ADMINISTRATIVE REPORT DOCUMENT */}
      <div id="printable-report" className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 sm:p-12 space-y-8 text-slate-900 print:shadow-none print:border-none print:p-0">
        
        {/* Official Header */}
        <div className="grid grid-cols-2 text-center border-b pb-6 border-slate-300">
          <div>
            <p className="font-bold text-xs uppercase tracking-wider text-slate-800">ĐƠN VỊ CẤP TRÊN QUẢN LÝ</p>
            <p className="font-extrabold text-sm uppercase text-blue-900">
              {selectedDeptObj ? selectedDeptObj.name.toUpperCase() : 'TỔNG HỢP TOÀN ĐƠN VỊ'}
            </p>
            <p className="text-[11px] text-slate-500 font-mono mt-1">Số: .../BC-TĐCV</p>
          </div>

          <div>
            <p className="font-bold text-xs uppercase tracking-wider text-slate-900">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
            <p className="font-extrabold text-xs uppercase text-slate-900">Độc lập - Tự do - Hạnh phúc</p>
            <p className="text-xs text-slate-500 italic mt-1">
              ..., Ngày {new Date().getDate()} tháng {new Date().getMonth()+1} năm {new Date().getFullYear()}
            </p>
          </div>
        </div>

        {/* Report Title */}
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-extrabold uppercase text-slate-900 tracking-tight">
            BÁO CÁO TỔNG HỢP TIẾN ĐỘ THỰC HIỆN CÔNG VIỆC
          </h2>
          <p className="text-sm font-semibold text-slate-700">
            {reportType === 'weekly' ? 'KỲ BÁO CÁO TUẦN:' : 'KỲ BÁO CÁO THÁNG:'} <span className="text-blue-900 underline font-bold">{periodName}</span>
          </p>
        </div>

        {/* I. Summary Metrics Table */}
        <div className="space-y-3">
          <h3 className="font-bold text-base text-slate-900 border-l-4 border-blue-600 pl-3">
            I. BẢNG CHỈ SỐ THỐNG KÊ TIẾN ĐỘ THỰC HIỆN CÔNG VIỆC
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-500 font-bold uppercase">TỔNG SỐ VIỆC</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats.total}</p>
            </div>

            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
              <p className="text-xs text-emerald-800 font-bold uppercase">HOÀN THÀNH</p>
              <p className="text-2xl font-black text-emerald-700 mt-1">{stats.completed} ({stats.completionRate}%)</p>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800 font-bold uppercase">ĐANG THỰC HIỆN</p>
              <p className="text-2xl font-black text-blue-700 mt-1">{stats.inProgress}</p>
            </div>

            <div className="bg-red-100 p-3 rounded-lg border border-red-300">
              <p className="text-xs text-red-900 font-bold uppercase">🔴 VIỆC QUÁ HẠN</p>
              <p className="text-2xl font-black text-red-700 mt-1">{stats.overdue} ({stats.overdueRate}%)</p>
            </div>
          </div>
        </div>

        {/* II. AI Generated Analysis Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 border-l-4 border-purple-600 pl-3 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-600 print:hidden" />
              <span>II. ĐÁNH GIÁ TỔNG QUAN VÀ PHÂN TÍCH TIẾN ĐỘ (TRỢ LÝ AI TỰ ĐỘNG)</span>
            </h3>

            {!aiAnalysisResult && (
              <button
                onClick={handleGenerateAiReport}
                disabled={isAiLoading}
                className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded border border-purple-200 hover:bg-purple-100 print:hidden cursor-pointer"
              >
                + Bấm để khởi tạo phân tích AI
              </button>
            )}
          </div>

          {isAiLoading ? (
            <div className="p-8 bg-purple-50 rounded-xl border border-purple-200 text-center space-y-2">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
              <p className="font-bold text-purple-900 text-sm">Hệ thống Gemini AI đang phân tích dữ liệu tiến độ thực tế...</p>
              <p className="text-xs text-purple-700">Tự động tổng hợp điểm sáng, rủi ro quá hạn và khuyến nghị cho Lãnh đạo</p>
            </div>
          ) : aiAnalysisResult ? (
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 leading-relaxed space-y-3 whitespace-pre-line font-serif">
              {aiAnalysisResult}
            </div>
          ) : (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-600 italic">
              Bấm nút "Phân Tích AI Gemini" để hệ thống tự động sinh báo cáo nhận xét chi tiết bằng tiếng Việt.
            </div>
          )}
        </div>

        {/* III. Overdue Red Alert Tasks Section */}
        <div className="space-y-3">
          <h3 className="font-bold text-base text-slate-900 border-l-4 border-red-600 pl-3 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600 print:hidden" />
            <span>III. DANH SÁCH CÁC CÔNG VIỆC QUÁ HẠN CẦN ĐÔN ĐỐC XỬ LÝ GẤP</span>
          </h3>

          {overdueTasks.length === 0 ? (
            <p className="text-xs text-slate-600 bg-emerald-50 p-3 rounded border border-emerald-200 font-medium">
              ✓ Trong kỳ báo cáo không ghi nhận công việc nào quá hạn.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-red-100 text-red-950 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2.5 border-r border-slate-300">Mã CV</th>
                    <th className="p-2.5 border-r border-slate-300">Tên Công Việc</th>
                    <th className="p-2.5 border-r border-slate-300">Đơn Vị Thụ Lý</th>
                    <th className="p-2.5 border-r border-slate-300">Cán Bộ Phụ Trách</th>
                    <th className="p-2.5 border-r border-slate-300 text-center">Deadline</th>
                    <th className="p-2.5 text-center">Tiến Độ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {overdueTasks.map(task => (
                    <tr key={task.id} className="bg-red-50/50">
                      <td className="p-2.5 font-mono font-bold border-r border-slate-300">{task.code}</td>
                      <td className="p-2.5 font-bold text-red-900 border-r border-slate-300">{task.title}</td>
                      <td className="p-2.5 border-r border-slate-300">{task.departmentName}</td>
                      <td className="p-2.5 border-r border-slate-300 font-semibold">{task.assigneeName}</td>
                      <td className="p-2.5 text-center font-bold text-red-600 border-r border-slate-300">{task.dueDate}</td>
                      <td className="p-2.5 text-center font-bold">{task.progress}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* IV. Official Signatures Section */}
        <div className="pt-8 grid grid-cols-2 text-center text-xs font-semibold">
          <div>
            <p className="uppercase text-slate-700 font-bold">NGƯỜI LẬP BÁO CÁO</p>
            <p className="text-[11px] text-slate-500 italic">(Ký, ghi rõ họ tên)</p>
            <div className="h-20" />
            <p className="font-bold text-slate-900">Chuyên viên Tổng hợp</p>
          </div>

          <div>
            <p className="uppercase text-slate-900 font-bold">THỦ TRƯỞNG ĐƠN VỊ</p>
            <p className="text-[11px] text-slate-500 italic">(Ký duyệt, đóng dấu)</p>
            <div className="h-20" />
            <p className="font-bold text-slate-900 text-sm">LÃNH ĐẠO ĐƠN VỊ</p>
          </div>
        </div>

      </div>
    </div>
  );
};
