import { useState, useEffect } from "react";
import { Home, Layers, FileText, Wrench } from "lucide-react";

// Services
import { roomService, Room, BoardingHouse } from "./services/room.service";
import { billService, Bill } from "./services/bill.service";
import { expenseService, Expense, FinancialSummary } from "./services/expense.service";

// Components
import { HomeTab } from "./components/HomeTab";
import { RoomsTab } from "./components/RoomsTab";
import { BillingTab } from "./components/BillingTab";
import { ExpensesTab } from "./components/ExpensesTab";
import { RoomModal } from "./components/RoomModal";

export default function App() {
  const [activeTab, setActiveTab] = useState<"home" | "rooms" | "billing" | "expenses">("home");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // States dữ liệu
  const [rooms, setRooms] = useState<Room[]>([]);
  const [boardingHouses, setBoardingHouses] = useState<BoardingHouse[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [chartData, setChartData] = useState<FinancialSummary[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  
  // Mặc định chạy trong tháng 6/2026 cho dữ liệu chạy thử
  const [selectedMonth] = useState<number>(6);
  const [selectedYear] = useState<number>(2026);

  // Lọc phòng theo dãy trọ
  const [roomFilter, setRoomFilter] = useState<string>("ALL");

  // Trạng thái cho CRUD Phòng trọ
  const [showRoomModal, setShowRoomModal] = useState<boolean>(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

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

  // Hàm load dữ liệu từ API
  const fetchRoomsAndBills = async () => {
    try {
      setLoading(true);
      const roomsData = await roomService.getAll();
      const billsData = await billService.getByPeriod(selectedMonth, selectedYear);
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

  // Tiện ích format tiền tệ VND
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);
  };

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

      console.log("Đang tạo hóa đơn cho phòng:", roomId, {
        oldElectricity,
        newElectricity,
        oldWater,
        newWater,
        extraAmount,
        extraDescription,
      });

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

      // Clear input fields for this room
      setBillingInputs((prev) => ({
        ...prev,
        [roomId]: {
          newElectricity: "",
          newWater: "",
          extraAmount: "0",
          extraDescription: "",
        },
      }));

      await fetchRoomsAndBills();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Không thể tạo hóa đơn!";
      alert("Lỗi: " + msg);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đánh dấu hóa đơn đã thanh toán
  const handlePayBill = async (billId: string) => {
    try {
      setLoading(true);
      await billService.pay(billId);
      await fetchRoomsAndBills();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Không thể thanh toán!";
      alert("Lỗi: " + msg);
    } finally {
      setLoading(false);
    }
  };

  // Thêm chi phí bảo trì mới
  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle.trim() || !expenseAmount.trim()) {
      alert("Vui lòng nhập đầy đủ tên chi phí và số tiền!");
      return;
    }
    try {
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
      await fetchRoomsAndBills();
    } catch (err: any) {
      alert("Lỗi: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Xóa chi phí bảo trì
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
    const formattedExtra = formatCurrency(Number(bill.extraAmount));
    const formattedTotal = formatCurrency(bill.totalAmount);

    const electricityUsed = bill.newElectricity - bill.oldElectricity;
    const waterUsed = bill.newWater - bill.oldWater;

    const message = `Chủ nhà trọ gửi biên lai tiền phòng tháng ${bill.month}/${bill.year}:
---------------------------------------
Phòng: ${roomName}
Khách thuê: ${renterName || "Chưa cập nhật"}
---------------------------------------
1. Tiền phòng: ${formattedRent}
2. Tiền điện: ${formattedElectricity}
   (Số cũ: ${bill.oldElectricity} - mới: ${bill.newElectricity} => Sử dụng: ${electricityUsed} kWh)
3. Tiền nước: ${formattedWater}
   (Số cũ: ${bill.oldWater} - mới: ${bill.newWater} => Sử dụng: ${waterUsed} m3)
4. Phí internet: ${formattedInternet}
5. Phí rác & dịch vụ: ${formattedTrash}
${Number(bill.extraAmount) > 0 ? `6. Chi phí phát sinh (${bill.extraDescription || "Sửa thiết bị"}): +${formattedExtra}\n` : ""}---------------------------------------
=> TỔNG CỘNG CẦN THANH TOÁN: ${formattedTotal}
---------------------------------------
Parker cảm ơn bạn. Bạn vui lòng thanh toán sớm tiền phòng nhé!`;

    navigator.clipboard.writeText(message);
    alert(`Đã sao chép mẫu biên lai phòng ${roomName} vào bộ nhớ tạm! Bạn có thể dán trực tiếp gửi qua Zalo/Viber.`);
  };

  // Trình kích hoạt mở Modal Thêm phòng trọ
  const handleOpenAddRoom = () => {
    setEditingRoom(null);
    setShowRoomModal(true);
  };

  // Trình kích hoạt mở Modal Sửa phòng trọ
  const handleOpenEditRoom = (room: Room) => {
    setEditingRoom(room);
    setShowRoomModal(true);
  };

  // Lưu thông tin phòng trọ (Tạo mới & Cập nhật)
  const handleSaveRoom = async (roomPayload: any) => {
    try {
      setLoading(true);
      if (editingRoom) {
        await roomService.update(editingRoom.id, roomPayload);
      } else {
        await roomService.create(roomPayload);
      }
      setShowRoomModal(false);
      await fetchRoomsAndBills();
    } catch (err: any) {
      alert("Lỗi khi lưu phòng: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Xóa phòng trọ
  const handleDeleteRoom = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa phòng trọ này? Tất cả hóa đơn liên quan cũng sẽ bị xóa vĩnh viễn!")) return;
    try {
      setLoading(true);
      await roomService.delete(id);
      setShowRoomModal(false); // Đóng modal sau khi xóa thành công
      await fetchRoomsAndBills();
    } catch (err: any) {
      alert("Lỗi khi xóa phòng: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[480px] mx-auto px-4 pt-4 flex flex-col gap-4">
      {/* 1. APP HEADER */}
      <header className="flex justify-between items-center pt-1 pb-2">
        <div>
          <h1 className="text-[22px] font-extrabold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent leading-tight">
            Quản Lý Trọ Việt
          </h1>
          <p className="text-[12px] text-slate-500 mt-0.5 tracking-wide">
            Hệ thống hỗ trợ chốt phòng di động
          </p>
        </div>
      </header>

      {/* ERROR MESSAGE NOTIFICATION */}
      {error && (
        <div className="bg-red-950/40 text-red-400 p-3.5 rounded-xl border border-red-900/60 text-[13px] mb-4 text-center">
          {error}
        </div>
      )}

      {/* MAIN CONTAINER CONTENT VIEW */}
      <main className="pb-24 flex flex-col gap-4">
        {loading && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-3.5 py-1.5 rounded-full text-[11.5px] font-bold z-[9999] shadow-lg">
            Đang tải dữ liệu...
          </div>
        )}

        {/* ACTIVE VIEW TAB SELECTOR */}
        {activeTab === "home" && (
          <HomeTab
            rooms={rooms}
            expenses={expenses}
            chartData={chartData}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            formatCurrency={formatCurrency}
          />
        )}

        {activeTab === "rooms" && (
          <RoomsTab
            rooms={rooms}
            boardingHouses={boardingHouses}
            roomFilter={roomFilter}
            setRoomFilter={setRoomFilter}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onAddRoomClick={handleOpenAddRoom}
            onRoomClick={handleOpenEditRoom}
            formatCurrency={formatCurrency}
          />
        )}

        {activeTab === "billing" && (
          <BillingTab
            rooms={rooms}
            bills={bills}
            boardingHouses={boardingHouses}
            roomFilter={roomFilter}
            setRoomFilter={setRoomFilter}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            billingInputs={billingInputs}
            setBillingInputs={setBillingInputs}
            onCreateBill={handleCreateBill}
            onPayBill={handlePayBill}
            onCopyZalo={handleCopyZalo}
            formatCurrency={formatCurrency}
            loading={loading}
          />
        )}

        {activeTab === "expenses" && (
          <ExpensesTab
            rooms={rooms}
            expenses={expenses}
            showExpenseForm={showExpenseForm}
            setShowExpenseForm={setShowExpenseForm}
            expenseTitle={expenseTitle}
            setExpenseTitle={setExpenseTitle}
            expenseAmount={expenseAmount}
            setExpenseAmount={setExpenseAmount}
            expenseRoomId={expenseRoomId}
            setExpenseRoomId={setExpenseRoomId}
            expenseDesc={expenseDesc}
            setExpenseDesc={setExpenseDesc}
            onSubmit={handleCreateExpense}
            onDelete={handleDeleteExpense}
            formatCurrency={formatCurrency}
            loading={loading}
          />
        )}
      </main>

      {/* MODAL CẤU HÌNH PHÒNG TRỌ (POPUP MODAL) */}
      <RoomModal
        show={showRoomModal}
        editingRoom={editingRoom}
        boardingHouses={boardingHouses}
        onClose={() => setShowRoomModal(false)}
        onSave={handleSaveRoom}
        onDelete={handleDeleteRoom}
        loading={loading}
      />

      {/* 3. BOTTOM TAB BAR (iOS STYLE) */}
      <nav className="bottom-nav fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-[#151f32]/95 backdrop-blur-[20px] border-t border-border flex justify-around pt-3 pb-[calc(10px+var(--safe-area-bottom))] z-50">
        <button
          className={`flex flex-col items-center gap-1 bg-transparent border-0 text-[11px] font-medium cursor-pointer flex-1 ${
            activeTab === "home" ? "text-indigo-500" : "text-slate-400 hover:text-slate-200"
          }`}
          onClick={() => setActiveTab("home")}
        >
          <Home className="w-[22px] h-[22px]" />
          Tổng quan
        </button>
        <button
          className={`flex flex-col items-center gap-1 bg-transparent border-0 text-[11px] font-medium cursor-pointer flex-1 ${
            activeTab === "rooms" ? "text-indigo-500" : "text-slate-400 hover:text-slate-200"
          }`}
          onClick={() => setActiveTab("rooms")}
        >
          <Layers className="w-[22px] h-[22px]" />
          Phòng trọ
        </button>
        <button
          className={`flex flex-col items-center gap-1 bg-transparent border-0 text-[11px] font-medium cursor-pointer flex-1 ${
            activeTab === "billing" ? "text-indigo-500" : "text-slate-400 hover:text-slate-200"
          }`}
          onClick={() => setActiveTab("billing")}
        >
          <FileText className="w-[22px] h-[22px]" />
          Ghi số điện
        </button>
        <button
          className={`flex flex-col items-center gap-1 bg-transparent border-0 text-[11px] font-medium cursor-pointer flex-1 ${
            activeTab === "expenses" ? "text-indigo-500" : "text-slate-400 hover:text-slate-200"
          }`}
          onClick={() => setActiveTab("expenses")}
        >
          <Wrench className="w-[22px] h-[22px]" />
          Chi phí
        </button>
      </nav>
    </div>
  );
}
