import { useState } from "react";
import { Lock, Mail, Eye, EyeOff, LogIn } from "lucide-react";
import { authService, User } from "../services/auth.service";

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Vui lòng điền đầy đủ Email và Mật khẩu!");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Gọi service đăng nhập để gửi thông tin lên backend và lưu token
      const user = await authService.login({ email, password });

      // Callback báo cho App component biết đăng nhập thành công
      onLoginSuccess(user);
    } catch (err) {
      console.error("Lỗi đăng nhập từ giao diện:", err);
      const errorResponse = err as {
        response?: {
          data?: {
            error?: string;
            message?: string;
          };
        };
        message?: string;
      };
      const msg =
        errorResponse.response?.data?.error ||
        errorResponse.response?.data?.message ||
        errorResponse.message ||
        "Tài khoản hoặc mật khẩu không chính xác.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-bg flex min-h-screen flex-col items-center justify-center px-4">
      {/* Container chính của Form */}
      <div className="border-border bg-surface relative w-full max-w-[400px] overflow-hidden rounded-2xl border p-6 shadow-2xl">
        {/* Điểm nhấn thiết kế: Hiệu ứng Gradient sáng nhẹ phía trên card */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

        {/* 1. Tiêu đề thương hiệu */}
        <div className="mb-6 text-center">
          <h2 className="bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-[26px] font-extrabold tracking-tight text-transparent">
            RentalHub
          </h2>
          <p className="mt-1 text-[13px] text-slate-400">
            Hệ thống quản lý phòng trọ & tính điện nước
          </p>
        </div>

        {/* 2. Hiển thị thông báo lỗi */}
        {error && (
          <div className="animate-shake mb-4 rounded-xl border border-red-900/60 bg-red-950/40 p-3 text-center text-[12.5px] text-red-400">
            {error}
          </div>
        )}

        {/* 3. Form Đăng nhập */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Ô nhập Email */}
          <div className="flex flex-col gap-1.5">
            <label className="ml-1 text-[12.5px] font-medium text-slate-300">
              Email đăng nhập
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Mail className="size-[18px]" />
              </span>
              <input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-border bg-bg w-full rounded-xl border py-3 pl-11 pr-4 text-[14px] text-slate-100 transition-colors placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
                autoFocus
                disabled={loading}
              />
            </div>
          </div>

          {/* Ô nhập Mật khẩu */}
          <div className="flex flex-col gap-1.5">
            <label className="ml-1 text-[12.5px] font-medium text-slate-300">
              Mật khẩu
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock className="size-[18px]" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-border bg-bg w-full rounded-xl border px-11 py-3 text-[14px] text-slate-100 transition-colors placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer border-0 bg-transparent p-0 text-slate-400 hover:text-slate-200"
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="size-[18px]" />
                ) : (
                  <Eye className="size-[18px]" />
                )}
              </button>
            </div>
          </div>

          {/* Nút bấm Đăng nhập */}
          <button
            type="submit"
            className="active-scale mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-indigo-600 py-3 text-[14px] font-semibold text-white shadow-md shadow-indigo-900/30 transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-800/50"
            disabled={loading}
          >
            {loading ? (
              <span className="text-[13px] text-indigo-200">
                Đang kiểm tra...
              </span>
            ) : (
              <>
                <LogIn className="size-[18px]" />
                Đăng nhập
              </>
            )}
          </button>
        </form>

        {/* 4. Footer ghi chú hữu ích */}
        <div className="mt-6 border-t border-[#223555]/40 pt-4 text-center">
          <p className="text-[11.5px] text-slate-500">
            Hệ thống quản lý an toàn và bảo mật.
          </p>
        </div>
      </div>
    </div>
  );
}
