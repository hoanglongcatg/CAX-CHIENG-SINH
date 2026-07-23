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
