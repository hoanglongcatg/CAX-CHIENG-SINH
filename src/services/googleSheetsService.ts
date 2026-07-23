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
    console.log('▶️ [Google Sheets] Đã tải dữ liệu:', json);

    let rawList: any[] = [];
    if (Array.isArray(json)) {
      rawList = json;
    } else if (json && typeof json === 'object') {
      if (Array.isArray(json.tasks)) rawList = json.tasks;
      else if (Array.isArray(json.data)) rawList = json.data;
      else if (Array.isArray(json.result)) rawList = json.result;
      else if (Array.isArray(json.items)) rawList = json.items;
    }

    if (!rawList || rawList.length === 0) {
      return [];
    }

    // Normalize items to Task interface
    const tasks: Task[] = rawList.map((item, index) => {
      const priorityStr = String(item.priority || item.Priority || 'medium').toLowerCase();
      const priority = (['high', 'medium', 'low'].includes(priorityStr) ? priorityStr : 'medium') as Task['priority'];

      const statusStr = String(item.status || item.Status || 'pending').toLowerCase();
      const status = (['pending', 'in_progress', 'completed', 'overdue'].includes(statusStr) ? statusStr : 'pending') as Task['status'];

      const progressNum = Number(item.progress ?? item.Progress ?? 0);

      return {
        id: String(item.id || item.ID || `sheet-task-${index}-${Date.now()}`),
        code: String(item.code || item.Code || `CV-CS-${1000 + index}`),
        title: String(item.title || item.Title || 'Công việc từ Google Sheets'),
        description: item.description || item.Description || '',
        departmentId: String(item.departmentId || item.DepartmentId || 'dept-1'),
        departmentName: String(item.departmentName || item.DepartmentName || 'Bộ phận tổng hợp'),
        assigneeId: String(item.assigneeId || item.AssigneeId || ''),
        assigneeName: String(item.assigneeName || item.AssigneeName || 'Cán bộ đảm nhận'),
        assigneeEmail: String(item.assigneeEmail || item.AssigneeEmail || ''),
        assignerName: String(item.assignerName || item.AssignerName || 'Ban Chỉ huy CAX'),
        startDate: String(item.startDate || item.StartDate || new Date().toISOString().split('T')[0]),
        dueDate: String(item.dueDate || item.DueDate || new Date().toISOString().split('T')[0]),
        priority,
        status,
        progress: isNaN(progressNum) ? 0 : progressNum,
        deliverable: item.deliverable || item.Deliverable || '',
        notes: item.notes || item.Notes || '',
        createdAt: String(item.createdAt || item.CreatedAt || new Date().toISOString()),
        updatedAt: String(item.updatedAt || item.UpdatedAt || new Date().toISOString())
      };
    });

    return tasks;
  } catch (error) {
    console.error('❌ [Google Sheets] Lỗi khi tải dữ liệu từ Google Sheets:', error);
    return null;
  }
}

