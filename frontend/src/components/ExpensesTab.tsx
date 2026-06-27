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
}) => {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ fontSize: "1.2rem" }}>Chi phí bảo trì / Sửa chữa</h3>
        <button
          className="btn-primary"
          style={{
            width: "auto",
            padding: "8px 12px",
            borderRadius: "10px",
            fontSize: "0.8rem",
          }}
          onClick={() => setShowExpenseForm(true)}
        >
          <Plus size={16} /> Thêm chi phí
        </button>
      </div>

      {showExpenseForm && (
        <form
          onSubmit={onSubmit}
          style={{
            backgroundColor: "var(--surface-color)",
            padding: "16px",
            borderRadius: "16px",
            border: "1px solid var(--border-color)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginTop: "8px",
          }}
        >
          <h4 style={{ fontWeight: "bold", fontSize: "1rem" }}>Thêm Chi Phí Mới</h4>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Tên chi phí / Lý do</label>
            <input
              type="text"
              placeholder="Ví dụ: Thay vòi nước"
              value={expenseTitle}
              onChange={(e) => setExpenseTitle(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-color)", color: "var(--text-primary)", fontSize: "0.9rem" }}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Số tiền (đ)</label>
              <input
                type="number"
                placeholder="Ví dụ: 150000"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-color)", color: "var(--text-primary)", fontSize: "0.9rem" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Áp dụng cho</label>
              <select
                value={expenseRoomId}
                onChange={(e) => setExpenseRoomId(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-color)", color: "var(--text-primary)", fontSize: "0.9rem" }}
              >
                <option value="chung">Chung cả nhà</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Ghi chú thêm</label>
            <input
              type="text"
              placeholder="Ghi chú chi tiết (nếu có)"
              value={expenseDesc}
              onChange={(e) => setExpenseDesc(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-color)", color: "var(--text-primary)", fontSize: "0.9rem" }}
            />
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <button type="submit" className="btn-primary" style={{ flex: 1, padding: "10px", fontSize: "0.85rem" }}>Lưu lại</button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowExpenseForm(false)}
              style={{ flex: 1, padding: "10px", fontSize: "0.85rem", backgroundColor: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border-color)", borderRadius: "8px" }}
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {expenses.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px", fontSize: "0.85rem" }}>Chưa có chi phí nào được ghi nhận.</div>
        ) : (
          expenses.map((exp) => (
            <div
              key={exp.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px",
                backgroundColor: "var(--surface-color)",
                border: "1px solid var(--border-color)",
                borderRadius: "12px",
              }}
            >
              <div>
                <div style={{ fontSize: "0.95rem", fontWeight: "600" }}>{exp.title}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Sửa cho: <strong style={{ color: "var(--text-primary)" }}>{exp.room?.name || "Chung"}</strong>
                </div>
                {exp.description && <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>Ghi chú: {exp.description}</div>}
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>Ngày: {new Date(exp.date).toLocaleDateString("vi-VN")}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--warning)" }}>-{formatCurrency(exp.amount)}</div>
                <button
                  onClick={() => onDelete(exp.id)}
                  style={{ backgroundColor: "transparent", border: "none", color: "var(--danger)", fontSize: "0.75rem", cursor: "pointer", textDecoration: "underline", padding: 0 }}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};
