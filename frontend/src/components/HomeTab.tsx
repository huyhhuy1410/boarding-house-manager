import React from "react";
import {
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Activity,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Cell,
} from "recharts";
import { Room } from "../services/room.service";
import { Expense, FinancialSummary } from "../services/expense.service";

interface HomeTabProps {
  rooms: Room[];
  expenses: Expense[];
  chartData: FinancialSummary[];
  selectedMonth: number;
  selectedYear: number;
  formatCurrency: (val: number) => string;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  rooms,
  expenses,
  chartData,
  selectedMonth,
  selectedYear,
  formatCurrency,
}) => {
  // Tính toán nhanh số liệu thống kê
  const occupiedRooms = rooms.filter((r) => r.status === "OCCUPIED").length;
  const totalRentAmount = rooms
    .filter((r) => r.status === "OCCUPIED")
    .reduce((sum, r) => sum + r.price, 0);

  // Tính tổng số tiền phòng thực tế cần thu và số phòng chưa đóng tiền
  const paidRoomsCount = rooms.filter((r) => r.status === "OCCUPIED" && r.isPaidThisMonth).length;
  const unpaidRooms = occupiedRooms - paidRoomsCount;

  // Tính tổng chi phí sửa chữa/bảo trì
  const totalExpensesAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  // Định dạng trục đứng cho Recharts: ví dụ 15.000.000đ -> 15Tr
  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(0)}Tr`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k`;
    }
    return value.toString();
  };

  return (
    <>
      {/* KHU VỰC 1: BIỂU ĐỒ DOANH THU & CHI PHÍ SỬA CHỮA */}
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          backgroundColor: "var(--surface-color)",
          border: "1px solid var(--border-color)",
          padding: "16px",
          borderRadius: "20px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Dòng tiền</span>
          <h3 style={{ fontSize: "1.15rem", fontWeight: "bold" }}>Hiệu số Thu - Chi thực tế</h3>
        </div>

        <div style={{ width: "100%", height: 200, marginTop: "10px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 0, left: -25, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "var(--text-secondary)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={formatYAxis} tick={{ fill: "var(--text-secondary)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--surface-color)",
                  borderColor: "var(--border-color)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                  fontSize: "0.8rem",
                }}
                formatter={(value: number) => [formatCurrency(value), ""]}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "var(--text-primary)" }} />
              <Bar name="Tiền phòng chốt" dataKey="revenue" fill="var(--primary-color)" radius={[4, 4, 0, 0]}>
                {chartData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? "var(--primary-color)" : "rgba(59, 130, 246, 0.4)"} />
                ))}
              </Bar>
              <Bar name="Chi sửa chữa" dataKey="expense" fill="var(--warning)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* KHU VỰC 2: THỐNG KÊ NHANH (STATS GRID) */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: "rgba(59, 130, 246, 0.15)", color: "var(--primary-color)" }}>
            <Calendar size={18} />
          </div>
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>Tháng hiện tại</span>
            <span style={{ fontSize: "1.1rem", fontWeight: "bold", display: "block" }}>Tháng {selectedMonth}/{selectedYear}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "var(--success)" }}>
            <DollarSign size={18} />
          </div>
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>Tổng tiền thuê</span>
            <span style={{ fontSize: "1.1rem", fontWeight: "bold", display: "block" }}>{formatCurrency(totalRentAmount)}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: "rgba(245, 158, 11, 0.15)", color: "var(--warning)" }}>
            <Activity size={18} />
          </div>
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>Chi phí sửa chữa</span>
            <span style={{ fontSize: "1.1rem", fontWeight: "bold", display: "block" }}>{formatCurrency(totalExpensesAmount)}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "var(--success)" }}>
            <CheckCircle2 size={18} />
          </div>
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>Đã đóng tiền</span>
            <span style={{ fontSize: "1.1rem", fontWeight: "bold", display: "block" }}>{paidRoomsCount} phòng</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: "rgba(239, 68, 68, 0.15)", color: "var(--danger)" }}>
            <AlertCircle size={18} />
          </div>
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>Chưa đóng tiền</span>
            <span style={{ fontSize: "1.1rem", fontWeight: "bold", display: "block" }}>{unpaidRooms} phòng</span>
          </div>
        </div>
      </section>

      {/* Hoạt động gần đây */}
      <section style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <h4 style={{ fontSize: "0.9rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Chi phí phát sinh gần nhất</h4>
        {expenses.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "16px", backgroundColor: "var(--surface-color)", border: "1px solid var(--border-color)", borderRadius: "12px", fontSize: "0.8rem" }}>Chưa có chi phí nào phát sinh.</div>
        ) : (
          expenses.slice(0, 5).map((exp) => (
            <div
              key={exp.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 16px",
                backgroundColor: "var(--surface-color)",
                border: "1px solid var(--border-color)",
                borderRadius: "12px",
              }}
            >
              <div>
                <div style={{ fontSize: "0.9rem", fontWeight: "500" }}>{exp.title}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Phạm vi: {exp.room?.name || "Chung"} • {new Date(exp.date).toLocaleDateString("vi-VN")}
                </div>
              </div>
              <div style={{ fontWeight: "600", color: "var(--warning)" }}>-{formatCurrency(exp.amount)}</div>
            </div>
          ))
        )}
      </section>
    </>
  );
};
