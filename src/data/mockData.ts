import { Department, Officer, Task, NotificationItem } from '../types';

// Helper to format date strings YYYY-MM-DD relative to today
export function getRelativeDateString(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-1',
    name: 'Tổ Tổng hợp',
    code: 'TTH',
    managerName: 'Đại úy Nguyễn Văn An',
    email: 'totonghop.chiengsinh@congan.gov.vn',
    phone: '0212.385.101',
    memberCount: 4
  },
  {
    id: 'dept-2',
    name: 'Tổ An ninh',
    code: 'TAN',
    managerName: 'Thượng úy Lò Văn Tâm',
    email: 'toanninh.chiengsinh@congan.gov.vn',
    phone: '0212.385.102',
    memberCount: 4
  },
  {
    id: 'dept-3',
    name: 'Tổ CSKV (Cảnh sát khu vực)',
    code: 'CSKV',
    managerName: 'Thượng úy Cầm Văn Hoàng',
    email: 'tocskv.chiengsinh@congan.gov.vn',
    phone: '0212.385.103',
    memberCount: 6
  },
  {
    id: 'dept-4',
    name: 'Tổ PCTP (Phòng chống tội phạm)',
    code: 'PCTP',
    managerName: 'Đại úy Trần Quốc Tuấn',
    email: 'topctp.chiengsinh@congan.gov.vn',
    phone: '0212.385.104',
    memberCount: 5
  },
  {
    id: 'dept-5',
    name: 'Tổ CSTT (Cảnh sát trật tự)',
    code: 'CSTT',
    managerName: 'Trung úy Vì Văn Hải',
    email: 'tocstt.chiengsinh@congan.gov.vn',
    phone: '0212.385.105',
    memberCount: 4
  }
];

