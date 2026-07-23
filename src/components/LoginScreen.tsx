import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User as UserIcon, 
  Key, 
  Eye, 
  EyeOff, 
  Award, 
  LogIn, 
  AlertCircle,
  CheckCircle2,
  Shield,
  Building2,
  Sparkles
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
      if (u === 'caxchiengsinh.db' && p === 'chiengsinh123@') {
        const pUser: CustomPoliceUser = {
          username: 'caxchiengsinh.db',
          displayName: 'Trưởng Công an xã Chiềng Sinh',
          role: 'Ban Chỉ Huy Công An Xã',
          email: 'caxchiengsinh.db@congan.dienbien.gov.vn',
          badgeNumber: 'CAS-1268'
        };
        localStorage.setItem('chiengsinh_police_user', JSON.stringify(pUser));
        setSuccessMsg('Đăng nhập thành công! Đang chuyển hướng...');
        setTimeout(() => {
          onLoginSuccess(pUser);
        }, 800);
      } else if (u === 'nhanviencax.cs' && p === 'nhanvien123@') {
        const pUser: CustomPoliceUser = {
          username: 'nhanviencax.cs',
          displayName: 'Cán bộ Công an xã Chiềng Sinh',
          role: 'Cán Bộ Nghiệp Vụ',
          email: 'nhanviencax.cs@congan.dienbien.gov.vn',
          badgeNumber: 'CAS-2345'
        };
        localStorage.setItem('chiengsinh_police_user', JSON.stringify(pUser));
        setSuccessMsg('Đăng nhập thành công! Đang chuyển hướng...');
        setTimeout(() => {
          onLoginSuccess(pUser);
        }, 800);
      } else {
        setIsLoading(false);
        setErrorMsg('Tên tài khoản hoặc mật khẩu không đúng! Vui lòng kiểm tra lại.');
      }
    }, 400);
  };

  const handleFillAccount = (accountType: 'chief' | 'officer') => {
    setErrorMsg('');
    if (accountType === 'chief') {
      setUsername('caxchiengsinh.db');
      setPassword('chiengsinh123@');
    } else {
      setUsername('nhanviencax.cs');
      setPassword('nhanvien123@');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between items-center relative overflow-hidden font-sans select-none">
      {/* Background Decorative Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-900/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      {/* Top Banner Header */}
      <header className="w-full pt-8 pb-4 px-4 text-center z-10">
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          {/* CAND Emblem Badge */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 via-red-700 to-amber-700 p-0.5 shadow-2xl shadow-red-900/50 mb-4 border border-amber-400/40 relative group">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 via-amber-500/10 to-transparent" />
              <ShieldCheck className="w-12 h-12 text-amber-400 relative z-10 drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)]" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-amber-500 text-slate-950 rounded-full p-1 border-2 border-slate-950 shadow-md">
              <Award className="w-4 h-4 font-bold" />
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-amber-100 tracking-wide uppercase">
            CÔNG AN XÃ CHIỀNG SINH
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-400 mt-1 flex items-center space-x-1.5">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Hệ Thống Theo Dõi Tiến Độ Công Tác & Đôn Đốc Báo Cáo</span>
          </p>
        </div>
      </header>

      {/* Center Login Box */}
      <main className="w-full max-w-md px-4 py-2 z-10 my-auto">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-700 to-amber-600 text-white text-[11px] font-bold px-4 py-0.5 rounded-full uppercase tracking-wider shadow-md border border-amber-400/30 flex items-center space-x-1">
            <Lock className="w-3 h-3 text-amber-300" />
            <span>Xác thực CAND nội bộ</span>
          </div>

          <div className="text-center mt-2 mb-6">
            <h2 className="text-lg font-bold text-slate-100">Đăng Nhập Tài Khoản Đơn Vị</h2>
            <p className="text-xs text-slate-400 mt-1">Vui lòng nhập tài khoản được cấp để truy cập hệ thống</p>
          </div>

          {/* Alert Messages */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-950/80 border border-red-700/80 rounded-xl flex items-start space-x-2.5 text-red-200 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-700/80 rounded-xl flex items-center space-x-2.5 text-emerald-200 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono transition-all placeholder:text-slate-600"
                />
                <Shield className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Mật khẩu</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu được cấp"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono transition-all placeholder:text-slate-600"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 p-1 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick Fill Buttons for Convenience */}
            <div className="pt-1">
              <p className="text-[11px] text-slate-400 mb-2 font-medium flex items-center justify-between">
                <span>Tài khoản kiểm thử nhanh:</span>
                <Sparkles className="w-3 h-3 text-amber-400" />
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleFillAccount('chief')}
                  className="px-2.5 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-left transition-all text-[11px]"
                >
                  <p className="font-bold text-amber-300 flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate">1. Trưởng CAX</span>
                  </p>
                  <p className="text-slate-400 font-mono text-[10px] truncate">caxchiengsinh.db</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleFillAccount('officer')}
                  className="px-2.5 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/50 text-left transition-all text-[11px]"
                >
                  <p className="font-bold text-blue-300 flex items-center space-x-1">
                    <UserIcon className="w-3 h-3 text-blue-400 shrink-0" />
                    <span className="truncate">2. Cán bộ CAX</span>
                  </p>
                  <p className="text-slate-400 font-mono text-[10px] truncate">nhanviencax.cs</p>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-red-700 via-red-800 to-amber-700 hover:from-red-600 hover:to-amber-600 text-amber-100 font-bold text-sm shadow-lg shadow-red-900/40 border border-amber-400/30 flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
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
      <footer className="w-full py-4 text-center z-10 px-4 text-[11px] text-slate-500 border-t border-slate-900 bg-slate-950/60">
        <p className="font-medium text-slate-400">
          🔒 Hệ thống Quản lý Nội bộ - Công an xã Chiềng Sinh, TP. Sơn La / Tỉnh Điện Biên
        </p>
        <p className="text-[10px] text-slate-600 mt-0.5">
          Bản quyền thuộc Công an xã Chiềng Sinh. Mọi hành vi truy cập trái phép sẽ bị xử lý theo quy định pháp luật.
        </p>
      </footer>
    </div>
  );
};
