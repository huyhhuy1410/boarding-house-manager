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
  loading?: boolean;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  rooms,
  expenses,
  chartData,
  selectedMonth,
  selectedYear,
  formatCurrency,
  loading = false,
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

  if (loading && rooms.length === 0) {
    return (
      <>
        {/* SKELETON BIỂU ĐỒ */}
        <section className="flex animate-pulse flex-col gap-2.5 rounded-2xl border border-border bg-surface p-4">
          <div className="h-3 w-16 rounded-md bg-slate-800"></div>
          <div className="mt-1 h-5 w-48 rounded-md bg-slate-800"></div>
          <div className="mt-4 h-[200px] w-full rounded-xl bg-slate-800/40"></div>
        </section>

        {/* SKELETON THỐNG KÊ NHANH (STATS GRID) */}
        <section className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="flex animate-pulse items-center gap-3 rounded-2xl border border-border bg-surface p-4">
              <div className="size-9 shrink-0 rounded-xl bg-slate-800"></div>
              <div className="flex flex-1 flex-col gap-1.5">
                <div className="h-3 w-16 rounded-md bg-slate-800"></div>
                <div className="h-4 w-20 rounded-md bg-slate-800"></div>
              </div>
            </div>
          ))}
        </section>

        {/* SKELETON CHI PHÍ GẦN NHẤT */}
        <section className="animate-pulse overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="border-b border-border px-4 pb-3 pt-4">
            <div className="h-3.5 w-40 rounded-md bg-slate-800"></div>
          </div>
          <div className="flex flex-col divide-y divide-border/50">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="flex items-center justify-between bg-surface/50 px-4 py-3">
                <div className="flex w-1/2 flex-col gap-1.5">
                  <div className="h-4 w-28 rounded-md bg-slate-800"></div>
                  <div className="h-3 w-20 rounded-md bg-slate-800"></div>
                </div>
                <div className="h-4 w-12 rounded-md bg-slate-800"></div>
              </div>
            ))}
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      {/* BIỂU ĐỒ DOANH THU & CHI PHÍ SỬA CHỮA */}
      <section className="flex flex-col gap-2.5 rounded-2xl border border-border bg-surface p-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-medium uppercase tracking-widest text-slate-500">
            Dòng tiền
          </span>
          <h3 className="text-[15px] font-bold text-slate-100">
            Hiệu số Thu - Chi thực tế
          </h3>
        </div>

        <div className="mt-2 h-[200px] w-full">
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
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-950/50 text-indigo-400">
            <Calendar size={18} />
          </div>
          <div>
            <span className="block text-[11.5px] text-slate-400">Tháng hiện tại</span>
            <span className="block text-[15px] font-bold text-slate-100">Tháng {selectedMonth}/{selectedYear}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-950/50 text-emerald-400">
            <DollarSign size={18} />
          </div>
          <div>
            <span className="block text-[11.5px] text-slate-400">Tổng tiền thuê</span>
            <span className="block text-[15px] font-bold text-slate-100">{formatCurrency(totalRentAmount)}</span>
          </div>
        </div>

        <div className="col-span-2 flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-950/50 text-amber-400">
            <Activity size={18} />
          </div>
          <div>
            <span className="block text-[11.5px] text-slate-400">Chi phí sửa chữa</span>
            <span className="block text-[15px] font-bold text-slate-100">{formatCurrency(totalExpensesAmount)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-950/50 text-emerald-400">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <span className="block text-[11.5px] text-slate-400">Đã đóng tiền</span>
            <span className="block text-[15px] font-bold text-slate-100">{paidRoomsCount} phòng</span>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-red-950/50 text-red-400">
            <AlertCircle size={18} />
          </div>
          <div>
            <span className="block text-[11.5px] text-slate-400">Chưa đóng tiền</span>
            <span className="block text-[15px] font-bold text-slate-100">{unpaidRooms} phòng</span>
          </div>
        </div>
      </section>

      {/* Chi phí phát sinh gần nhất */}
      <section className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="border-b border-border px-4 pb-3 pt-4">
          <h4 className="text-[12px] font-medium uppercase tracking-widest text-slate-500">
            Chi phí phát sinh gần nhất
          </h4>
        </div>
        {expenses.length === 0 ? (
          <div className="px-4 py-8 text-center text-[13px] text-slate-400">
            Chưa có chi phí nào phát sinh.
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {expenses.slice(0, 5).map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <div className="text-[13.5px] font-medium text-slate-100">
                    {exp.title}
                  </div>
                  <div className="mt-0.5 text-[11.5px] text-slate-400">
                    Phạm vi: {exp.room?.name || "Chung"} • {new Date(exp.date).toLocaleDateString("vi-VN")}
                  </div>
                </div>
                <div className="ml-3 shrink-0 text-[14px] font-bold text-amber-500">
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
