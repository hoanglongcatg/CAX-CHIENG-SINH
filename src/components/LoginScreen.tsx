import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User as UserIcon, 
  Key, 
  Eye, 
  EyeOff, 
  LogIn, 
  AlertCircle,
  CheckCircle2,
  Shield,
  Building2
} from 'lucide-react';
import { CustomPoliceUser } from './Navbar';

interface LoginScreenProps {
  onLoginSuccess: (user: CustomPoliceUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const ACCOUNTS_DATABASE: Record<string, { pass: string; user: CustomPoliceUser }> = {
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const u = username.trim();
    const p = password.trim();

    if (!u || !p) {
      setErrorMsg('Vui lòng nhập đầy đủ tên tài khoản và mật khẩu.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const match = ACCOUNTS_DATABASE[u];
      if (match && match.pass === p) {
        localStorage.setItem('chiengsinh_police_user', JSON.stringify(match.user));
        setSuccessMsg(`Đăng nhập thành công (${match.user.displayName})! Đang chuyển hướng...`);
        setTimeout(() => {
          onLoginSuccess(match.user);
        }, 800);
      } else {
        setIsLoading(false);
        setErrorMsg('Tên tài khoản hoặc mật khẩu không đúng! Vui lòng kiểm tra lại.');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between items-center relative overflow-hidden select-none">
      {/* Background Decorative Police Ambient Light */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-red-800/25 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-amber-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-900/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Grid subtle police backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_80%,transparent_100%)] opacity-25 pointer-events-none" />

      {/* Top Banner Header */}
      <header className="w-full pt-10 pb-4 px-4 text-center z-10 flex flex-col items-center">
        {/* Unit Title */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-300 to-amber-100 tracking-wider uppercase drop-shadow-lg">
            CÔNG AN XÃ CHIỀNG SINH
          </h1>
          <p className="text-xs sm:text-sm font-medium text-amber-200/90 flex items-center justify-center space-x-1.5 pt-1">
            <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Hệ Thống Theo Dõi Tiến Độ Công Tác & Đôn Đốc Báo Cáo Nội Bộ</span>
          </p>
        </div>
      </header>

      {/* Center Login Form Container */}
      <main className="w-full max-w-md px-4 py-4 z-10 my-auto">
        <div className="bg-slate-900/90 backdrop-blur-xl border-2 border-amber-500/40 rounded-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.9)] relative overflow-hidden">
          {/* Top Golden Header Bar */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-400 to-emerald-600" />

          {/* Security Tag */}
          <div className="inline-flex items-center space-x-1.5 bg-red-950/90 border border-red-500/50 text-red-200 text-[10px] sm:text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm mb-4 mx-auto w-full justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>BẢO MẬT CAO — DÀNH CHO CÁN BỘ CÔNG AN XÃ</span>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-base sm:text-lg font-black text-amber-100 uppercase tracking-wide">
              Đăng Nhập Tài Khoản Công Tác
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Nhập tên tài khoản và mật khẩu được Ban Chỉ Huy phân công
            </p>
          </div>

          {/* Alert Messages */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-950/90 border border-red-600 rounded-xl flex items-start space-x-2.5 text-red-200 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-950/90 border border-emerald-600 rounded-xl flex items-center space-x-2.5 text-emerald-200 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username field */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center space-x-1.5">
                <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Tên tài khoản đơn vị</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ví dụ: caxchiengsinh.db"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition-all placeholder:text-slate-600 shadow-inner"
                />
                <Shield className="w-4 h-4 text-amber-500/70 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Mật khẩu bảo mật</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition-all placeholder:text-slate-600 shadow-inner"
                />
                <Lock className="w-4 h-4 text-amber-500/70 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 p-1 text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-700 via-red-800 to-amber-700 hover:from-red-600 hover:to-amber-600 text-amber-100 font-bold text-sm shadow-xl shadow-red-950/60 border border-amber-400/50 flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 uppercase tracking-wider"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-amber-200 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-amber-300" />
                  <span>XÁC THỰC & ĐĂNG NHẬP</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center z-10 px-4 text-[11px] text-slate-400 border-t border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <p className="font-semibold text-slate-300">
          🔒 Hệ thống Quản lý Nội bộ — Công an xã Chiềng Sinh
        </p>
        <p className="text-[10px] text-slate-500 mt-0.5">
          Bản quyền thuộc Công an xã Chiềng Sinh. Mọi hành vi truy cập trái phép sẽ bị xử lý theo quy định của Luật An ninh mạng.
        </p>
      </footer>
    </div>
  );
};

