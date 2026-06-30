import { useState, useEffect } from "react";
import { Home, Layers, FileText, Wrench } from "lucide-react";

// Services
import { boardingHouseService } from "./services/boardingHouse.service";
import { roomService, Room, BoardingHouse } from "./services/room.service";
import { billService, Bill } from "./services/bill.service";
import {
  expenseService,
  Expense,
  FinancialSummary,
} from "./services/expense.service";

// Components
import { HomeTab } from "./components/HomeTab";
import { RoomsTab } from "./components/RoomsTab";
import { BillingTab } from "./components/BillingTab";
import { ExpensesTab } from "./components/ExpensesTab";
import { BoardingHouseModal } from "./components/BoardingHouseModal";
import { RoomModal, parseNumberString } from "./components/RoomModal";
import { Login } from "./components/Login";

// Auth
import { authService, User } from "./services/auth.service";

// Notification Context
import { useNotification } from "./components/NotificationProvider";

// Helper function to extract friendly error messages from API responses (supporting Zod validation errors)
const getErrorMessage = (err: any): string => {
  if (err.response?.data) {
    const data = err.response.data;
    // 1. Zod validation errors list
    if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors.map((e: any) => e.message).join(", ");
    }
    // 2. Custom error messages from backend
    if (data.error) return data.error;
    // 3. General message
    if (data.message) return data.message;
  }
  return err.message || "Đã xảy ra lỗi hệ thống!";
};

