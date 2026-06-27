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
      {/* BIỂU ĐỒ DOANH THU & CHI PHÍ SỬA CHỮA */}
      <section className="flex flex-col gap-2.5 bg-surface border border-border p-4 rounded-2xl">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] text-slate-500 uppercase tracking-widest font-medium">
            Dòng tiền
          </span>
          <h3 className="text-[15px] font-bold text-slate-100">
            Hiệu số Thu - Chi thực tế
          </h3>
        </div>

        <div className="w-full h-[200px] mt-2">
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
              <Bar name="Tiền phòng chốt" dataKey="income" fill="var(--primary-color)" radius={[4, 4, 0, 0]}>
                {chartData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? "var(--primary-color)" : "rgba(79, 70, 229, 0.4)"} />
                ))}
              </Bar>
              <Bar name="Chi sửa chữa" dataKey="expense" fill="var(--warning)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* THỐNG KÊ NHANH (STATS GRID) */}
      <section className="grid grid-cols-2 gap-3">
        <div className="bg-surface border border-border p-4 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-indigo-950/50 text-indigo-400">
            <Calendar size={18} />
          </div>
          <div>
            <span className="text-[11.5px] text-slate-400 block">Tháng hiện tại</span>
            <span className="text-[15px] font-bold text-slate-100 block">Tháng {selectedMonth}/{selectedYear}</span>
          </div>
        </div>

        <div className="bg-surface border border-border p-4 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-emerald-950/50 text-emerald-400">
            <DollarSign size={18} />
          </div>
          <div>
            <span className="text-[11.5px] text-slate-400 block">Tổng tiền thuê</span>
            <span className="text-[15px] font-bold text-slate-100 block">{formatCurrency(totalRentAmount)}</span>
          </div>
        </div>

        <div className="bg-surface border border-border p-4 rounded-2xl flex items-center gap-3 col-span-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-amber-950/50 text-amber-400">
            <Activity size={18} />
          </div>
          <div>
            <span className="text-[11.5px] text-slate-400 block">Chi phí sửa chữa</span>
            <span className="text-[15px] font-bold text-slate-100 block">{formatCurrency(totalExpensesAmount)}</span>
          </div>
        </div>

        <div className="bg-surface border border-border p-4 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-emerald-950/50 text-emerald-400">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <span className="text-[11.5px] text-slate-400 block">Đã đóng tiền</span>
            <span className="text-[15px] font-bold text-slate-100 block">{paidRoomsCount} phòng</span>
          </div>
        </div>

        <div className="bg-surface border border-border p-4 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-red-950/50 text-red-400">
            <AlertCircle size={18} />
          </div>
          <div>
            <span className="text-[11.5px] text-slate-400 block">Chưa đóng tiền</span>
            <span className="text-[15px] font-bold text-slate-100 block">{unpaidRooms} phòng</span>
          </div>
        </div>
      </section>

      {/* Chi phí phát sinh gần nhất */}
      <section className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-border">
          <h4 className="text-[12px] text-slate-500 uppercase tracking-widest font-medium">
            Chi phí phát sinh gần nhất
          </h4>
        </div>
        {expenses.length === 0 ? (
          <div className="text-center text-slate-400 py-8 px-4 text-[13px]">
            Chưa có chi phí nào phát sinh.
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {expenses.slice(0, 5).map((exp) => (
              <div
                key={exp.id}
                className="flex justify-between items-center px-4 py-3"
              >
                <div>
                  <div className="text-[13.5px] font-medium text-slate-100">
                    {exp.title}
                  </div>
                  <div className="text-[11.5px] text-slate-400 mt-0.5">
                    Phạm vi: {exp.room?.name || "Chung"} • {new Date(exp.date).toLocaleDateString("vi-VN")}
                  </div>
                </div>
                <div className="font-bold text-amber-500 text-[14px] shrink-0 ml-3">
                  -{formatCurrency(exp.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
};
