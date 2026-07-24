import { Task } from '../types';

export const GOOGLE_SHEETS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwfKTuKu3mn32SzlwMNqmgrneYXsZYHYJWRUD7xSxv8-W1T6DmsdO_9nyd_MXYG22E/exec';

/**
 * Sends task data to Google Sheets via Google Apps Script Web App POST endpoint
 */
export async function sendTaskToGoogleSheets(taskData: Partial<Task>): Promise<boolean> {
  try {
    const codeVal = taskData.code ? String(taskData.code).trim() : (taskData.id || `task-${Date.now()}`);
    const deptNameVal = taskData.departmentName || (taskData as any).department || 'Tổ Tổng hợp';
    const assigneeNameVal = taskData.assigneeName || (taskData as any).assignee || 'Cán bộ chưa phân công';

    const statusText = 
      taskData.status === 'completed' ? 'Đã hoàn thành' :
      taskData.status === 'pending_approval' ? 'Chờ Trưởng CAX phê duyệt' :
      taskData.status === 'in_progress' ? 'Đang thực hiện' :
      taskData.status === 'overdue' ? 'Quá hạn' :
      taskData.status === 'on_hold' ? 'Tạm dừng' :
      'Chưa thực hiện';

    const payload = {
      action: 'updateTask',
      id: codeVal,
      code: codeVal,
      'Mã CV': codeVal,
      'Mã công việc': codeVal,
      'Mã CV (code)': codeVal,
      'Mã số': codeVal,
      title: taskData.title || '',
      'Tên công việc': taskData.title || '',
      description: taskData.description || '',
      'Mô tả': taskData.description || '',
      
      departmentId: taskData.departmentId || '',
      departmentName: deptNameVal,
      department: deptNameVal,
      'Phòng ban': deptNameVal,
      'Bộ phận': deptNameVal,
      'Tổ': deptNameVal,
      'Đơn vị': deptNameVal,
      'Tổ công tác': deptNameVal,

      assigneeId: taskData.assigneeId || '',
      assigneeName: assigneeNameVal,
      assignee: assigneeNameVal,
      'Cán bộ': assigneeNameVal,
      'Cán bộ phụ trách': assigneeNameVal,
      'Cán bộ thực hiện': assigneeNameVal,
      'Người thực hiện': assigneeNameVal,
      'Cán bộ đảm nhận': assigneeNameVal,

      assigneeEmail: taskData.assigneeEmail || '',
      assignerName: taskData.assignerName || '',
      startDate: taskData.startDate || '',
      dueDate: taskData.dueDate || '',
      'Thời hạn': taskData.dueDate || '',
      priority: taskData.priority || '',
      'Độ ưu tiên': taskData.priority || '',
      status: taskData.status || '',
      'Trạng thái': statusText,
      progress: taskData.progress ?? 0,
      'Tiến độ': taskData.progress ?? 0,
      deliverable: taskData.deliverable || '',
      notes: taskData.notes || '',
      'Ghi chú': taskData.notes || '',
      approvalStatus: taskData.approvalStatus || '',
      isEarlyCompletion: taskData.isEarlyCompletion ? 'Có' : 'Không',
      approvedBy: taskData.approvedBy || '',
      approvedAt: taskData.approvedAt || '',
      completedAt: taskData.completedAt || '',
      approvalNote: taskData.approvalNote || '',
      createdAt: taskData.createdAt || new Date().toISOString(),
      updatedAt: taskData.updatedAt || new Date().toISOString()
    };

    await fetch(GOOGLE_SHEETS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    console.log('▶️ [Google Sheets] Gửi thành công dữ liệu công việc:', taskData.code);
    return true;
  } catch (error) {
    console.error('❌ [Google Sheets] Lỗi khi gửi dữ liệu:', error);
    return false;
  }
}

/**
 * Fetches all tasks from Google Sheets via Google Apps Script Web App GET endpoint
 */
export async function fetchTasksFromGoogleSheets(): Promise<Task[] | null> {
  try {
    const response = await fetch(GOOGLE_SHEETS_SCRIPT_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.warn('⚠️ [Google Sheets] Response not ok:', response.status);
      return null;
    }

    const json = await response.json();
    console.log('▶️ [Google Sheets] Đã tải dữ liệu thô:', json);

    let rawList: any[] = [];
    if (Array.isArray(json)) {
      rawList = json;
    } else if (json && typeof json === 'object') {
      if (Array.isArray(json.tasks)) rawList = json.tasks;
      else if (Array.isArray(json.data)) rawList = json.data;
      else if (Array.isArray(json.result)) rawList = json.result;
      else if (Array.isArray(json.items)) rawList = json.items;
      else if (Array.isArray(json.rows)) rawList = json.rows;
    }

    if (!rawList || rawList.length === 0) {
      return [];
    }

    // Handle array of arrays (e.g. sheet.getDataRange().getValues())
    if (Array.isArray(rawList[0])) {
      const headers = rawList[0].map((h: any) => String(h || '').trim());
      const rows = rawList.slice(1);
      rawList = rows.map((row: any[]) => {
        const obj: Record<string, any> = {};
        headers.forEach((h: string, idx: number) => {
          if (h) obj[h] = row[idx];
        });
        return obj;
      });
    }

    // Helper to extract field value with multiple potential key names
    const getVal = (item: Record<string, any>, possibleKeys: string[]): any => {
      if (!item || typeof item !== 'object') return undefined;

      // Direct exact match
      for (const k of possibleKeys) {
        if (item[k] !== undefined && item[k] !== null && String(item[k]).trim() !== '') {
          return item[k];
        }
      }

      // Fuzzy / normalized key match
      const itemKeys = Object.keys(item);
      for (const pKey of possibleKeys) {
        const normPKey = pKey.toLowerCase().replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, '');
        for (const iKey of itemKeys) {
          const normIKey = iKey.toLowerCase().replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, '');
          if (normIKey === normPKey && item[iKey] !== undefined && item[iKey] !== null && String(item[iKey]).trim() !== '') {
            return item[iKey];
          }
        }
      }
      return undefined;
    };

    // Helper to format date strings to YYYY-MM-DD
    const formatDate = (val: any): string => {
      if (!val) return new Date().toISOString().split('T')[0];
      const str = String(val).trim();
      if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(str)) {
        const parts = str.split('/');
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2].substring(0, 4);
        return `${year}-${month}-${day}`;
      }
      if (!isNaN(Date.parse(str))) {
        try {
          const d = new Date(str);
          return d.toISOString().split('T')[0];
        } catch {
          // fallback
        }
      }
      return str;
    };

    // Normalize items to Task interface
    const tasks: Task[] = rawList
      .filter(item => item && typeof item === 'object')
      .map((item, index) => {
        const title = getVal(item, ['Tên công việc', 'Tên CV', 'title', 'Tiêu đề', 'Nội dung công việc', 'Nội dung', 'taskName', 'name', '1', 'colB', 'col_B', 'B']) || 'Công việc từ Google Sheets';
        const rawCode = getVal(item, ['Mã công việc', 'Mã CV', 'code', 'Mã CV (code)', 'Mã số', 'ID CV', 'Code', 'Macv', 'MaCV', 'Mã_CV', 'id', 'ID', 'Id', 'id_task', '0', 'colA', 'col_A', 'A']);
        const defaultCode = `task-${Date.now()}-${index}`;
        const code = rawCode ? String(rawCode).trim() : defaultCode;
        const idVal = getVal(item, ['id', 'ID', 'Id', 'id_task', 'Mã công việc', 'Mã CV', 'code']);
        const id = idVal ? String(idVal).trim() : code;
        const description = getVal(item, ['description', 'Mô tả', 'Nội dung', 'Chi tiết', 'Mô tả công việc']) || '';
        
        const departmentName = String(getVal(item, ['Bộ phận', 'Phòng ban', 'departmentName', 'Đơn vị', 'Phòng/Ban', 'department', 'Tổ', '2', 'colC', 'col_C', 'C']) || 'Tổ Tổng hợp').trim();
        let departmentId = String(getVal(item, ['departmentId', 'Mã phòng ban', 'Mã bộ phận']) || '').trim();

        if (!departmentId || departmentId === 'dept-1') {
          const norm = departmentName.toLowerCase();
          if (norm.includes('an ninh') || norm.includes('tan')) departmentId = 'dept-2';
          else if (norm.includes('cskv') || norm.includes('cảnh sát khu vực')) departmentId = 'dept-3';
          else if (norm.includes('pctp') || norm.includes('tội phạm')) departmentId = 'dept-4';
          else if (norm.includes('cstt') || norm.includes('trật tự')) departmentId = 'dept-5';
          else departmentId = 'dept-1';
        }
        
        const assigneeVal = getVal(item, [
          'Cán bộ phụ trách',
          'Cán bộ',
          'Người thực hiện',
          'Cán bộ thực hiện',
          'Cán bộ đảm nhận',
          'Người xử lý',
          'Phân công',
          'assigneeName',
          'assignee',
          '3',
          'colD',
          'col_D',
          'D'
        ]);
        const assigneeName = assigneeVal ? String(assigneeVal).trim() : 'Cán bộ chưa phân công';
        const assigneeEmail = getVal(item, ['assigneeEmail', 'Email cán bộ', 'Email người thực hiện', 'Email']) || '';
        const assignerName = getVal(item, ['assignerName', 'Người giao', 'Lãnh đạo giao', 'Ban chỉ huy', 'assigner']) || 'Ban Chỉ huy CAX';
        
        const startDate = formatDate(getVal(item, ['startDate', 'Ngày bắt đầu', 'Bắt đầu', 'Start Date']));
        const dueDate = formatDate(getVal(item, ['Thời hạn', 'dueDate', 'Hạn hoàn thành', 'Ngày hoàn thành', 'Hạn xử lý', 'Due Date', 'Hạn', '4', 'colE', 'col_E', 'E']));

        // Priority normalization
        const rawPriority = String(getVal(item, ['priority', 'Độ ưu tiên', 'Ưu tiên', 'Mức độ']) || 'normal').toLowerCase();
        let priority: Task['priority'] = 'normal';
        if (rawPriority.includes('thượng khẩn') || rawPriority.includes('critical')) {
          priority = 'critical';
        } else if (rawPriority.includes('khẩn') || rawPriority.includes('urgent') || rawPriority.includes('rất cao')) {
          priority = 'urgent';
        } else if (rawPriority.includes('quan trọng') || rawPriority.includes('important') || rawPriority.includes('cao') || rawPriority.includes('high')) {
          priority = 'important';
        } else {
          priority = 'normal';
        }

        // Status normalization
        const rawStatus = String(getVal(item, ['Trạng thái', 'status', 'Tình trạng', '6', 'colG', 'col_G', 'G']) || 'todo').toLowerCase();
        let status: Task['status'] = 'todo';
        if (rawStatus.includes('chờ') || rawStatus.includes('pending') || rawStatus.includes('duyệt') || rawStatus.includes('trình')) {
          status = 'pending_approval';
        } else if (rawStatus.includes('hoàn thành') || rawStatus.includes('completed') || rawStatus.includes('xong') || rawStatus.includes('done')) {
          status = 'completed';
        } else if (rawStatus.includes('đang') || rawStatus.includes('in_progress') || rawStatus.includes('progress') || rawStatus.includes('doing')) {
          status = 'in_progress';
        } else if (rawStatus.includes('quá hạn') || rawStatus.includes('overdue') || rawStatus.includes('trễ')) {
          status = 'overdue';
        } else if (rawStatus.includes('hoãn') || rawStatus.includes('on_hold') || rawStatus.includes('tạm dừng')) {
          status = 'on_hold';
        } else {
          status = 'todo';
        }

        // Progress parsing
        const rawProgress = getVal(item, ['Tiến độ', 'Tiến độ (%)', '% hoàn thành', 'progress', 'Tỷ lệ', '5', 'colF', 'col_F', 'F']);
        let progressNum = 0;
        if (rawProgress !== undefined && rawProgress !== null) {
          const parsed = parseFloat(String(rawProgress).replace(/[^0-9.]/g, ''));
          if (!isNaN(parsed)) progressNum = Math.min(100, Math.max(0, parsed));
        }

        const deliverable = getVal(item, ['deliverable', 'Sản phẩm', 'Sản phẩm cần đạt', 'Yêu cầu sản phẩm', 'Sản phẩm đầu ra']) || '';
        const notes = getVal(item, ['notes', 'Ghi chú', 'Báo cáo tiến độ', 'Phản hồi']) || '';

        return {
          id: String(id),
          code: String(code),
          title: String(title),
          description: String(description),
          departmentId: String(departmentId),
          departmentName: String(departmentName),
          assigneeId: String(getVal(item, ['assigneeId', 'Mã cán bộ']) || ''),
          assigneeName: String(assigneeName),
          assigneeEmail: String(assigneeEmail),
          assignerName: String(assignerName),
          startDate,
          dueDate,
          priority,
          status,
          progress: progressNum,
          deliverable: String(deliverable),
          notes: String(notes),
          createdAt: String(getVal(item, ['createdAt', 'Ngày tạo']) || new Date().toISOString()),
          updatedAt: String(getVal(item, ['updatedAt', 'Ngày cập nhật']) || new Date().toISOString())
        };
      });

    // Deduplicate sheet items by code or id
    const uniqueSheetTasks: Task[] = [];
    const seenKeys = new Set<string>();

    for (const t of tasks) {
      const codeKey = (t.code || '').trim().toLowerCase();
      const idKey = (t.id || '').trim().toLowerCase();
      if (codeKey && seenKeys.has(codeKey)) continue;
      if (idKey && seenKeys.has(idKey)) continue;
      if (codeKey) seenKeys.add(codeKey);
      if (idKey) seenKeys.add(idKey);
      uniqueSheetTasks.push(t);
    }

    console.log(`✅ [Google Sheets] Đã chuẩn hóa thành công ${uniqueSheetTasks.length} công việc duy nhất`);
    return uniqueSheetTasks;
  } catch (error) {
    console.error('❌ [Google Sheets] Lỗi khi tải dữ liệu từ Google Sheets:', error);
    return null;
  }
}