export default function App() {
  const { showToast, showConfirm } = useNotification();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    authService.isAuthenticated(),
  );
  const [currentUser, setCurrentUser] = useState<User | null>(
    authService.getCurrentUser(),
  );
  const [activeTab, setActiveTab] = useState<
    "home" | "rooms" | "billing" | "expenses"
  >("home");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // States dữ liệu
  const [showBHModal, setShowBHModal] = useState<boolean>(false);
  const [editingBH, setEditingBH] = useState<BoardingHouse | null>(null);
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

  // Hàm load dữ liệu từ API song song 100% bằng Promise.all
  const fetchRoomsAndBills = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      const [roomsData, bhData, billsData, expensesData, summaryData] = await Promise.all([
        roomService.getAll(),
        boardingHouseService.getAll(),
        billService.getByPeriod(selectedMonth, selectedYear),
        expenseService.getAll(),
        expenseService.getSummary(),
      ]);

      setBoardingHouses(bhData);
      setBills(billsData);

      // Map thuộc tính isPaidThisMonth cho các phòng dựa vào hóa đơn đã được lập
      const mappedRooms = roomsData.map((room) => {
        const bill = billsData.find((b) => b.roomId === room.id);
        return {
          ...room,
          isPaidThisMonth: bill ? bill.isPaid : false,
        };
      });
      setRooms(mappedRooms);
      setExpenses(expensesData);
      setChartData(summaryData);

      setError(null);
    } catch (err) {
      setError("Không thể kết nối đến máy chủ API. Vui lòng kiểm tra lại!");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRoomsAndBills();
    }
  }, [selectedMonth, selectedYear, isAuthenticated]);

  // Auto refresh when returning from background (iOS PWA switch helper)
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchRoomsAndBills(true); // Silent refetch ngầm
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, [isAuthenticated, selectedMonth, selectedYear]);

  // Auto poll every 20 seconds to sync background changes (e.g. Telegram chốt số)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchRoomsAndBills(true);
    }, 20000);

    return () => clearInterval(interval);
  }, [isAuthenticated, selectedMonth, selectedYear]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

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
      const extraAmount = Number(parseNumberString(inputs.extraAmount || "0"));
      const extraDescription = inputs.extraDescription;

      if (isNaN(newElectricity) || inputs.newElectricity === "") {
        showToast("Vui lòng nhập số điện mới hợp lệ!", "error");
        return;
      }
      if (isNaN(newWater) || inputs.newWater === "") {
        showToast("Vui lòng nhập số nước mới hợp lệ!", "error");
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

      const createdBill = await billService.create({
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

      // Cập nhật State hóa đơn cục bộ thay vì tải lại toàn bộ DB
      setBills((prev) => [...prev, createdBill]);

      // Cập nhật trạng thái thanh toán phòng trọ tương ứng trong State
      setRooms((prev) =>
        prev.map((r) =>
          r.id === roomId ? { ...r, isPaidThisMonth: false } : r
        )
      );

      // Tải lại biểu đồ dòng tiền (chartData) chạy ngầm dưới background
      expenseService.getSummary().then(setChartData).catch(console.error);

      showToast("Đã tạo hóa đơn thành công!");
    } catch (err) {
      showToast("Lỗi: " + getErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đánh dấu hóa đơn đã thanh toán (Tối ưu hóa State cục bộ)
  const handlePayBill = async (billId: string) => {
    try {
      setLoading(true);
      const updatedBill = await billService.pay(billId);
      
      // Chỉ cập nhật hóa đơn vừa thanh toán trong mảng state
      setBills((prev) => prev.map((b) => (b.id === billId ? updatedBill : b)));
      
      // Đánh dấu phòng tương ứng đã thanh toán tiền trong tháng
      setRooms((prev) =>
        prev.map((r) =>
          r.id === updatedBill.roomId ? { ...r, isPaidThisMonth: true } : r
        )
      );

      // Cập nhật lại biểu đồ dòng tiền chạy ngầm dưới background
      expenseService.getSummary().then(setChartData).catch(console.error);

      showToast("Đã cập nhật thanh toán hóa đơn!");
    } catch (err) {
      showToast("Lỗi: " + getErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý hủy/xóa hóa đơn chưa thanh toán (Tối ưu hóa State cục bộ)
  const handleDeleteBill = async (billId: string) => {
    try {
      setLoading(true);
      const targetBill = bills.find((b) => b.id === billId);
      await billService.delete(billId);
      
      // Xóa hóa đơn khỏi state cục bộ
      setBills((prev) => prev.filter((b) => b.id !== billId));

      // Reset trạng thái thanh toán của phòng về chưa chốt
      if (targetBill) {
        setRooms((prev) =>
          prev.map((r) =>
            r.id === targetBill.roomId ? { ...r, isPaidThisMonth: false } : r
          )
        );
      }

      // Cập nhật lại biểu đồ dòng tiền chạy ngầm dưới background
      expenseService.getSummary().then(setChartData).catch(console.error);

      showToast("Đã hủy chốt hóa đơn!");
    } catch (err) {
      showToast("Lỗi: " + getErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  // Thêm chi phí bảo trì mới
  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle.trim() || !expenseAmount.trim()) {
      showToast("Vui lòng nhập đầy đủ tên chi phí và số tiền!", "error");
      return;
    }
    try {
      setLoading(true);
      let finalRoomId: string | null = null;
      let finalDesc: string | null = expenseDesc || null;

      if (expenseRoomId.startsWith("house:")) {
        const parts = expenseRoomId.split(":");
        const bhName = parts[2];
        finalRoomId = null;
        finalDesc = `Dãy trọ: ${bhName}${expenseDesc ? ` - ${expenseDesc}` : ""}`;
      } else if (expenseRoomId.startsWith("room:")) {
        finalRoomId = expenseRoomId.substring(5);
      }

      await expenseService.create({
        title: expenseTitle,
        amount: Number(parseNumberString(expenseAmount)),
        description: finalDesc,
        roomId: finalRoomId,
      });
      setExpenseTitle("");
      setExpenseAmount("");
      setExpenseDesc("");
      setExpenseRoomId("chung");
      setShowExpenseForm(false);
      await fetchRoomsAndBills();
      showToast("Đã lưu chi phí phát sinh!");
    } catch (err) {
      showToast("Lỗi: " + getErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  // Xóa chi phí bảo trì
  const handleDeleteExpense = async (id: string) => {
    showConfirm("Bạn có chắc chắn muốn xóa chi phí này?", async () => {
      try {
        setLoading(true);
        await expenseService.delete(id);
        await fetchRoomsAndBills();
        showToast("Đã xóa chi phí thành công!");
      } catch (err) {
        showToast("Lỗi khi xóa: " + getErrorMessage(err), "error");
      } finally {
        setLoading(false);
      }
    });
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
Xin cảm ơn bạn. Bạn vui lòng thanh toán sớm tiền phòng nhé!`;

    navigator.clipboard.writeText(message);
    showToast(`Đã sao chép mẫu biên lai phòng ${roomName}!`);
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
  const handleSaveRoom = async (
    roomPayload: Omit<Room, "id" | "boardingHouse"> & { id?: string },
  ) => {
    try {
      setLoading(true);
      if (editingRoom) {
        await roomService.update(editingRoom.id, roomPayload);
        showToast("Đã cập nhật thông tin phòng!");
      } else {
        await roomService.create(roomPayload);
        showToast("Đã thêm phòng trọ mới!");
      }
      setShowRoomModal(false);
      await fetchRoomsAndBills();
    } catch (err) {
      showToast("Lỗi khi lưu phòng: " + getErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  // Xóa phòng trọ
  const handleDeleteRoom = async (id: string) => {
    showConfirm(
      "Bạn có chắc chắn muốn xóa phòng trọ này? Tất cả hóa đơn liên quan cũng sẽ bị xóa vĩnh viễn!",
      async () => {
        try {
          setLoading(true);
          await roomService.delete(id);
          setShowRoomModal(false); // Đóng modal sau khi xóa thành công
          await fetchRoomsAndBills();
          showToast("Đã xóa phòng trọ thành công!");
        } catch (err) {
          showToast("Lỗi khi xóa: " + getErrorMessage(err), "error");
        } finally {
          setLoading(false);
        }
      },
    );
  };
  // Mở modal thêm mới dãy trọ
  const handleOpenAddBH = () => {
    setEditingBH(null);
    setShowBHModal(true);
  };

  // Mở modal chỉnh sửa dãy trọ (ví dụ sửa dãy hiện tại đang chọn)
  const handleOpenEditBH = (bh: BoardingHouse) => {
    setEditingBH(bh);
    setShowBHModal(true);
  };
  // Hàm Lưu Dãy trọ
  const handleSaveBoardingHouse = async (
    payload: Omit<BoardingHouse, "id"> & { id?: string },
  ) => {
    try {
      setLoading(true);
      if (editingBH) {
        await boardingHouseService.update(editingBH.id, payload.name);
        showToast("Đã cập nhật tên dãy trọ!");
      } else {
        await boardingHouseService.create(payload.name);
        showToast("Đã thêm dãy trọ mới!");
      }
      setShowBHModal(false);
      await fetchRoomsAndBills();
    } catch (err) {
      showToast("Lỗi khi lưu dãy trọ: " + getErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  // Hàm Xóa Dãy trọ
  const handleDeleteBoardingHouse = async (id: string) => {
    showConfirm(
      "Bạn có chắc chắn muốn xóa dãy trọ này? Thao tác này không thể hoàn tác!",
      async () => {
        try {
          setLoading(true);
          await boardingHouseService.delete(id);
          setShowBHModal(false);
          await fetchRoomsAndBills();
          showToast("Đã xóa dãy trọ thành công!");
        } catch (err) {
          showToast("Lỗi khi xóa: " + getErrorMessage(err), "error");
        } finally {
          setLoading(false);
        }
      },
    );
  };
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div
      className="mx-auto flex max-w-[480px] flex-col gap-4 px-4"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 16px)" }}
    >
      {/* 1. APP HEADER */}
      <header className="flex items-center justify-between border-b border-border/40 pb-2 pt-1">
        <div>
          <h1 className="bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-[22px] font-extrabold leading-tight text-transparent">
            Quản Lý Trọ Việt
          </h1>
          <p className="mt-0.5 text-[12px] tracking-wide text-slate-500">
            Chào {currentUser?.name || "Chủ nhà"}
          </p>
        </div>
        <button
          onClick={authService.logout}
          className="active-scale cursor-pointer rounded-lg border border-border bg-[#1e293b] px-3 py-1.5 text-[11px] font-medium text-slate-300 transition-colors hover:bg-red-950/40 hover:text-red-400"
        >
          Đăng xuất
        </button>
      </header>

      {/* ERROR MESSAGE NOTIFICATION */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-900/60 bg-red-950/40 p-3.5 text-center text-[13px] text-red-400">
          {error}
        </div>
      )}

      {/* MAIN CONTAINER CONTENT VIEW */}
      <main className="flex flex-col gap-4 pb-24">
        {loading && (
          <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-[2px]">
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/90 p-6 shadow-2xl">
              <div className="size-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
              <span className="text-[13px] font-bold text-slate-200">
                Đang xử lý...
              </span>
            </div>
          </div>
        )}

        {/* ACTIVE VIEW TAB SELECTOR */}
        {activeTab === "home" && (
          <HomeTab
            rooms={rooms}
            expenses={expenses}
            boardingHouses={boardingHouses} // Thêm prop này
            chartData={chartData}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            formatCurrency={formatCurrency}
            loading={loading}
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
            loading={loading}
            onAddBHClick={handleOpenAddBH} // Thêm prop này
            onManageBHClick={() => {
              // Tìm dãy trọ hiện tại đang lọc để sửa, hoặc nếu đang chọn "Tất cả" thì mở modal tạo mới
              const currentBH = boardingHouses.find(
                (bh) => bh.id === roomFilter,
              );
              if (currentBH) {
                handleOpenEditBH(currentBH);
              }
            }}
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
            onDeleteBill={handleDeleteBill}
            onCopyZalo={handleCopyZalo}
            formatCurrency={formatCurrency}
            loading={loading}
          />
        )}

        {activeTab === "expenses" && (
          <ExpensesTab
            rooms={rooms}
            expenses={expenses}
            boardingHouses={boardingHouses}
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

      {/* MODAL QUẢN LÝ DÃY TRỌ (POPUP MODAL) */}
      <BoardingHouseModal
        show={showBHModal}
        editingBoardingHouse={editingBH}
        boardingHouses={boardingHouses}
        onClose={() => {
          setShowBHModal(false);
          setEditingBH(null);
        }}
        onSave={handleSaveBoardingHouse}
        onDelete={handleDeleteBoardingHouse}
        loading={loading}
      />
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
      <nav className="bottom-nav fixed bottom-0 left-1/2 z-50 flex w-full max-w-[480px] -translate-x-1/2 justify-around border-t border-border bg-[#151f32]/95 pb-[calc(10px+var(--safe-area-bottom))] pt-3 backdrop-blur-[20px]">
        <button
          className={`flex flex-1 cursor-pointer flex-col items-center gap-1 border-0 bg-transparent text-[11px] font-medium ${
            activeTab === "home"
              ? "text-indigo-500"
              : "text-slate-400 hover:text-slate-200"
          }`}
          onClick={() => setActiveTab("home")}
        >
          <Home className="size-[22px]" />
          Tổng quan
        </button>
        <button
          className={`flex flex-1 cursor-pointer flex-col items-center gap-1 border-0 bg-transparent text-[11px] font-medium ${
            activeTab === "rooms"
              ? "text-indigo-500"
              : "text-slate-400 hover:text-slate-200"
          }`}
          onClick={() => setActiveTab("rooms")}
        >
          <Layers className="size-[22px]" />
          Phòng trọ
        </button>
        <button
          className={`flex flex-1 cursor-pointer flex-col items-center gap-1 border-0 bg-transparent text-[11px] font-medium ${
            activeTab === "billing"
              ? "text-indigo-500"
              : "text-slate-400 hover:text-slate-200"
          }`}
          onClick={() => setActiveTab("billing")}
        >
          <FileText className="size-[22px]" />
          Ghi số điện
        </button>
        <button
          className={`flex flex-1 cursor-pointer flex-col items-center gap-1 border-0 bg-transparent text-[11px] font-medium ${
            activeTab === "expenses"
              ? "text-indigo-500"
              : "text-slate-400 hover:text-slate-200"
          }`}
          onClick={() => setActiveTab("expenses")}
        >
          <Wrench className="size-[22px]" />
          Chi phí
        </button>
      </nav>
    </div>
  );
}
