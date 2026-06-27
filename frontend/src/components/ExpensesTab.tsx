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
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-[17px] font-bold text-slate-100">Chi phí bảo trì / Sửa chữa</h3>
          <p className="text-[12px] text-slate-500 mt-0.5">Ghi nhận các chi phí phát sinh</p>
        </div>
        <button
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-bold flex items-center gap-1.5 active-scale shrink-0"
          onClick={() => setShowExpenseForm(true)}
        >
          <Plus size={14} /> Thêm
        </button>
      </div>

      {showExpenseForm && (
        <form
          onSubmit={onSubmit}
          className="bg-surface border border-border rounded-2xl overflow-hidden shadow-lg"
        >
          <div className="px-4 pt-4 pb-3 border-b border-border">
            <h4 className="font-bold text-[14px] text-slate-100">Thêm Chi Phí Mới</h4>
          </div>
          <div className="flex flex-col gap-3 p-4">
          <div>
            <label className="text-[11.5px] text-slate-400 block mb-1">Tên chi phí / Lý do</label>
            <input
              type="text"
              disabled={loading}
              placeholder="Ví dụ: Thay vòi nước"
              value={expenseTitle}
              onChange={(e) => setExpenseTitle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-[#0b0f19] text-slate-100 text-[13px] focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11.5px] text-slate-400 block mb-1">Số tiền (đ)</label>
              <input
                type="number"
                disabled={loading}
                placeholder="Ví dụ: 150000"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-[#0b0f19] text-slate-100 text-[13px] focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-[11.5px] text-slate-400 block mb-1">Áp dụng cho</label>
              <select
                disabled={loading}
                value={expenseRoomId}
                onChange={(e) => setExpenseRoomId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-[#0b0f19] text-slate-100 text-[13px] focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
              >
                <option value="chung">Chung cả nhà</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[11.5px] text-slate-400 block mb-1">Ghi chú thêm</label>
            <input
              type="text"
              disabled={loading}
              placeholder="Ghi chú chi tiết (nếu có)"
              value={expenseDesc}
              onChange={(e) => setExpenseDesc(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-[#0b0f19] text-slate-100 text-[13px] focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
            />
          </div>
          <div className="flex gap-2.5 pt-2 border-t border-border">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold transition-colors active-scale disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : "Lưu lại"}
            </button>
            <button
              type="button"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl border border-border text-slate-400 hover:bg-slate-800/40 text-[13px] transition-colors active-scale disabled:opacity-50"
              onClick={() => setShowExpenseForm(false)}
            >
              Hủy
            </button>
          </div>
          </div>
        </form>
      )}

      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        {expenses.length === 0 ? (
          <div className="text-center text-slate-400 py-8 px-4 text-[13px]">
            Chưa có chi phí nào được ghi nhận.
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {expenses.map((exp) => (
              <div
                key={exp.id}
                className="flex justify-between items-center px-4 py-3.5"
              >
                <div>
                  <div className="text-[13.5px] font-semibold text-slate-100">{exp.title}</div>
                  <div className="text-[11.5px] text-slate-400 mt-0.5">
                    Sửa cho: <strong className="text-slate-300">{exp.room?.name || "Chung"}</strong>
                  </div>
                  {exp.description && (
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {exp.description}
                    </div>
                  )}
                  <div className="text-[10.5px] text-slate-600 mt-0.5">
                    {new Date(exp.date).toLocaleDateString("vi-VN")}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0 ml-3">
                  <div className="text-[15px] font-bold text-amber-500">-{formatCurrency(exp.amount)}</div>
                  <button
                    disabled={loading}
                    onClick={() => onDelete(exp.id)}
                    className="bg-transparent border-none text-red-400/70 hover:text-red-400 text-[11px] cursor-pointer p-0 disabled:opacity-50 transition-colors"
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
