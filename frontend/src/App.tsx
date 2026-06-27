import { useState, useEffect } from "react";
import {
  Home,
  Layers,
  FileText,
  Wrench,
  Plus,
  Users,
  CheckCircle2,
  AlertCircle,
  Copy,
} from "lucide-react";
import { roomService, Room, BoardingHouse } from "./services/room.service";
import { billService, Bill } from "./services/bill.service";
import { expenseService, Expense, FinancialSummary } from "./services/expense.service";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function App() {
  const [activeTab, setActiveTab] = useState<
    "home" | "rooms" | "billing" | "expenses"
  >("home");
  const [roomFilter, setRoomFilter] = useState<string>("ALL");
  const [boardingHouses, setBoardingHouses] = useState<BoardingHouse[]>([]);

  // Dữ liệu chuẩn cấu trúc DB
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Dữ liệu chi phí phát sinh (Expenses) và biểu đồ tổng kết (chartData) từ API
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [chartData, setChartData] = useState<FinancialSummary[]>([]);

  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedMonth] = useState<number>(6);
  const [selectedYear] = useState<number>(2026);

  // Lưu trữ dữ liệu đang nhập ghi điện nước cho từng phòng
  const [billingInputs, setBillingInputs] = useState<
    Record<
      string,
      {
        newElectricity: string;
        newWater: string;
        extraAmount: string;
        extraDescription: string;
      }
    >
  >({});

  // Trạng thái nhập liệu cho Form Thêm Chi Phí Mới
  const [showExpenseForm, setShowExpenseForm] = useState<boolean>(false);
  const [expenseTitle, setExpenseTitle] = useState<string>("");
  const [expenseAmount, setExpenseAmount] = useState<string>("");
  const [expenseRoomId, setExpenseRoomId] = useState<string>("chung");
  const [expenseDesc, setExpenseDesc] = useState<string>("");

  const fetchRoomsAndBills = async () => {
    try {
      setLoading(true);
      const roomsData = await roomService.getAll();

      const billsData = await billService.getByPeriod(
        selectedMonth,
        selectedYear,
      );
      setBills(billsData);

      // Trích xuất danh sách các dãy trọ duy nhất từ danh sách phòng
      const uniqueHousesMap: Record<string, BoardingHouse> = {};
      roomsData.forEach((r) => {
        if (r.boardingHouse) {
          uniqueHousesMap[r.boardingHouse.id] = r.boardingHouse;
        }
      });
      setBoardingHouses(Object.values(uniqueHousesMap));

      // Map thuộc tính isPaidThisMonth cho các phòng dựa vào hóa đơn đã được lập
      const mappedRooms = roomsData.map((room) => {
        const bill = billsData.find((b) => b.roomId === room.id);
        return {
          ...room,
          isPaidThisMonth: bill ? bill.isPaid : false,
        };
      });
      setRooms(mappedRooms);

      const expensesData = await expenseService.getAll();
      setExpenses(expensesData);

      const summaryData = await expenseService.getSummary();
      setChartData(summaryData);

      setError(null);
    } catch (err: any) {
      setError("Không thể kết nối đến máy chủ API. Vui lòng kiểm tra lại!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomsAndBills();
  }, [selectedMonth, selectedYear]);

  // Xử lý lưu & tạo hóa đơn mới
  const handleCreateBill = async (
    roomId: string,
    oldElectricity: number,
    oldWater: number,
  ) => {
    try {
      const inputs = billingInputs[roomId] || {
        newElectricity: "",
        newWater: "",
        extraAmount: "0",
        extraDescription: "",
      };

      const newElectricity = Number(inputs.newElectricity);
      const newWater = Number(inputs.newWater);
      const extraAmount = Number(inputs.extraAmount || 0);
      const extraDescription = inputs.extraDescription;

      if (isNaN(newElectricity) || inputs.newElectricity === "") {
        alert("Vui lòng nhập số điện mới hợp lệ!");
        return;
      }
      if (isNaN(newWater) || inputs.newWater === "") {
        alert("Vui lòng nhập số nước mới hợp lệ!");
        return;
      }

      setLoading(true);

      // In các biến ra console tạm thời để không bị báo lỗi "unused local variables" trước khi bạn code
      console.log("Đang tạo hóa đơn cho phòng:", roomId, {
        oldElectricity,
        newElectricity,
        oldWater,
        newWater,
        extraAmount,
        extraDescription,
      });

      // TODO: Gọi hàm billService.create(...) với đầy đủ tham số để tạo hóa đơn mới ở DB.
      // Sau khi gọi thành công, hãy hiện thông báo thành công và gọi `await fetchRoomsAndBills()` để load lại danh sách.
      await billService.create({
        roomId,
        month: selectedMonth,
        year: selectedYear,
        oldElectricity,
        newElectricity,
        oldWater,
        newWater,
        extraAmount,
        extraDescription,
      });
      await fetchRoomsAndBills();
    } catch (err: any) {
      const msg =
        err.response?.data?.message || err.message || "Không thể tạo hóa đơn!";
      alert("Lỗi: " + msg);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đánh dấu hóa đơn đã thanh toán
  const handlePayBill = async (billId: string) => {
    try {
      setLoading(true);

      // In biến ra console tạm thời để tránh lỗi linter trước khi bạn viết code
      console.log("Xác nhận thanh toán hóa đơn ID:", billId);

      // TODO: Gọi hàm billService.pay(billId) để thanh toán hóa đơn.
      // Sau khi gọi thành công, hãy hiện thông báo và gọi `await fetchRoomsAndBills()` để load lại danh sách.
      await billService.pay(billId);
      await fetchRoomsAndBills();
    } catch (err: any) {
      const msg =
        err.response?.data?.message || err.message || "Không thể thanh toán!";
      alert("Lỗi: " + msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!expenseTitle.trim() || !expenseAmount.trim()) {
        alert("Vui lòng nhập đầy đủ tên chi phí và số tiền!");
        return;
      }
      setLoading(true);
      await expenseService.create({
        title: expenseTitle,
        amount: Number(expenseAmount),
        description: expenseDesc || null,
        roomId: expenseRoomId === "chung" ? null : expenseRoomId,
      });
      setExpenseTitle("");
      setExpenseAmount("");
      setExpenseDesc("");
      setExpenseRoomId("chung");
      setShowExpenseForm(false);
      await fetchRoomsAndBills(); // Load lại data bao gồm cả doanh thu & biểu đồ mới
    } catch (err: any) {
      alert("Lỗi: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa chi phí này?")) return;
    try {
      setLoading(true);
      await expenseService.delete(id);
      await fetchRoomsAndBills();
    } catch (err: any) {
      alert("Lỗi khi xóa: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Sao chép tin nhắn mẫu biên lai gửi qua Zalo/iMessage
  const handleCopyZalo = (
    bill: Bill,
    roomName: string,
    renterName: string | null,
  ) => {
    const formattedRent = formatCurrency(bill.rentAmount);
    const formattedElectricity = formatCurrency(bill.electricityAmount);
    const formattedWater = formatCurrency(bill.waterAmount);
    const formattedInternet = formatCurrency(bill.internetAmount);
    const formattedTrash = formatCurrency(bill.trashAmount);
    const formattedExtra = formatCurrency(bill.extraAmount);
    const formattedTotal = formatCurrency(bill.totalAmount);

    const useElec = bill.newElectricity - bill.oldElectricity;
    const useWater = bill.newWater - bill.oldWater;
    const isElectricityIncluded = bill.room?.isElectricityIncluded || false;

    let message = `🏡 BIÊN LAI TIỀN NHÀ THÁNG ${bill.month}/${bill.year}\n`;
    message += `📍 Phòng: ${roomName} (${renterName || "Khách thuê"})\n`;
    message += `-----------------------------------------\n`;
    message += `💵 1. Tiền phòng: ${formattedRent}\n`;
    if (isElectricityIncluded) {
      message += `⚡ 2. Tiền điện (${bill.oldElectricity} -> ${bill.newElectricity}): ${useElec} kWh (Bao điện) = 0đ\n`;
    } else {
      message += `⚡ 2. Tiền điện (${bill.oldElectricity} -> ${bill.newElectricity}): ${useElec} kWh x 3.5k = ${formattedElectricity}\n`;
    }
    message += `💧 3. Tiền nước (${bill.oldWater} -> ${bill.newWater}): ${useWater} m3 x 15k = ${formattedWater}\n`;
    message += `🌐 4. Internet: ${formattedInternet}\n`;
    message += `🧹 5. Rác thải: ${formattedTrash}\n`;
    if (bill.extraAmount > 0) {
      message += `🛠️ 6. Chi phí khác (${bill.extraDescription || "Sửa chữa"}): ${formattedExtra}\n`;
    }
    message += `-----------------------------------------\n`;
    message += `💰 TỔNG CỘNG: ${formattedTotal}\n\n`;
    message += `👉 Vui lòng chuyển khoản thanh toán sớm. Xin cảm ơn!`;

    navigator.clipboard
      .writeText(message)
      .then(() => alert("Đã sao chép biên lai Zalo vào Clipboard!"))
      .catch(() => alert("Không thể sao chép tự động, vui lòng chọn tay."));
  };
  // Bộ lọc phòng
  const filteredRooms = rooms.filter((room) => {
    if (roomFilter === "ALL") return true;
    return room.boardingHouseId === roomFilter;
  });

  // Tính toán thống kê nhanh cho Dashboard
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((r) => r.status === "OCCUPIED").length;
  const unpaidRooms = rooms.filter(
    (r) => r.status === "OCCUPIED" && !r.isPaidThisMonth,
  ).length;
  const totalExpectedRevenue = rooms
    .filter((r) => r.status === "OCCUPIED")
    .reduce((sum, r) => sum + r.price, 0);
  const totalCollectedRevenue = rooms
    .filter((r) => r.status === "OCCUPIED" && r.isPaidThisMonth)
    .reduce((sum, r) => sum + r.price, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Định dạng số tiền tệ VNĐ
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Định dạng rút gọn cho cột Y của biểu đồ Recharts (Ví dụ: 15.000.000 -> 15Tr)
  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(0)}Tr`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value.toString();
  };
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "var(--text-secondary)",
        }}
      >
        Đang tải dữ liệu...
      </div>
    );
  }
  if (error) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          padding: "20px",
          textAlign: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            color: "var(--danger)",
            fontSize: "1.2rem",
            fontWeight: "bold",
          }}
        >
          {error}
        </div>
        <button
          className="btn-primary"
          style={{ width: "auto" }}
          onClick={() => window.location.reload()}
        >
          Thử tải lại trang
        </button>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* 1. HEADER CHUNG */}
      <header className="app-header">
        <div className="brand">
          <div className="brand-logo">
            <Layers size={20} />
          </div>
          <h1 className="brand-name">Quản Lý Trọ Việt</h1>
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
          Tháng 06/2026
        </div>
      </header>

      {/* 2. NỘI DUNG TỪNG PHÂN HỆ */}

      {/* PHÂN HỆ 1: TỔNG QUAN (HOME) */}
      {activeTab === "home" && (
        <>
          <section className="dashboard-card">
            <h3 className="dashboard-title">Lợi nhuận ròng dự kiến</h3>
            <div className="dashboard-value">
              {formatCurrency(totalExpectedRevenue - totalExpenses)}
            </div>

            <div className="dashboard-stats">
              <div className="stat-item">
                <span className="stat-label">Tổng thu dự kiến</span>
                <span className="stat-value">
                  {formatCurrency(totalExpectedRevenue)}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Đã thu thực tế</span>
                <span className="stat-value success">
                  {formatCurrency(totalCollectedRevenue)}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Chưa đóng nốt</span>
                <span className="stat-value danger">
                  {formatCurrency(totalExpectedRevenue - totalCollectedRevenue)}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Chi phí sửa chữa</span>
                <span className="stat-value warning">
                  {formatCurrency(totalExpenses)}
                </span>
              </div>
            </div>
          </section>

          <section style={{ backgroundColor: "var(--surface-color)", padding: "16px", borderRadius: "16px", border: "1px solid var(--border-color)", height: "280px", marginBottom: "16px" }}>
            <h4 style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Thống kê 6 tháng gần nhất</h4>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={10} />
                <YAxis stroke="var(--text-muted)" fontSize={10} tickFormatter={formatYAxis} width={40} />
                <Tooltip contentStyle={{ backgroundColor: "var(--surface-color)", borderColor: "var(--border-color)", color: "var(--text-primary)" }} />
                <Legend wrapperStyle={{ fontSize: "0.8rem" }} />
                <Bar dataKey="income" name="Thu nhập" fill="var(--primary-color)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Chi phí" fill="var(--warning)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Lợi nhuận" fill="var(--success)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>

          {/* Quick Info Grid */}
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <div
              style={{
                backgroundColor: "var(--surface-color)",
                padding: "16px",
                borderRadius: "16px",
                border: "1px solid var(--border-color)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  backgroundColor: "var(--success-glow)",
                  color: "var(--success)",
                  padding: "10px",
                  borderRadius: "10px",
                }}
              >
                <Users size={20} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Tỉ lệ lấp đầy
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                  {occupiedRooms}/{totalRooms} phòng
                </div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "var(--surface-color)",
                padding: "16px",
                borderRadius: "16px",
                border: "1px solid var(--border-color)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  backgroundColor: "var(--danger-glow)",
                  color: "var(--danger)",
                  padding: "10px",
                  borderRadius: "10px",
                }}
              >
                <AlertCircle size={20} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Chưa đóng tiền
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                  {unpaidRooms} phòng
                </div>
              </div>
            </div>
          </section>

          {/* Hoạt động gần đây */}
          <section
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <h4
              style={{
                fontSize: "0.9rem",
                color: "var(--text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Chi phí phát sinh gần nhất
            </h4>
            {expenses.map((exp) => (
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
                  <div style={{ fontSize: "0.9rem", fontWeight: "500" }}>
                    {exp.title}
                  </div>
                  <div
                    style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
                  >
                    Phạm vi: {exp.room?.name || "Chung"} • {exp.date}
                  </div>
                </div>
                <div style={{ fontWeight: "600", color: "var(--warning)" }}>
                  -{formatCurrency(exp.amount)}
                </div>
              </div>
            ))}
          </section>
        </>
      )}

      {/* PHÂN HỆ 2: PHÒNG TRỌ (ROOMS) */}
      {activeTab === "rooms" && (
        <>
          {/* Tab filters */}
          <div className="tabs-container">
            <button
              className={`tab-btn ${roomFilter === "ALL" ? "active" : ""}`}
              onClick={() => setRoomFilter("ALL")}
            >
              Tất cả
            </button>
            {boardingHouses.map((house) => (
              <button
                key={house.id}
                className={`tab-btn ${roomFilter === house.id ? "active" : ""}`}
                onClick={() => setRoomFilter(house.id)}
              >
                {house.name}
              </button>
            ))}
          </div>

          <div className="room-grid">
            {filteredRooms.map((room) => {
              const isNewRenter = room.status === "OCCUPIED" && (() => {
                if (!room.rentStartDate) return false;
                const d = new Date(room.rentStartDate);
                return d.getUTCMonth() + 1 === selectedMonth && d.getUTCFullYear() === selectedYear;
              })();

              return (
                <div key={room.id} className="room-card">
                  <div className="room-header">
                    <span className="room-name">{room.name}</span>
                    <span className={`room-badge ${room.status.toLowerCase()}`}>
                      {room.status === "OCCUPIED"
                        ? "Đang thuê"
                        : room.status === "VACANT"
                          ? "Phòng trống"
                          : "Bảo trì"}
                    </span>
                  </div>

                  <div className="room-renter">
                    {room.status === "OCCUPIED" ? (
                      <>
                        <div
                          style={{
                            fontWeight: "500",
                            color: "var(--text-primary)",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          {room.renterName}
                          {isNewRenter && (
                            <span
                              style={{
                                fontSize: "0.65rem",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                backgroundColor: "var(--primary-glow)",
                                color: "var(--primary-color)",
                                fontWeight: "bold",
                                border: "1px solid var(--primary-color)",
                              }}
                            >
                              Khách Mới
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                            marginTop: "4px",
                          }}
                        >
                          Giá: {formatCurrency(room.price)}/tháng
                        </div>
                        <div
                          style={{
                            fontSize: "0.72rem",
                            color: "var(--text-secondary)",
                            marginTop: "4px",
                          }}
                        >
                          Cọc gối đầu: {formatCurrency((room.renterDeposit || 0) + room.electricityDeposit)}
                          {room.electricityDeposit > 0 && (
                            <span style={{ display: "block", fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "2px" }}>
                              (Phòng: {formatCurrency(room.renterDeposit || 0)} + Điện: {formatCurrency(room.electricityDeposit)})
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <span
                        style={{
                          color: "var(--text-muted)",
                          fontStyle: "italic",
                        }}
                      >
                        Chưa có khách thuê
                      </span>
                    )}
                  </div>

                  <div className="room-footer">
                    <span>Trạng thái tháng:</span>
                    {room.status === "OCCUPIED" ? (
                      room.isPaidThisMonth ? (
                        <span
                          style={{
                            color: "var(--success)",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontWeight: "500",
                          }}
                        >
                          <CheckCircle2 size={12} /> Đã đóng
                        </span>
                      ) : (
                        <span
                          style={{
                            color: "var(--danger)",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontWeight: "500",
                          }}
                        >
                          <AlertCircle size={12} /> Chưa đóng
                        </span>
                      )
                    ) : (
                      <span>--</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* PHÂN HỆ 3: GHI SỐ ĐIỆN & HÓA ĐƠN (BILLING) */}
      {activeTab === "billing" && (
        <section
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            padding: "8px 0",
          }}
        >
          <h3 style={{ fontSize: "1.2rem" }}>Chỉ số điện nước tháng này</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Nhập nhanh chỉ số điện nước cuối tháng để tạo hóa đơn gửi khách.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginTop: "10px",
            }}
          >
            {rooms
              .filter((r) => r.status === "OCCUPIED")
              .map((room) => {
                const bill = bills.find((b) => b.roomId === room.id);

                const isNewRenter = (() => {
                  if (!room.rentStartDate) return false;
                  const d = new Date(room.rentStartDate);
                  return d.getUTCMonth() + 1 === selectedMonth && d.getUTCFullYear() === selectedYear;
                })();

                // Xác định chỉ số điện cũ & nước cũ
                let oldElectricity = room.rentStartElectricity;
                let oldWater = room.rentStartWater;

                if (!isNewRenter && room.bills && room.bills.length > 0) {
                  const latestBill = room.bills[0];
                  if (latestBill.month !== selectedMonth || latestBill.year !== selectedYear) {
                    oldElectricity = latestBill.newElectricity;
                    oldWater = latestBill.newWater;
                  }
                }

                // Fallback cho dữ liệu cũ (seeding) nếu chưa từng lập hóa đơn
                if (!isNewRenter && oldElectricity === 0) {
                  oldElectricity = 1240;
                }
                if (!isNewRenter && oldWater === 0) {
                  oldWater = 180;
                }

                return (
                  <div
                    key={room.id}
                    style={{
                      backgroundColor: "var(--surface-color)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "16px",
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontWeight: "bold",
                        borderBottom: "1px solid var(--border-color)",
                        paddingBottom: "8px",
                      }}
                    >
                      <span style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "6px" }}>
                        {room.name}
                        {isNewRenter && (
                          <span
                            style={{
                              fontSize: "0.65rem",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              backgroundColor: "var(--primary-glow)",
                              color: "var(--primary-color)",
                              fontWeight: "bold",
                              border: "1px solid var(--primary-color)",
                            }}
                          >
                            Khách Mới
                          </span>
                        )}
                        {room.isElectricityIncluded && (
                          <span
                            style={{
                              fontSize: "0.65rem",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              backgroundColor: "var(--success-glow)",
                              color: "var(--success)",
                              fontWeight: "bold",
                              border: "1px solid var(--success)",
                            }}
                          >
                            Bao Điện
                          </span>
                        )}
                      </span>
                      <span
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Khách: {room.renterName}
                      </span>
                    </div>

                    {bill ? (
                      /* Đã lập hóa đơn: Hiển thị chi tiết và nút copy gửi Zalo */
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                          fontSize: "0.85rem",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontWeight: "600",
                            marginBottom: "4px",
                          }}
                        >
                          <span>Trạng thái thanh toán:</span>
                          {bill.isPaid ? (
                            <span
                              style={{
                                color: "var(--success)",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <CheckCircle2 size={14} /> Đã đóng
                            </span>
                          ) : (
                            <span
                              style={{
                                color: "var(--danger)",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <AlertCircle size={14} /> Chưa đóng
                            </span>
                          )}
                        </div>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "6px",
                            color: "var(--text-secondary)",
                          }}
                        >
                          <div>Tiền phòng:</div>
                          <div
                            style={{
                              textAlign: "right",
                              color: "var(--text-primary)",
                            }}
                          >
                            {formatCurrency(bill.rentAmount)}
                          </div>

                          <div>
                            Điện ({bill.oldElectricity} → {bill.newElectricity}
                            ):
                          </div>
                          <div
                            style={{
                              textAlign: "right",
                              color: "var(--text-primary)",
                            }}
                          >
                            {bill.newElectricity - bill.oldElectricity} kWh
                            {room.isElectricityIncluded ? " (Bao điện) = 0đ" : ` = ${formatCurrency(bill.electricityAmount)}`}
                          </div>

                          <div>
                            Nước ({bill.oldWater} → {bill.newWater}):
                          </div>
                          <div
                            style={{
                              textAlign: "right",
                              color: "var(--text-primary)",
                            }}
                          >
                            {bill.newWater - bill.oldWater} m³ ={" "}
                            {formatCurrency(bill.waterAmount)}
                          </div>

                          <div>Dịch vụ (Mạng + Rác):</div>
                          <div
                            style={{
                              textAlign: "right",
                              color: "var(--text-primary)",
                            }}
                          >
                            {formatCurrency(
                              Number(bill.internetAmount) +
                                Number(bill.trashAmount),
                            )}
                          </div>

                          {Number(bill.extraAmount) > 0 && (
                            <>
                              <div>
                                Phát sinh ({bill.extraDescription || "Sửa chữa"}
                                ):
                              </div>
                              <div
                                style={{
                                  textAlign: "right",
                                  color: "var(--warning)",
                                }}
                              >
                                +{formatCurrency(bill.extraAmount)}
                              </div>
                            </>
                          )}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontWeight: "bold",
                            borderTop: "1px dashed var(--border-color)",
                            paddingTop: "8px",
                            marginTop: "4px",
                            fontSize: "1rem",
                            color: "var(--primary-color)",
                          }}
                        >
                          <span>TỔNG TIỀN:</span>
                          <span>{formatCurrency(bill.totalAmount)}</span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            marginTop: "8px",
                          }}
                        >
                          <button
                            className="btn-primary"
                            style={{
                              flex: 1,
                              padding: "8px 12px",
                              fontSize: "0.8rem",
                              borderRadius: "8px",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              gap: "6px",
                              backgroundColor: "#25D366", // Zalo Green style
                              border: "none",
                              color: "white",
                            }}
                            onClick={() =>
                              handleCopyZalo(bill, room.name, room.renterName)
                            }
                          >
                            <Copy size={14} /> Sao chép Zalo
                          </button>

                          {!bill.isPaid && (
                            <button
                              className="btn-primary"
                              style={{
                                flex: 1,
                                padding: "8px 12px",
                                fontSize: "0.8rem",
                                borderRadius: "8px",
                              }}
                              onClick={() => handlePayBill(bill.id)}
                            >
                              Xác nhận đóng
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Chưa lập hóa đơn: Hiện form nhập liệu chỉ số mới */
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "10px",
                          }}
                        >
                          <div>
                            <label
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--text-secondary)",
                                display: "block",
                                marginBottom: "4px",
                              }}
                            >
                              Số Điện cũ
                            </label>
                            <input
                              type="number"
                              value={oldElectricity}
                              disabled
                              style={{
                                width: "100%",
                                padding: "10px",
                                borderRadius: "8px",
                                border: "1px solid var(--border-color)",
                                backgroundColor: "var(--bg-color)",
                                color: "var(--text-muted)",
                                fontSize: "0.9rem",
                              }}
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--text-secondary)",
                                display: "block",
                                marginBottom: "4px",
                              }}
                            >
                              Số Điện mới
                            </label>
                            <input
                              type="number"
                              placeholder="Nhập số điện..."
                              inputMode="numeric"
                              value={
                                billingInputs[room.id]?.newElectricity || ""
                              }
                              onChange={(e) =>
                                setBillingInputs((prev) => ({
                                  ...prev,
                                  [room.id]: {
                                    ...(prev[room.id] || {
                                      newElectricity: "",
                                      newWater: "",
                                      extraAmount: "0",
                                      extraDescription: "",
                                    }),
                                    newElectricity: e.target.value,
                                  },
                                }))
                              }
                              style={{
                                width: "100%",
                                padding: "10px",
                                borderRadius: "8px",
                                border: "1px solid var(--primary-color)",
                                backgroundColor: "var(--bg-color)",
                                color: "var(--text-primary)",
                                fontSize: "0.9rem",
                              }}
                            />
                          </div>
                        </div>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "10px",
                          }}
                        >
                          <div>
                            <label
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--text-secondary)",
                                display: "block",
                                marginBottom: "4px",
                              }}
                            >
                              Số Nước cũ
                            </label>
                            <input
                              type="number"
                              value={oldWater}
                              disabled
                              style={{
                                width: "100%",
                                padding: "10px",
                                borderRadius: "8px",
                                border: "1px solid var(--border-color)",
                                backgroundColor: "var(--bg-color)",
                                color: "var(--text-muted)",
                                fontSize: "0.9rem",
                              }}
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--text-secondary)",
                                display: "block",
                                marginBottom: "4px",
                              }}
                            >
                              Số Nước mới
                            </label>
                            <input
                              type="number"
                              placeholder="Nhập số nước..."
                              inputMode="numeric"
                              value={billingInputs[room.id]?.newWater || ""}
                              onChange={(e) =>
                                setBillingInputs((prev) => ({
                                  ...prev,
                                  [room.id]: {
                                    ...(prev[room.id] || {
                                      newElectricity: "",
                                      newWater: "",
                                      extraAmount: "0",
                                      extraDescription: "",
                                    }),
                                    newWater: e.target.value,
                                  },
                                }))
                              }
                              style={{
                                width: "100%",
                                padding: "10px",
                                borderRadius: "8px",
                                border: "1px solid var(--primary-color)",
                                backgroundColor: "var(--bg-color)",
                                color: "var(--text-primary)",
                                fontSize: "0.9rem",
                              }}
                            />
                          </div>
                        </div>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "10px",
                          }}
                        >
                          <div>
                            <label
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--text-secondary)",
                                display: "block",
                                marginBottom: "4px",
                              }}
                            >
                              Phát sinh thêm (đ)
                            </label>
                            <input
                              type="number"
                              placeholder="Ví dụ: 50000"
                              value={billingInputs[room.id]?.extraAmount || ""}
                              onChange={(e) =>
                                setBillingInputs((prev) => ({
                                  ...prev,
                                  [room.id]: {
                                    ...(prev[room.id] || {
                                      newElectricity: "",
                                      newWater: "",
                                      extraAmount: "0",
                                      extraDescription: "",
                                    }),
                                    extraAmount: e.target.value,
                                  },
                                }))
                              }
                              style={{
                                width: "100%",
                                padding: "10px",
                                borderRadius: "8px",
                                border: "1px solid var(--border-color)",
                                backgroundColor: "var(--bg-color)",
                                color: "var(--text-primary)",
                                fontSize: "0.9rem",
                              }}
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--text-secondary)",
                                display: "block",
                                marginBottom: "4px",
                              }}
                            >
                              Lý do phát sinh
                            </label>
                            <input
                              type="text"
                              placeholder="Ví dụ: Sửa vòi nước"
                              value={
                                billingInputs[room.id]?.extraDescription || ""
                              }
                              onChange={(e) =>
                                setBillingInputs((prev) => ({
                                  ...prev,
                                  [room.id]: {
                                    ...(prev[room.id] || {
                                      newElectricity: "",
                                      newWater: "",
                                      extraAmount: "0",
                                      extraDescription: "",
                                    }),
                                    extraDescription: e.target.value,
                                  },
                                }))
                              }
                              style={{
                                width: "100%",
                                padding: "10px",
                                borderRadius: "8px",
                                border: "1px solid var(--border-color)",
                                backgroundColor: "var(--bg-color)",
                                color: "var(--text-primary)",
                                fontSize: "0.9rem",
                              }}
                            />
                          </div>
                        </div>

                        <button
                          className="btn-primary"
                          style={{
                            padding: "10px 12px",
                            fontSize: "0.9rem",
                            borderRadius: "8px",
                            marginTop: "8px",
                          }}
                          onClick={() =>
                            handleCreateBill(
                              room.id,
                              oldElectricity,
                              oldWater,
                            )
                          }
                        >
                          Lưu & Tính tiền phòng
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* PHÂN HỆ 4: CHI PHÍ PHÁT SINH (EXPENSES) */}
      {activeTab === "expenses" && (
        <section
          style={{ display: "flex", flexDirection: "column", gap: "14px" }}
        >
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
            <form onSubmit={handleCreateExpense} style={{
              backgroundColor: "var(--surface-color)",
              padding: "16px",
              borderRadius: "16px",
              border: "1px solid var(--border-color)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginTop: "8px"
            }}>
              <h4 style={{ fontWeight: "bold", fontSize: "1rem" }}>Thêm Chi Phí Mới</h4>
              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Tên chi phí / Lý do</label>
                <input type="text" placeholder="Ví dụ: Thay vòi nước" value={expenseTitle} onChange={(e) => setExpenseTitle(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-color)", color: "var(--text-primary)", fontSize: "0.9rem" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Số tiền (đ)</label>
                  <input type="number" placeholder="Ví dụ: 150000" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-color)", color: "var(--text-primary)", fontSize: "0.9rem" }} />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Áp dụng cho</label>
                  <select value={expenseRoomId} onChange={(e) => setExpenseRoomId(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-color)", color: "var(--text-primary)", fontSize: "0.9rem" }}>
                    <option value="chung">Chung cả nhà</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Ghi chú thêm</label>
                <input type="text" placeholder="Ghi chú chi tiết (nếu có)" value={expenseDesc} onChange={(e) => setExpenseDesc(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-color)", color: "var(--text-primary)", fontSize: "0.9rem" }} />
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: "10px", fontSize: "0.85rem" }}>Lưu lại</button>
                <button type="button" className="btn-secondary" onClick={() => setShowExpenseForm(false)} style={{ flex: 1, padding: "10px", fontSize: "0.85rem", backgroundColor: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border-color)", borderRadius: "8px" }}>Hủy</button>
              </div>
            </form>
          )}

          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {expenses.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px", fontSize: "0.85rem" }}>Chưa có chi phí nào được ghi nhận.</div>
            ) : (
              expenses.map((exp) => (
                <div key={exp.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", backgroundColor: "var(--surface-color)", border: "1px solid var(--border-color)", borderRadius: "12px" }}>
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
                    <button onClick={() => handleDeleteExpense(exp.id)} style={{ backgroundColor: "transparent", border: "none", color: "var(--danger)", fontSize: "0.75rem", cursor: "pointer", textDecoration: "underline", padding: 0 }}>Xóa</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* 3. BOTTOM TAB BAR (iOS STYLE) */}
      <nav className="bottom-nav">
        <button
          className={`nav-item ${activeTab === "home" ? "active" : ""}`}
          onClick={() => setActiveTab("home")}
        >
          <Home className="nav-icon" />
          Tổng quan
        </button>
        <button
          className={`nav-item ${activeTab === "rooms" ? "active" : ""}`}
          onClick={() => setActiveTab("rooms")}
        >
          <Layers className="nav-icon" />
          Phòng trọ
        </button>
        <button
          className={`nav-item ${activeTab === "billing" ? "active" : ""}`}
          onClick={() => setActiveTab("billing")}
        >
          <FileText className="nav-icon" />
          Ghi số điện
        </button>
        <button
          className={`nav-item ${activeTab === "expenses" ? "active" : ""}`}
          onClick={() => setActiveTab("expenses")}
        >
          <Wrench className="nav-icon" />
          Chi phí
        </button>
      </nav>
    </div>
  );
}