export const INITIAL_OFFICERS: Officer[] = [
  {
    id: 'off-1',
    name: 'Đại úy Nguyễn Văn An',
    title: 'Tổ trưởng Tổ Tổng hợp',
    email: 'an.nguyen@congan.gov.vn',
    phone: '0912.345.678',
    departmentId: 'dept-1',
    departmentName: 'Tổ Tổng hợp'
  },
  {
    id: 'off-2',
    name: 'Thượng úy Lê Thị Mai',
    title: 'Cán bộ Tổng hợp & Đề án 06',
    email: 'mai.le@congan.gov.vn',
    phone: '0983.112.233',
    departmentId: 'dept-1',
    departmentName: 'Tổ Tổng hợp'
  },
  {
    id: 'off-3',
    name: 'Thượng úy Lò Văn Tâm',
    title: 'Tổ trưởng Tổ An ninh',
    email: 'tam.lo@congan.gov.vn',
    phone: '0904.556.778',
    departmentId: 'dept-2',
    departmentName: 'Tổ An ninh'
  },
  {
    id: 'off-4',
    name: 'Trung úy Hà Văn Sơn',
    title: 'Cán bộ An ninh địa bàn',
    email: 'son.ha@congan.gov.vn',
    phone: '0977.889.900',
    departmentId: 'dept-2',
    departmentName: 'Tổ An ninh'
  },
  {
    id: 'off-5',
    name: 'Thượng úy Cầm Văn Hoàng',
    title: 'Tổ trưởng Tổ CSKV',
    email: 'hoang.cam@congan.gov.vn',
    phone: '0913.224.466',
    departmentId: 'dept-3',
    departmentName: 'Tổ CSKV (Cảnh sát khu vực)'
  },
  {
    id: 'off-6',
    name: 'Đại úy Tòng Văn Nam',
    title: 'Cán bộ CSKV phụ trách các bản',
    email: 'nam.tong@congan.gov.vn',
    phone: '0936.778.899',
    departmentId: 'dept-3',
    departmentName: 'Tổ CSKV (Cảnh sát khu vực)'
  },
  {
    id: 'off-7',
    name: 'Đại úy Trần Quốc Tuấn',
    title: 'Tổ trưởng Tổ PCTP',
    email: 'tuan.tran@congan.gov.vn',
    phone: '0945.123.987',
    departmentId: 'dept-4',
    departmentName: 'Tổ PCTP (Phòng chống tội phạm)'
  },
  {
    id: 'off-8',
    name: 'Thượng úy Quang Văn Đức',
    title: 'Trinh sát viên PCTP',
    email: 'duc.quang@congan.gov.vn',
    phone: '0988.776.554',
    departmentId: 'dept-4',
    departmentName: 'Tổ PCTP (Phòng chống tội phạm)'
  },
  {
    id: 'off-9',
    name: 'Trung úy Vì Văn Hải',
    title: 'Tổ trưởng Tổ CSTT',
    email: 'hai.vi@congan.gov.vn',
    phone: '0915.667.889',
    departmentId: 'dept-5',
    departmentName: 'Tổ CSTT (Cảnh sát trật tự)'
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-101',
    code: 'CV-CAS-001',
    title: 'Tổng hợp Báo cáo kết quả thực hiện Đề án 06 & Rà soát dữ liệu Dân cư tháng 7',
    description: 'Tổng hợp số liệu làm sạch dữ liệu dân cư "đúng, đủ, sạch, sống", đăng ký tài khoản VNeID và cập nhật biến động dân cư địa bàn xã Chiềng Sinh.',
    departmentId: 'dept-1',
    departmentName: 'Tổ Tổng hợp',
    assigneeId: 'off-2',
    assigneeName: 'Thượng úy Lê Thị Mai',
    assigneeEmail: 'mai.le@congan.gov.vn',
    assignerName: 'Trưởng Công an xã Chiềng Sinh',
    startDate: getRelativeDateString(-12),
    dueDate: getRelativeDateString(-4), // QUÁ HẠN 4 ngày!
    status: 'in_progress',
    priority: 'urgent',
    progress: 65,
    deliverable: 'Báo cáo tổng hợp số liệu Đề án 06 + Phụ lục biểu thống kê gửi Công an TP/Huyện',
    notes: 'Đã hoàn thành 80% khối lượng rà soát, đang chờ Tổ CSKV gửi bổ sung bảng kiểm tra bản Chiềng Sinh.',
    createdAt: getRelativeDateString(-12),
    updatedAt: getRelativeDateString(-1),
    tags: ['Đề án 06', 'Dữ liệu Dân cư']
  },
  {
    id: 'task-102',
    code: 'CV-CAS-002',
    title: 'Rà soát, lập danh sách các đối tượng nguy cơ và tụ điểm phức tạp về ma túy',
    description: 'Kiểm tra, lập danh sách quản lý đối tượng nghiện, người sử dụng trái phép chất ma túy và quản lý sau cai trên địa bàn xã Chiềng Sinh.',
    departmentId: 'dept-4',
    departmentName: 'Tổ PCTP (Phòng chống tội phạm)',
    assigneeId: 'off-8',
    assigneeName: 'Thượng úy Quang Văn Đức',
    assigneeEmail: 'duc.quang@congan.gov.vn',
    assignerName: 'Phó Trưởng CAX phụ trách PCTP',
    startDate: getRelativeDateString(-10),
    dueDate: getRelativeDateString(-2), // QUÁ HẠN 2 ngày!
    status: 'todo',
    priority: 'critical',
    progress: 30,
    deliverable: 'Danh sách đối tượng trọng điểm + Hồ sơ quản lý địa bàn ma túy',
    notes: 'Đang tiếp tục xác minh thông tin lưu trú thực tế tại một số bản vùng cao.',
    createdAt: getRelativeDateString(-10),
    updatedAt: getRelativeDateString(-2),
    tags: ['PCTP', 'Phòng chống Ma túy']
  },
  {
    id: 'task-103',
    code: 'CV-CAS-003',
    title: 'Cập nhật, thu nhận hồ sơ Căn cước và định danh điện tử VNeID lưu động',
    description: 'Tổ chức các ca thu nhận hồ sơ cấp Căn cước mới cho học sinh và công dân cao tuổi tại nhà văn hóa các bản trên địa bàn xã Chiềng Sinh.',
    departmentId: 'dept-3',
    departmentName: 'Tổ CSKV (Cảnh sát khu vực)',
    assigneeId: 'off-6',
    assigneeName: 'Đại úy Tòng Văn Nam',
    assigneeEmail: 'nam.tong@congan.gov.vn',
    assignerName: 'Tổ trưởng Tổ CSKV',
    startDate: getRelativeDateString(-5),
    dueDate: getRelativeDateString(1), // SẮP ĐẾN HẠN
    status: 'in_progress',
    priority: 'important',
    progress: 85,
    deliverable: 'Danh sách công dân đã thu nhận Căn cước + Tài khoản VNeID mức 2',
    notes: 'Đã hoàn thành thu nhận cho 120/140 chỉ tiêu được giao.',
    createdAt: getRelativeDateString(-5),
    updatedAt: getRelativeDateString(0),
    tags: ['Căn cước', 'VNeID', 'CSKV']
  },
  {
    id: 'task-104',
    code: 'CV-CAS-004',
    title: 'Tăng cường tuần tra, xử lý vi phạm trật tự công cộng, trật tự ATGT khu vực chợ',
    description: 'Tổ chức ca tuần tra kiểm soát, giải tỏa hành lang an toàn giao thông, lấn chiếm lòng lề đường và đảm bảo ANTT khu vực chợ xã Chiềng Sinh.',
    departmentId: 'dept-5',
    departmentName: 'Tổ CSTT (Cảnh sát trật tự)',
    assigneeId: 'off-9',
    assigneeName: 'Trung úy Vì Văn Hải',
    assigneeEmail: 'hai.vi@congan.gov.vn',
    assignerName: 'Phó Trưởng Công an xã',
    startDate: getRelativeDateString(-15),
    dueDate: getRelativeDateString(-1), // QUÁ HẠN 1 ngày!
    status: 'in_progress',
    priority: 'critical',
    progress: 80,
    deliverable: 'Biên bản vi phạm trật tự + Kế hoạch duy trì trật tự đô thị/nông thôn',
    notes: 'Đã nhắc nhở 18 trường hợp buôn bán lấn chiếm, lập biên bản 3 trường hợp cố tình vi phạm.',
    createdAt: getRelativeDateString(-15),
    updatedAt: getRelativeDateString(0),
    tags: ['Trật tự công cộng', 'ATGT']
  },
  {
    id: 'task-105',
    code: 'CV-CAS-005',
    title: 'Nắm tình hình an ninh nông thôn, an ninh tôn giáo và giải quyết mâu thuẫn cơ sở',
    description: 'Rà soát các tranh chấp đất đai, mâu thuẫn nội bộ nhân dân tại các bản, tham mưu cho Cấp ủy, Chính quyền xã giải quyết dứt điểm.',
    departmentId: 'dept-2',
    departmentName: 'Tổ An ninh',
    assigneeId: 'off-4',
    assigneeName: 'Trung úy Hà Văn Sơn',
    assigneeEmail: 'son.ha@congan.gov.vn',
    assignerName: 'Tổ trưởng Tổ An ninh',
    startDate: getRelativeDateString(-20),
    dueDate: getRelativeDateString(-5),
    status: 'completed',
    priority: 'urgent',
    progress: 100,
    deliverable: 'Báo cáo tình hình an ninh địa bàn + Báo cáo hòa giải mâu thuẫn thành công',
    notes: 'Đã hòa giải thành công 2 vụ tranh chấp đường đi nội bản.',
    createdAt: getRelativeDateString(-20),
    updatedAt: getRelativeDateString(-5),
    completedAt: getRelativeDateString(-5),
    tags: ['An ninh nông thôn', 'Hòa giải']
  },
  {
    id: 'task-106',
    code: 'CV-CAS-006',
    title: 'Kiểm tra an toàn PCCC & CNCH đối với các cơ sở kinh doanh có điều kiện về ANTT',
    description: 'Tổ chức kiểm tra thực tế điều kiện an toàn PCCC, quản lý cư trú tại các nhà trọ, cơ sở karaoke, gas trên địa bàn xã Chiềng Sinh.',
    departmentId: 'dept-3',
    departmentName: 'Tổ CSKV (Cảnh sát khu vực)',
    assigneeId: 'off-5',
    assigneeName: 'Thượng úy Cầm Văn Hoàng',
    assigneeEmail: 'hoang.cam@congan.gov.vn',
    assignerName: 'Trưởng Công an xã Chiềng Sinh',
    startDate: getRelativeDateString(-7),
    dueDate: getRelativeDateString(3),
    status: 'in_progress',
    priority: 'normal',
    progress: 50,
    deliverable: 'Biên bản kiểm tra an toàn PCCC & Cam kết chấp hành quy định ANTT',
    notes: 'Đã kiểm tra 8/15 cơ sở trên địa bàn.',
    createdAt: getRelativeDateString(-7),
    updatedAt: getRelativeDateString(0),
    tags: ['PCCC', 'ANTT']
  },
  {
    id: 'task-107',
    code: 'CV-CAS-007',
    title: 'Tuyên truyền phòng chống tội phạm trộm cắp và lừa đảo trên không gian mạng',
    description: 'Tổ chức buổi tuyên truyền phương thức thủ đoạn lừa đảo công nghệ cao và phòng chống trộm cắp tài sản cho nhân dân.',
    departmentId: 'dept-4',
    departmentName: 'Tổ PCTP (Phòng chống tội phạm)',
    assigneeId: 'off-7',
    assigneeName: 'Đại úy Trần Quốc Tuấn',
    assigneeEmail: 'tuan.tran@congan.gov.vn',
    assignerName: 'Trưởng Công an xã Chiềng Sinh',
    startDate: getRelativeDateString(-25),
    dueDate: getRelativeDateString(-10),
    status: 'completed',
    priority: 'important',
    progress: 100,
    deliverable: 'Bài phát thanh tuyên truyền + Tờ rơi cảnh báo phát tới các hộ gia đình',
    notes: 'Đã phát 500 tờ rơi tuyên truyền và đăng bài trên trang Zalo OA Công an xã.',
    createdAt: getRelativeDateString(-25),
    updatedAt: getRelativeDateString(-10),
    completedAt: getRelativeDateString(-10),
    tags: ['Tuyên truyền', 'An ninh mạng']
  },
  {
    id: 'task-108',
    code: 'CV-CAS-008',
    title: 'Lập Kế hoạch công tác công an trọng tâm tháng 8/2026 của Công an xã Chiềng Sinh',
    description: 'Tham mưu ban hành Kế hoạch công tác tháng 8, phân công chỉ tiêu cụ thể cho từng Tổ công tác và từng cán bộ chiến sĩ.',
    departmentId: 'dept-1',
    departmentName: 'Tổ Tổng hợp',
    assigneeId: 'off-1',
    assigneeName: 'Đại úy Nguyễn Văn An',
    assigneeEmail: 'an.nguyen@congan.gov.vn',
    assignerName: 'Trưởng Công an xã Chiềng Sinh',
    startDate: getRelativeDateString(-2),
    dueDate: getRelativeDateString(10),
    status: 'todo',
    priority: 'important',
    progress: 0,
    deliverable: 'Kế hoạch công tác tháng 8/2026 chính thức ký duyệt',
    notes: 'Đang tổng hợp đề xuất nhiệm vụ từ các Tổ công tác.',
    createdAt: getRelativeDateString(-2),
    updatedAt: getRelativeDateString(-2),
    tags: ['Kế hoạch', 'Công tác Công an']
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    taskId: 'task-101',
    taskCode: 'CV-CAS-001',
    taskTitle: 'Tổng hợp Báo cáo kết quả thực hiện Đề án 06 & Rà soát dữ liệu Dân cư tháng 7',
    recipientType: 'officer',
    recipientName: 'Thượng úy Lê Thị Mai',
    recipientEmail: 'mai.le@congan.gov.vn',
    type: 'overdue_warning',
    title: '⚠️ CẢNH BÁO ĐỎ: CÔNG VIỆC QUÁ HẠN 4 NGÀY!',
    content: 'Công việc "Tổng hợp Báo cáo kết quả thực hiện Đề án 06 & Rà soát dữ liệu Dân cư tháng 7" (Mã CV-CAS-001) đã quá hạn 4 ngày. Đề nghị đồng chí khẩn trương hoàn thiện báo cáo trình Trưởng Công an xã.',
    sentAt: getRelativeDateString(-1) + ' 08:30:00',
    read: false,
    isEmailSent: true
  },
  {
    id: 'notif-2',
    taskId: 'task-102',
    taskCode: 'CV-CAS-002',
    taskTitle: 'Rà soát, lập danh sách các đối tượng nguy cơ và tụ điểm phức tạp về ma túy',
    recipientType: 'department',
    recipientName: 'Tổ PCTP (Phòng chống tội phạm)',
    recipientEmail: 'topctp.chiengsinh@congan.gov.vn',
    type: 'overdue_warning',
    title: '⚠️ CẢNH BÁO QUÁ HẠN: Rà soát danh sách đối tượng ma túy',
    content: 'Công việc CV-CAS-002 đã quá thời hạn hoàn thành 2 ngày. Hệ thống tự động phát tin cảnh báo đến Tổ trưởng Tổ PCTP (Đại úy Trần Quốc Tuấn) và Cán bộ thụ lý.',
    sentAt: getRelativeDateString(-1) + ' 09:00:00',
    read: false,
    isEmailSent: true
  },
  {
    id: 'notif-3',
    taskId: 'task-103',
    taskCode: 'CV-CAS-003',
    taskTitle: 'Cập nhật, thu nhận hồ sơ Căn cước và định danh điện tử VNeID lưu động',
    recipientType: 'officer',
    recipientName: 'Đại úy Tòng Văn Nam',
    recipientEmail: 'nam.tong@congan.gov.vn',
    type: 'reminder',
    title: '⏰ NHẮC NHỞ: Nhiệm vụ thu nhận Căn cước sắp đến hạn',
    content: 'Nhiệm vụ "Cập nhật, thu nhận hồ sơ Căn cước và định danh điện tử VNeID lưu động" có thời hạn hoàn thành vào ngày ' + getRelativeDateString(1) + '. Đề nghị đồng chí hoàn thiện danh sách thu nhận.',
    sentAt: getRelativeDateString(0) + ' 07:30:00',
    read: true,
    isEmailSent: true
  }
];

