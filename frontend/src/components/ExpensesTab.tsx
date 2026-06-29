import React from "react";
import { Plus } from "lucide-react";
import { Room } from "../services/room.service";
import { Expense } from "../services/expense.service";

interface ExpensesTabProps {
  rooms: Room[];
  expenses: Expense[];
  showExpenseForm: boolean;
  setShowExpenseForm: (show: boolean) => void;
  expenseTitle: string;
  setExpenseTitle: (val: string) => void;
  expenseAmount: string;
  setExpenseAmount: (val: string) => void;
  expenseRoomId: string;
  setExpenseRoomId: (val: string) => void;
  expenseDesc: string;
  setExpenseDesc: (val: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  formatCurrency: (val: number) => string;
  loading: boolean;
}

export const ExpensesTab: React.FC<ExpensesTabProps> = ({
  rooms,
  expenses,
  showExpenseForm,
  setShowExpenseForm,
  expenseTitle,
  setExpenseTitle,
  expenseAmount,
  setExpenseAmount,
  expenseRoomId,
  setExpenseRoomId,
  expenseDesc,
  setExpenseDesc,
  onSubmit,
  onDelete,
  formatCurrency,
  loading,
}) => {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[17px] font-bold text-slate-100">Chi phí bảo trì / Sửa chữa</h3>
          <p className="mt-0.5 text-[12px] text-slate-500">Ghi nhận các chi phí phát sinh</p>
        </div>
        <button
          className="active-scale flex shrink-0 items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-[12px] font-bold text-white hover:bg-indigo-700"
          onClick={() => setShowExpenseForm(true)}
        >
          <Plus size={14} /> Thêm
        </button>
      </div>

      {showExpenseForm && (
        <form
          onSubmit={onSubmit}
          className="border-border bg-surface overflow-hidden rounded-2xl border shadow-lg"
        >
          <div className="border-border border-b px-4 pb-3 pt-4">
            <h4 className="text-[14px] font-bold text-slate-100">Thêm Chi Phí Mới</h4>
          </div>
          <div className="flex flex-col gap-3 p-4">
          <div>
            <label className="mb-1 block text-[11.5px] text-slate-400">Tên chi phí / Lý do</label>
            <input
              type="text"
              disabled={loading}
              placeholder="Ví dụ: Thay vòi nước"
              value={expenseTitle}
              onChange={(e) => setExpenseTitle(e.target.value)}
              className="border-border bg-bg w-full rounded-lg border px-3 py-2.5 text-[13px] text-slate-100 transition-colors focus:border-indigo-500 focus:outline-none disabled:opacity-50"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11.5px] text-slate-400">Số tiền (đ)</label>
              <input
                type="number"
                disabled={loading}
                placeholder="Ví dụ: 150000"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                className="border-border bg-bg w-full rounded-lg border px-3 py-2.5 text-[13px] text-slate-100 transition-colors focus:border-indigo-500 focus:outline-none disabled:opacity-50"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11.5px] text-slate-400">Áp dụng cho</label>
              <select
                disabled={loading}
                value={expenseRoomId}
                onChange={(e) => setExpenseRoomId(e.target.value)}
                className="border-border bg-bg w-full rounded-lg border px-3 py-2.5 text-[13px] text-slate-100 transition-colors focus:border-indigo-500 focus:outline-none disabled:opacity-50"
              >
                <option value="chung">Chung cả nhà</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[11.5px] text-slate-400">Ghi chú thêm</label>
            <input
              type="text"
              disabled={loading}
              placeholder="Ghi chú chi tiết (nếu có)"
              value={expenseDesc}
              onChange={(e) => setExpenseDesc(e.target.value)}
              className="border-border bg-bg w-full rounded-lg border px-3 py-2.5 text-[13px] text-slate-100 transition-colors focus:border-indigo-500 focus:outline-none disabled:opacity-50"
            />
          </div>
          <div className="border-border flex gap-2.5 border-t pt-2">
            <button
              type="submit"
              disabled={loading}
              className="active-scale flex-1 rounded-xl bg-indigo-600 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : "Lưu lại"}
            </button>
            <button
              type="button"
              disabled={loading}
              className="active-scale border-border flex-1 rounded-xl border py-2.5 text-[13px] text-slate-400 transition-colors hover:bg-slate-800/40 disabled:opacity-50"
              onClick={() => setShowExpenseForm(false)}
            >
              Hủy
            </button>
          </div>
          </div>
        </form>
      )}

      <div className="border-border bg-surface overflow-hidden rounded-2xl border">
        {loading && expenses.length === 0 ? (
          <div className="divide-border flex flex-col divide-y">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="bg-surface/50 flex animate-pulse items-center justify-between px-4 py-3.5">
                <div className="flex w-1/2 flex-col gap-1.5">
                  <div className="h-4 w-32 rounded-md bg-slate-800"></div>
                  <div className="h-3.5 w-20 rounded-md bg-slate-800"></div>
                  <div className="h-3 w-16 rounded-md bg-slate-800"></div>
                </div>
                <div className="flex w-1/4 flex-col items-end gap-2">
                  <div className="h-4 w-20 rounded-md bg-slate-800"></div>
                  <div className="h-3 w-8 rounded-md bg-slate-800"></div>
                </div>
              </div>
            ))}
          </div>
        ) : expenses.length === 0 ? (
          <div className="px-4 py-8 text-center text-[13px] text-slate-400">
            Chưa có chi phí nào được ghi nhận.
          </div>
        ) : (
          <div className="divide-border flex flex-col divide-y">
            {expenses.map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between px-4 py-3.5"
              >
                <div>
                  <div className="text-[13.5px] font-semibold text-slate-100">{exp.title}</div>
                  <div className="mt-0.5 text-[11.5px] text-slate-400">
                    Sửa cho: <strong className="text-slate-300">{exp.room?.name || "Chung"}</strong>
                  </div>
                  {exp.description && (
                    <div className="mt-0.5 text-[11px] text-slate-500">
                      {exp.description}
                    </div>
                  )}
                  <div className="mt-0.5 text-[10.5px] text-slate-600">
                    {new Date(exp.date).toLocaleDateString("vi-VN")}
                  </div>
                </div>
                <div className="ml-3 flex shrink-0 flex-col items-end gap-1.5">
                  <div className="text-[15px] font-bold text-amber-500">-{formatCurrency(exp.amount)}</div>
                  <button
                    disabled={loading}
                    onClick={() => onDelete(exp.id)}
                    className="cursor-pointer border-none bg-transparent p-0 text-[11px] text-red-400/70 transition-colors hover:text-red-400 disabled:opacity-50"
                  >
                    Xoá
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
