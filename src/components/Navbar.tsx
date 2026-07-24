import React, { useState, useEffect } from 'react';
import { ViewMode, TaskStats } from '../types';
import { 
  LayoutDashboard, 
  ListTodo, 
  Kanban, 
  Mail, 
  FileSpreadsheet, 
  Plus, 
  AlertTriangle, 
  Building2,
  Bell,
  LogOut,
  User as UserIcon,
  LogIn,
  X,
  Send,
  CheckCircle2,
  ShieldCheck,
  Shield,
  Lock,
  Key,
  Eye,
  EyeOff,
  Award,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { 
  auth, 
  signInWithGoogle, 
  sendGmailSignInLink, 
  checkAndCompleteEmailLinkSignIn, 
  logoutUser, 
  User 
} from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export interface CustomPoliceUser {
  username: string;
  displayName: string;
  role: string;
  email: string;
  badgeNumber: string;
}

interface NavbarProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  stats: TaskStats;
  onOpenCreateModal: () => void;
  unreadNotifsCount: number;
  onAuthChange?: (isLoggedIn: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  stats,
  onOpenCreateModal,
  unreadNotifsCount,
  onAuthChange
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [policeUser, setPoliceUser] = useState<CustomPoliceUser | null>(() => {
    const savedPolice = localStorage.getItem('chiengsinh_police_user');
    if (savedPolice) {
      try {
        return JSON.parse(savedPolice);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'police' | 'gmail'>('police');

  // Police Login Form State
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccessMsg, setLoginSuccessMsg] = useState('');

  // Gmail Login State
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);

  useEffect(() => {
    // Check saved police user session
    const savedPolice = localStorage.getItem('chiengsinh_police_user');
    if (savedPolice) {
      try {
        setPoliceUser(JSON.parse(savedPolice));
      } catch (e) {
        console.error("Error parsing saved police user", e);
      }
    }

    // Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsAuthModalOpen(false);
      }
    });

    // Check if user arrived via Email Link sign-in
    checkAndCompleteEmailLinkSignIn().then((signedInUser) => {
      if (signedInUser) {
        setUser(signedInUser);
      }
    }).catch(err => {
      console.error("Error completing email link sign in:", err);
    });

    return () => unsubscribe();
  }, []);

  // Notify parent component about auth state safely
  useEffect(() => {
    const isAuth = !!policeUser || !!user;
    queueMicrotask(() => {
      onAuthChange?.(isAuth);
    });
  }, [policeUser, user, onAuthChange]);

  const ACCOUNTS_DB: Record<string, { pass: string; user: CustomPoliceUser }> = {
    'caxchiengsinh.db': {
      pass: 'chiengsinh123@',
      user: {
        username: 'caxchiengsinh.db',
        displayName: 'Trưởng Công an xã Chiềng Sinh',
        role: 'Ban Chỉ Huy Công An Xã',
        email: 'caxchiengsinh.db@congan.dienbien.gov.vn',
        badgeNumber: 'CAS-1268'
      }
    },
    'nhanviencax.cs': {
      pass: 'nhanvien123@',
      user: {
        username: 'nhanviencax.cs',
        displayName: 'Cán bộ Công an xã Chiềng Sinh',
        role: 'Cán Bộ Nghiệp Vụ',
        email: 'nhanviencax.cs@congan.dienbien.gov.vn',
        badgeNumber: 'CAS-2345'
      }
    },
    'tonghop.cs': {
      pass: 'tonghop123@',
      user: {
        username: 'tonghop.cs',
        displayName: 'Cán bộ Tổ Tổng hợp',
        role: 'Tổ Tổng Hợp',
        email: 'tonghop.cs@congan.dienbien.gov.vn',
        badgeNumber: 'CAS-3001'
      }
    },
    'aninh.cs': {
      pass: 'anninh123@',
      user: {
        username: 'aninh.cs',
        displayName: 'Cán bộ Tổ An ninh',
        role: 'Tổ An Ninh',
        email: 'aninh.cs@congan.dienbien.gov.vn',
        badgeNumber: 'CAS-3002'
      }
    },
    'cskv.cs': {
      pass: 'cskv123@',
      user: {
        username: 'cskv.cs',
        displayName: 'Cán bộ Tổ Cảnh sát khu vực',
        role: 'Tổ CSKV',
        email: 'cskv.cs@congan.dienbien.gov.vn',
        badgeNumber: 'CAS-3003'
      }
    },
    'pctp.cs': {
      pass: 'pctp123@',
      user: {
        username: 'pctp.cs',
        displayName: 'Cán bộ Tổ Phòng chống tội phạm',
        role: 'Tổ PCTP',
        email: 'pctp.cs@congan.dienbien.gov.vn',
        badgeNumber: 'CAS-3004'
      }
    },
    'cstt.cs': {
      pass: 'cstt123@',
      user: {
        username: 'cstt.cs',
        displayName: 'Cán bộ Tổ Cảnh sát trật tự',
        role: 'Tổ CSTT',
        email: 'cstt.cs@congan.dienbien.gov.vn',
        badgeNumber: 'CAS-3005'
      }
    }
  };

  // Police Login Handler
  const handlePoliceLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccessMsg('');

    const u = usernameInput.trim();
    const p = passwordInput.trim();

    const match = ACCOUNTS_DB[u];
    if (match && match.pass === p) {
      setPoliceUser(match.user);
      localStorage.setItem('chiengsinh_police_user', JSON.stringify(match.user));
      setLoginSuccessMsg(`Đăng nhập thành công! Đã xác thực ${match.user.displayName}...`);
      setTimeout(() => {
        setIsAuthModalOpen(false);
        setLoginSuccessMsg('');
      }, 1000);
    } else {
      setLoginError('Tên tài khoản hoặc mật khẩu không chính xác! Vui lòng kiểm tra lại.');
    }
  };

  const handleFillDemoPolice = () => {
    setUsernameInput('caxchiengsinh.db');
    setPasswordInput('chiengsinh123@');
    setLoginError('');
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      await signInWithGoogle();
      setIsAuthModalOpen(false);
    } catch (error: any) {
      if (
        error?.code === 'auth/popup-closed-by-user' || 
        error?.code === 'auth/cancelled-popup-request'
      ) {
        return;
      }
      if (error?.code === 'auth/popup-blocked') {
        alert("Trình duyệt đã chặn cửa sổ bật lên (popup). Vui lòng cho phép popup để đăng nhập Google.");
        return;
      }
      console.error("Login failed", error);
      alert("Đăng nhập bằng Google thất bại: " + (error.message || "Vui lòng thử lại."));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSendEmailLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      alert("Vui lòng nhập địa chỉ Gmail!");
      return;
    }
    try {
      setIsSendingLink(true);
      await sendGmailSignInLink(emailInput.trim());
      setEmailSentSuccess(true);
    } catch (error: any) {
      console.error("Failed to send email link:", error);
      alert("Không thể gửi liên kết đăng nhập. Chi tiết: " + (error.message || "Vui lòng kiểm tra lại địa chỉ email."));
    } finally {
      setIsSendingLink(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (policeUser) {
        setPoliceUser(null);
        localStorage.removeItem('chiengsinh_police_user');
      }
      if (user) {
        await logoutUser();
      }
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-30 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Row */}
        <div className="flex items-center justify-between h-16">
          {/* Brand & Unit Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 via-red-700 to-amber-700 flex items-center justify-center text-amber-300 font-bold shadow-md shadow-red-900/60 border border-amber-400/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-100 tracking-tight">CÔNG AN XÃ CHIỀNG SINH</span>
                <span className="bg-red-900/80 text-amber-300 border border-amber-500/40 text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center space-x-1 shadow-sm">
                  <Award className="w-3 h-3 text-amber-400" />
                  <span>CAND Nghiệp Vụ</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">Hệ thống Theo dõi Tiến độ Công tác, Đôn đốc & Báo cáo Tự động</p>
            </div>
          </div>

          {/* Quick Metrics, Gmail Auth & Actions */}
          <div className="flex items-center space-x-3">
            {/* Overdue Alert Badge */}
            {stats.overdue > 0 && (
              <button
                onClick={() => onSelectView('table')}
                className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-red-600 text-white text-xs font-semibold shadow-lg shadow-red-600/30 hover:bg-red-500 transition-all animate-pulse cursor-pointer"
                title="Bấm để xem các công việc quá hạn"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>CẢNH BÁO: {stats.overdue} VIỆC QUÁ HẠN</span>
              </button>
            )}

            {/* Notification Badge button */}
            <button
              onClick={() => onSelectView('notifications')}
              className="relative p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title="Trung tâm Thông báo & Thư điện tử"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900">
                  {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Create Task Button - Only rendered when logged in */}
            {(policeUser || user) && (
              <button
                onClick={onOpenCreateModal}
                className="flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs sm:text-sm shadow-md transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Giao việc mới</span>
              </button>
            )}

            {/* Police / Gmail Authentication Button or Logged In Badge */}
            {policeUser ? (
              <div className="flex items-center space-x-2 bg-gradient-to-r from-red-950/90 to-slate-900 border border-amber-500/50 rounded-lg p-1.5 pl-2.5 shadow-md">
                <div className="w-7 h-7 rounded-full bg-red-600 border border-amber-400 flex items-center justify-center text-amber-200 text-xs font-bold shadow-inner">
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                </div>
                <div className="hidden lg:block text-left pr-1">
                  <p className="text-xs font-bold text-amber-200 truncate max-w-[140px]">
                    {policeUser.displayName}
                  </p>
                  <p className="text-[10px] text-slate-300 font-mono truncate max-w-[140px]">
                    👤 {policeUser.username}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-md hover:bg-red-900/80 text-slate-300 hover:text-amber-200 transition-colors cursor-pointer"
                  title="Đăng xuất khỏi tài khoản Đơn vị Công an"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : user ? (
              <div className="flex items-center space-x-2 bg-slate-800/90 border border-slate-700/80 rounded-lg p-1.5 pl-2.5">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'User'} 
                    className="w-7 h-7 rounded-full object-cover border border-slate-600"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.email ? user.email.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                  </div>
                )}
                <div className="hidden lg:block text-left pr-1">
                  <p className="text-xs font-semibold text-slate-100 truncate max-w-[120px]">
                    {user.displayName || user.email?.split('@')[0]}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                    {user.email}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-md hover:bg-red-900/50 text-slate-400 hover:text-red-200 transition-colors cursor-pointer"
                  title="Đăng xuất khỏi tài khoản Gmail"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setEmailSentSuccess(false);
                  setLoginError('');
                  setIsAuthModalOpen(true);
                }}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gradient-to-r from-red-700 via-red-800 to-slate-900 text-amber-200 hover:from-red-600 hover:to-slate-800 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer border border-amber-500/40"
                title="Đăng nhập hệ thống"
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Đăng nhập</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex space-x-1 overflow-x-auto py-1 border-t border-slate-800/80">
          <button
            onClick={() => onSelectView('dashboard')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
              currentView === 'dashboard'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Bảng Điều Khiển Tổng Thể</span>
          </button>

          <button
            onClick={() => onSelectView('table')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
              currentView === 'table'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ListTodo className="w-4 h-4" />
            <span>Danh Sách Công Việc</span>
            {stats.overdue > 0 && (
              <span className="ml-1 bg-red-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {stats.overdue} quá hạn
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectView('kanban')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
              currentView === 'kanban'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Kanban className="w-4 h-4" />
            <span>Bảng Kanban Tiến Độ</span>
          </button>

          <button
            onClick={() => onSelectView('notifications')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
              currentView === 'notifications'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Hòm Thư & Thông Báo</span>
          </button>

          <button
            onClick={() => onSelectView('reports')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
              currentView === 'reports'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Báo Cáo Tự Động & AI</span>
          </button>
        </div>
      </div>

      {/* Police CAND & Gmail Login Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl max-w-lg w-full my-6 overflow-hidden border-2 border-amber-500/50 animate-scale-up relative">
            
            {/* Official Police Header Frame */}
            <div className="bg-gradient-to-r from-red-900 via-red-800 to-red-950 text-white p-5 border-b-2 border-amber-400 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 flex items-center justify-center text-red-950 font-black shadow-lg shadow-amber-500/30 border-2 border-amber-200">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300 block">
                      BỘ CÔNG AN — CÔNG AN TỈNH ĐIỆN BIÊN
                    </span>
                    <h3 className="font-extrabold text-lg text-amber-100 tracking-wide uppercase">
                      CÔNG AN XÃ CHIỀNG SINH
                    </h3>
                    <p className="text-xs text-red-200 font-medium">
                      Hệ Thống Phân Công Công Tác & Theo Dõi Tiến Độ
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAuthModalOpen(false)}
                  className="p-1.5 rounded-lg bg-red-950/60 text-amber-200 hover:bg-red-900 hover:text-white border border-amber-500/30 cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Gold Ribbon Divider */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500"></div>
            </div>

            {/* Modal Tabs Navigation */}
            <div className="flex border-b border-slate-800 bg-slate-950/70 p-1">
              <button
                type="button"
                onClick={() => setActiveTab('police')}
                className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-bold rounded-lg flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  activeTab === 'police'
                    ? 'bg-red-900/90 text-amber-300 border border-amber-500/50 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Tài Khoản Đơn Vị (CAND)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('gmail')}
                className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-bold rounded-lg flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  activeTab === 'gmail'
                    ? 'bg-blue-600/90 text-white border border-blue-400/50 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Mail className="w-4 h-4 text-blue-300" />
                <span>Đăng Nhập Gmail</span>
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="p-6">
              {activeTab === 'police' ? (
                /* Police Credentials Form */
                <form onSubmit={handlePoliceLogin} className="space-y-4">
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-start space-x-3 text-xs text-amber-200">
                    <Award className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-300">Cổng Đăng Nhập Cán Bộ Nghiệp Vụ Công An xã Chiềng Sinh</p>
                      <p className="text-slate-300 mt-0.5">
                        Nhập thông tin tài khoản đơn vị để xác thực quyền quản trị và giao nhiệm vụ cho các Tổ công tác.
                      </p>
                    </div>
                  </div>

                  {loginError && (
                    <div className="bg-red-950/80 border border-red-500/80 rounded-xl p-3 flex items-start space-x-2 text-xs text-red-200 animate-fade-in">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  {loginSuccessMsg && (
                    <div className="bg-emerald-950/80 border border-emerald-500/80 rounded-xl p-3 flex items-center space-x-2 text-xs text-emerald-200 animate-fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-bold">{loginSuccessMsg}</span>
                    </div>
                  )}

                  {/* Username Field */}
                  <div>
                    <label className="text-xs font-bold text-amber-200 uppercase tracking-wider block mb-1">
                      Tên tài khoản *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-400/70">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        placeholder="Nhập tên tài khoản..."
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        required
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl font-mono text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="text-xs font-bold text-amber-200 uppercase tracking-wider block mb-1">
                      Mật khẩu *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-400/70">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        required
                        className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl font-mono text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-amber-300 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-amber-700 hover:from-red-600 hover:to-amber-600 text-amber-100 font-extrabold text-sm shadow-lg shadow-red-900/50 border border-amber-400/50 transition-all cursor-pointer active:scale-98 flex items-center justify-center space-x-2 mt-2"
                  >
                    <ShieldCheck className="w-5 h-5 text-amber-300" />
                    <span>ĐĂNG NHẬP XÁC THỰC CÔNG AN XÃ</span>
                  </button>
                </form>
              ) : (
                /* Gmail Authentication Tab */
                <div className="space-y-6">
                  {/* Option 1: 1-Click Google Popup Login */}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Cách 1: Đăng nhập nhanh bằng Google
                    </span>
                    <button
                      onClick={handleGoogleLogin}
                      disabled={isLoggingIn}
                      className="w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-xl border border-slate-700 bg-slate-950 hover:bg-slate-800 text-slate-100 font-semibold shadow-sm transition-all cursor-pointer active:scale-98"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>{isLoggingIn ? 'Đang kết nối Google...' : 'Đăng nhập tài khoản Google'}</span>
                    </button>
                  </div>

                  <div className="relative flex items-center justify-center">
                    <div className="border-t border-slate-800 w-full"></div>
                    <span className="bg-slate-900 px-3 text-xs text-slate-500 font-semibold uppercase tracking-wider absolute">HOẶC</span>
                  </div>

                  {/* Option 2: Gmail Email Link Login */}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2 flex items-center space-x-1">
                      <Mail className="w-3.5 h-3.5 text-blue-400" />
                      <span>Cách 2: Đăng nhập bằng Liên kết Gmail (Email Link)</span>
                    </span>

                    {emailSentSuccess ? (
                      <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 space-y-2 animate-fade-in">
                        <div className="flex items-center space-x-2 font-bold text-sm text-emerald-300">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          <span>Đã gửi liên kết xác thực!</span>
                        </div>
                        <p className="text-xs text-emerald-200 leading-relaxed">
                          Hệ thống đã gửi liên kết đăng nhập trực tiếp tới <strong className="font-mono text-white">{emailInput}</strong>.
                        </p>
                        <p className="text-xs text-emerald-300">
                          Vui lòng mở hộp thư Gmail của bạn và nhấp vào liên kết để truy cập ngay mà không cần mật khẩu.
                        </p>
                        <button
                          type="button"
                          onClick={() => setEmailSentSuccess(false)}
                          className="mt-2 text-xs font-semibold text-emerald-400 hover:underline cursor-pointer"
                        >
                          ← Gửi lại liên kết email khác
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleSendEmailLink} className="space-y-3">
                        <div>
                          <label className="text-xs font-semibold text-slate-300 block mb-1">
                            Địa chỉ Gmail cán bộ
                          </label>
                          <input
                            type="email"
                            placeholder="canbo.chiengsinh@gmail.com"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            required
                            className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 font-medium text-slate-100 placeholder:text-slate-600 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isSendingLink}
                          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow transition-all cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                          <span>{isSendingLink ? 'Đang gửi liên kết...' : 'Gửi liên kết đăng nhập tới Gmail'}</span>
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Note */}
            <div className="p-3 bg-slate-950 border-t border-slate-800/80 text-center text-[11px] text-slate-500 flex items-center justify-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500/70" />
              <span>Hệ thống bảo mật thông tin phân công tác nghiệp CAND — Công an xã Chiềng Sinh</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};


