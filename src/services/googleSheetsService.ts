import { Task } from '../types';

export const GOOGLE_SHEETS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwfKTuKu3mn32SzlwMNqmgrneYXsZYHYJWRUD7xSxv8-W1T6DmsdO_9nyd_MXYG22E/exec';

/**
 * Sends task data to Google Sheets via Google Apps Script Web App POST endpoint
 */
export async function sendTaskToGoogleSheets(taskData: Partial<Task>): Promise<boolean> {
  try {
    const payload = {
      action: 'createTask',
      id: taskData.id || '',
      code: taskData.code || '',
      title: taskData.title || '',
      description: taskData.description || '',
      departmentId: taskData.departmentId || '',
      departmentName: taskData.departmentName || '',
      assigneeId: taskData.assigneeId || '',
      assigneeName: taskData.assigneeName || '',
      assigneeEmail: taskData.assigneeEmail || '',
      assignerName: taskData.assignerName || '',
      startDate: taskData.startDate || '',
      dueDate: taskData.dueDate || '',
      priority: taskData.priority || '',
      status: taskData.status || '',
      progress: taskData.progress ?? 0,
      deliverable: taskData.deliverable || '',
      notes: taskData.notes || '',
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
        const title = getVal(item, ['title', 'Tên công việc', 'Tên CV', 'Tiêu đề', 'Nội dung công việc', 'taskName', 'name']) || 'Công việc từ Google Sheets';
        const code = getVal(item, ['code', 'Mã CV', 'Mã công việc', 'Mã số', 'ID CV', 'Code']) || `CV-CS-${1000 + index}`;
        const id = getVal(item, ['id', 'ID', 'Id', 'id_task']) || `sheet-task-${index}-${Date.now()}`;
        const description = getVal(item, ['description', 'Mô tả', 'Nội dung', 'Chi tiết', 'Mô tả công việc']) || '';
        
        const departmentName = getVal(item, ['departmentName', 'Phòng ban', 'Bộ phận', 'Đơn vị', 'Phòng/Ban', 'department']) || 'Bộ phận tổng hợp';
        const departmentId = getVal(item, ['departmentId', 'Mã phòng ban', 'Mã bộ phận']) || 'dept-1';
        
        const assigneeName = getVal(item, ['assigneeName', 'Cán bộ', 'Cán bộ thực hiện', 'Người thực hiện', 'Người xử lý', 'Phân công', 'Cán bộ đảm nhận', 'assignee']) || 'Cán bộ đảm nhận';
        const assigneeEmail = getVal(item, ['assigneeEmail', 'Email cán bộ', 'Email người thực hiện', 'Email']) || '';
        const assignerName = getVal(item, ['assignerName', 'Người giao', 'Lãnh đạo giao', 'Ban chỉ huy', 'assigner']) || 'Ban Chỉ huy CAX';
        
        const startDate = formatDate(getVal(item, ['startDate', 'Ngày bắt đầu', 'Bắt đầu', 'Start Date']));
        const dueDate = formatDate(getVal(item, ['dueDate', 'Thời hạn', 'Hạn hoàn thành', 'Ngày hoàn thành', 'Hạn xử lý', 'Due Date']));

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
        const rawStatus = String(getVal(item, ['status', 'Trạng thái', 'Tình trạng']) || 'todo').toLowerCase();
        let status: Task['status'] = 'todo';
        if (rawStatus.includes('hoàn thành') || rawStatus.includes('completed') || rawStatus.includes('xong') || rawStatus.includes('done')) {
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
        const rawProgress = getVal(item, ['progress', 'Tiến độ', 'Tiến độ (%)', '% hoàn thành', 'Tỷ lệ']);
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

    console.log(`✅ [Google Sheets] Đã chuẩn hóa thành công ${tasks.length} công việc`);
    return tasks;
  } catch (error) {
    console.error('❌ [Google Sheets] Lỗi khi tải dữ liệu từ Google Sheets:', error);
    return null;
  }
}

