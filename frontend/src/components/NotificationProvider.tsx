import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

// 1. Định nghĩa kiểu dữ liệu cho Toast & Dialog
export type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ConfirmConfig {
  title: string;
  message: string;
  onConfirm: () => void;
}

interface NotificationContextProps {
  showToast: (message: string, type?: ToastType) => void;
  showConfirm: (message: string, onConfirm: () => void, title?: string) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

// Hook tiện ích để các component con dễ dàng sử dụng
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification phải được sử dụng bên trong NotificationProvider!");
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);

  // Hàm kích hoạt hiển thị Toast
  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Tự động xóa toast sau 3.5 giây
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  // Hàm kích hoạt hiển thị Dialog Xác nhận
  const showConfirm = useCallback((message: string, onConfirm: () => void, title: string = "Xác nhận") => {
    setConfirmConfig({
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmConfig(null);
      },
    });
  }, []);

  const handleCancelConfirm = () => {
    setConfirmConfig(null);
  };

  return (
    <NotificationContext.Provider value={{ showToast, showConfirm }}>
      {children}

      {/* 2. HIỂN THỊ DANH SÁCH TOASTS (Giao diện iOS-style floating Toast) */}
      <div className="pointer-events-none fixed left-1/2 top-4 z-[9999] flex w-full max-w-[380px] -translate-x-1/2 flex-col gap-2.5 px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`animate-slide-in pointer-events-auto flex translate-y-0 items-center justify-between rounded-xl border p-3.5 shadow-lg backdrop-blur-md transition-all duration-300${
              toast.type === "success"
                ? "border-[#10b981]/30 bg-[#10b981]/10 text-[#10b981]"
                : toast.type === "error"
                ? "border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444]"
                : "border-indigo-500/30 bg-indigo-600/10 text-indigo-400"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === "success" && <CheckCircle2 className="size-5 shrink-0" />}
              {toast.type === "error" && <AlertCircle className="size-5 shrink-0" />}
              {toast.type === "info" && <Info className="size-5 shrink-0" />}
              <span className="text-[13px] font-medium leading-relaxed text-slate-100">
                {toast.message}
              </span>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="ml-2.5 flex cursor-pointer items-center justify-center border-0 bg-transparent p-0.5 text-slate-400 hover:text-slate-200"
            >
              <X className="size-[14px]" />
            </button>
          </div>
        ))}
      </div>

      {/* 3. HIỂN THỊ CONFIRM DIALOG CUSTOM (Thay thế confirm()) */}
      {confirmConfig && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="animate-scale-in border-border bg-surface relative w-full max-w-[340px] overflow-hidden rounded-2xl border p-5 shadow-2xl">
            {/* Thanh gradient điểm nhấn ở đầu dialog */}
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-indigo-500 to-purple-500"></div>

            <h3 className="mb-1.5 mt-1 text-[16px] font-bold text-slate-100">
              {confirmConfig.title}
            </h3>
            
            <p className="mb-5 text-[13px] leading-normal text-slate-400">
              {confirmConfig.message}
            </p>

            <div className="flex justify-end gap-2.5">
              <button
                onClick={handleCancelConfirm}
                className="active-scale border-border bg-bg cursor-pointer rounded-lg border px-4 py-2 text-[12.5px] font-medium text-slate-300 transition-colors hover:bg-[#1a2333]"
              >
                Hủy
              </button>
              <button
                onClick={confirmConfig.onConfirm}
                className="active-scale cursor-pointer rounded-lg border-0 bg-indigo-600 px-4 py-2 text-[12.5px] font-semibold text-white shadow-md shadow-indigo-900/30 transition-colors hover:bg-indigo-500"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};
