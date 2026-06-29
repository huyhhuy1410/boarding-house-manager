import React from "react";
import { CheckCircle2, AlertCircle, Copy, RefreshCw } from "lucide-react";
import { Room } from "../services/room.service";
import { BoardingHouse } from "../services/room.service";
import { Bill } from "../services/bill.service";
import { BillImageCard } from "./BillImageCard";
import { formatNumberString } from "./RoomModal";

interface BillingInputState {
  newElectricity: string;
  newWater: string;
  extraAmount: string;
  extraDescription: string;
}

interface BillingTabProps {
  rooms: Room[];
  bills: Bill[];
  boardingHouses: BoardingHouse[];
  roomFilter: string;
  setRoomFilter: (filter: string) => void;
  selectedMonth: number;
  selectedYear: number;
  billingInputs: Record<string, BillingInputState>;
  setBillingInputs: React.Dispatch<React.SetStateAction<Record<string, BillingInputState>>>;
  onCreateBill: (roomId: string, oldElectricity: number, oldWater: number) => Promise<void>;
  onPayBill: (billId: string) => Promise<void>;
  onDeleteBill: (billId: string) => Promise<void>;
  onCopyZalo: (bill: Bill, roomName: string, renterName: string | null) => void;
  formatCurrency: (val: number) => string;
  loading: boolean;
}

export const BillingTab: React.FC<BillingTabProps> = ({
  rooms,
  bills,
  boardingHouses,
  roomFilter,
  setRoomFilter,
  selectedMonth,
  selectedYear,
  billingInputs,
  setBillingInputs,
  onCreateBill,
  onPayBill,
  onDeleteBill,
  onCopyZalo,
  formatCurrency,
  loading,
}) => {
  const activeRooms = rooms.filter((r) => r.status === "OCCUPIED" && (roomFilter === "ALL" || r.boardingHouseId === roomFilter));

  const handleInputChange = (roomId: string, field: string, value: string) => {
    const formattedValue = field === "extraAmount" ? formatNumberString(value) : value;
    setBillingInputs((prev: Record<string, BillingInputState>) => ({
      ...prev,
      [roomId]: {
        ...(prev[roomId] || {
          newElectricity: "",
          newWater: "",
          extraAmount: "0",
          extraDescription: "",
        }),
        [field]: formattedValue,
      },
    }));
  };

  // Hàm wrapper xử lý tạo hóa đơn và tự động nhảy sang phòng tiếp theo chưa ghi số
  const handleSubmitBill = async (roomId: string, oldElectricity: number, oldWater: number) => {
    try {
      // 1. Lưu hóa đơn phòng hiện tại
      await onCreateBill(roomId, oldElectricity, oldWater);

      // 2. Tìm phòng kế tiếp chưa chốt hóa đơn trong danh sách đã lọc
      setTimeout(() => {
        const currentIndex = activeRooms.findIndex((r) => r.id === roomId);
        if (currentIndex !== -1) {
          let nextRoom = null;
          // Duyệt từ vị trí tiếp theo trở đi
          for (let i = currentIndex + 1; i < activeRooms.length; i++) {
            const r = activeRooms[i];
            const hasBill = bills.some((b) => b.roomId === r.id);
            if (!hasBill) {
              nextRoom = r;
              break;
            }
          }

          // 3. Cuộn mượt mà đến phòng kế tiếp và chọn ô input điện mới
          if (nextRoom) {
            const cardEl = document.getElementById(`room-card-${nextRoom.id}`);
            const inputEl = document.getElementById(`elec-input-${nextRoom.id}`) as HTMLInputElement | null;

            if (cardEl) {
              cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
            }

            if (inputEl) {
              setTimeout(() => {
                inputEl.focus();
                inputEl.select(); // Tiện ích: Chọn sẵn văn bản để người dùng gõ đè số mới lên ngay
              }, 300);
            }
          }
        }
      }, 200);
    } catch (err) {
      console.error("Lỗi khi xử lý nhảy phòng tiếp theo:", err);
    }
  };

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h3 className="text-[17px] font-bold text-slate-100">Chỉ số điện nước tháng này</h3>
        <p className="mt-1 text-[12.5px] text-slate-500">
          Nhập nhanh chỉ số điện nước cuối tháng để tạo hóa đơn gửi khách.
        </p>
      </div>

      {/* Bộ lọc Dãy trọ cho tab Ghi số điện (Billing) */}
      <div className="tabs-container flex gap-1 overflow-x-auto rounded-xl border border-border bg-surface p-1">
        <button
          className={`active-scale flex-1 whitespace-nowrap rounded-lg px-3.5 py-2 text-[13px] font-medium transition-all ${
            roomFilter === "ALL" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
          }`}
          onClick={() => setRoomFilter("ALL")}
        >
          Tất cả
        </button>
        {boardingHouses.map((house) => (
          <button
            key={house.id}
            className={`active-scale flex-1 whitespace-nowrap rounded-lg px-3.5 py-2 text-[13px] font-medium transition-all ${
              roomFilter === house.id ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
            }`}
            onClick={() => setRoomFilter(house.id)}
          >
            {house.name}
          </button>
        ))}
      </div>

      <div className="mt-1 flex flex-col gap-3">
        {loading && rooms.length === 0 ? (
          // Hiển thị 3 Card Skeleton khi đang tải dữ liệu lần đầu
          Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="flex animate-pulse flex-col gap-3 rounded-2xl border border-border/50 bg-surface/50 p-4"
            >
              <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                <div className="h-4 w-20 rounded-md bg-slate-800"></div>
                <div className="h-4 w-24 rounded-md bg-slate-800"></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <div className="h-3.5 w-24 rounded-md bg-slate-800"></div>
                  <div className="h-9 rounded-lg bg-slate-800"></div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="h-3.5 w-24 rounded-md bg-slate-800"></div>
                  <div className="h-9 rounded-lg bg-slate-800"></div>
                </div>
              </div>
              <div className="mt-1 h-10 rounded-lg bg-slate-800"></div>
            </div>
          ))
        ) : activeRooms.length === 0 ? (
          <div className="px-4 py-10 text-center text-[13px] text-slate-400">
            Chưa có phòng nào đang thuê trong dãy trọ này.
          </div>
        ) : (
          activeRooms.map((room) => {
            const bill = bills.find((b) => b.roomId === room.id);

            const isNewRenter = (() => {
              if (!room.rentStartDate) return false;
              const d = new Date(room.rentStartDate);
              return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
            })();

            // Xác định chỉ số điện cũ & nước cũ
            let oldElectricity = room.rentStartElectricity;
            let oldWater = room.rentStartWater;

            if (!isNewRenter && room.bills && room.bills.length > 0) {
              // Tìm hóa đơn của các tháng trước tháng hiện tại
              const pastBills = room.bills.filter((b) => {
                return b.year < selectedYear || (b.year === selectedYear && b.month < selectedMonth);
              });
              if (pastBills.length > 0) {
                const latestPastBill = pastBills[0]; // Vì đã được orderBy desc ở backend
                oldElectricity = latestPastBill.newElectricity;
                oldWater = latestPastBill.newWater;
              }
            }

            const inputs = billingInputs[room.id] || {
              newElectricity: "",
              newWater: "",
              extraAmount: "0",
              extraDescription: "",
            };

            return (
              <div
                key={room.id}
                id={`room-card-${room.id}`}
                className="flex scroll-mt-20 flex-col gap-3 rounded-2xl border border-border bg-surface p-4"
              >
                <div className="flex items-start justify-between gap-2 border-b border-border pb-2.5">
                  <span className="flex flex-wrap items-center gap-1.5 text-[16px] font-bold text-slate-100">
                    {room.name}
                    {isNewRenter && (
                      <span className="rounded border border-indigo-900/60 bg-indigo-950/50 px-1.5 py-0.5 text-[8.5px] font-bold text-indigo-400">
                        Mới
                      </span>
                    )}
                    {room.isElectricityIncluded && (
                      <span className="rounded border border-emerald-900/60 bg-emerald-950/50 px-1.5 py-0.5 text-[8.5px] font-bold text-emerald-400">
                        Bao Điện
                      </span>
                    )}
                    <span
                      className={`rounded border px-1.5 py-0.5 text-[8.5px] font-bold ${
                        new Date().getDate() === room.billingDay
                          ? "animate-pulse border-amber-900/60 bg-amber-950/50 font-extrabold text-amber-400"
                          : "border-slate-700/60 bg-slate-800/40 text-slate-400"
                      }`}
                    >
                      {new Date().getDate() === room.billingDay ? `Đến hạn (Ngày ${room.billingDay})` : `Hạn: Ngày ${room.billingDay}`}
                    </span>
                  </span>
                  <span className="shrink-0 pt-0.5 text-[12px] text-slate-500">
                    {room.renterName}
                  </span>
                </div>

                {bill ? (
                  /* ĐÃ CÓ HÓA ĐƠN TRONG THÁNG NÀY */
                  <div className="flex flex-col gap-2.5 text-[13px]">
                    <div className="grid grid-cols-2 gap-1.5 text-slate-400">
                      <div>Điện: {bill.oldElectricity} kWh ➔ {bill.newElectricity} kWh ({bill.newElectricity - bill.oldElectricity} kWh)</div>
                      <div>Nước: {bill.oldWater} m3 ➔ {bill.newWater} m3 ({bill.newWater - bill.oldWater} m3)</div>
                    </div>

                    <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-bg p-3 text-slate-300">
                      <div className="flex justify-between">
                        <span>Tiền phòng:</span>
                        <span>{formatCurrency(bill.rentAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tiền điện:</span>
                        <span>{formatCurrency(bill.electricityAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tiền nước:</span>
                        <span>{formatCurrency(bill.waterAmount)}</span>
                      </div>
                      {(bill.internetAmount > 0 || bill.trashAmount > 0) && (
                        <div className="flex justify-between">
                          <span>Dịch vụ cố định (Internet + Rác):</span>
                          <span>{formatCurrency(Number(bill.internetAmount) + Number(bill.trashAmount))}</span>
                        </div>
                      )}
                      {Number(bill.extraAmount) > 0 && (
                        <div className="flex justify-between text-amber-500">
                          <span>Phát sinh ({bill.extraDescription || "Sửa thiết bị"}):</span>
                          <span>+{formatCurrency(bill.extraAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-border pt-1.5 text-[14px] font-bold text-indigo-400">
                        <span>Tổng tiền phòng:</span>
                        <span>{formatCurrency(bill.totalAmount)}</span>
                      </div>
                    </div>

                    <div className="mt-1 flex flex-col gap-3">
                      <div className="flex items-center gap-1.5 text-[13px]">
                        <span className="text-slate-400">Trạng thái:</span>
                        {bill.isPaid ? (
                          <span className="flex items-center gap-1 font-bold text-emerald-400">
                            <CheckCircle2 size={14} /> Đã đóng tiền
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 font-bold text-red-400">
                            <AlertCircle size={14} /> Chưa đóng tiền
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap justify-end gap-2 border-t border-slate-800/60 pt-1">
                        <button
                          className="active-scale flex w-auto items-center gap-1 rounded-lg border border-border bg-[#1e2d4a]/50 px-3 py-1.5 text-[11.5px] font-bold text-slate-300 transition-all hover:bg-surface-hover"
                          onClick={() => onCopyZalo(bill, room.name, room.renterName)}
                        >
                          <Copy size={12} /> Zalo
                        </button>
                        
                        <BillImageCard
                          bill={bill}
                          roomName={room.name}
                          renterName={room.renterName}
                          formatCurrency={formatCurrency}
                        />

                        {!bill.isPaid && (
                          <>
                            <button
                              disabled={loading}
                              className="active-scale flex w-auto items-center gap-1 rounded-lg border border-red-900/60 bg-red-950/20 px-3 py-1.5 text-[11.5px] font-bold text-red-400 transition-all hover:bg-surface-hover"
                              onClick={() => {
                                if (window.confirm("Bạn có chắc chắn muốn hủy chốt hóa đơn của phòng này để nhập lại chỉ số không?")) {
                                  setBillingInputs((prev) => ({
                                    ...prev,
                                    [room.id]: {
                                      newElectricity: bill.newElectricity.toString(),
                                      newWater: bill.newWater.toString(),
                                      extraAmount: formatNumberString(bill.extraAmount.toString()),
                                      extraDescription: bill.extraDescription || "",
                                    },
                                  }));
                                  onDeleteBill(bill.id);
                                }
                              }}
                            >
                              <RefreshCw size={12} /> Hủy chốt
                            </button>

                            <button
                              disabled={loading}
                              className="active-scale w-auto rounded-lg bg-indigo-600 px-3.5 py-1.5 text-[11.5px] font-bold text-white transition-all hover:bg-indigo-700 disabled:opacity-50"
                              onClick={() => {
                                if (window.confirm(`Xác nhận phòng ${room.name} đã đóng đủ số tiền ${formatCurrency(bill.totalAmount)}?`)) {
                                  onPayBill(bill.id);
                                }
                              }}
                            >
                              {loading ? "Đang lưu..." : "Đã thu tiền"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* CHƯA CÓ HÓA ĐƠN TRONG THÁNG NÀY: FORM NHẬP */
                  <div className="flex flex-col gap-2.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-[11.5px] text-slate-400">Số Điện Mới (Cũ: {oldElectricity})</label>
                        <input
                          type="number"
                          id={`elec-input-${room.id}`}
                          disabled={loading}
                          placeholder="Nhập số điện..."
                          value={inputs.newElectricity}
                          onChange={(e) => handleInputChange(room.id, "newElectricity", e.target.value)}
                          className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-[13px] text-slate-100 transition-colors focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11.5px] text-slate-400">Số Nước Mới (Cũ: {oldWater})</label>
                        <input
                          type="number"
                          disabled={loading}
                          placeholder="Nhập số nước..."
                          value={inputs.newWater}
                          onChange={(e) => handleInputChange(room.id, "newWater", e.target.value)}
                          className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-[13px] text-slate-100 transition-colors focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-[11.5px] text-slate-400">Phát sinh riêng (đ)</label>
                        <input
                          type="text"
                          disabled={loading}
                          placeholder="0"
                          value={inputs.extraAmount}
                          onChange={(e) => handleInputChange(room.id, "extraAmount", e.target.value)}
                          className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-[13px] text-slate-100 transition-colors focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11.5px] text-slate-400">Lý do phát sinh</label>
                        <input
                          type="text"
                          disabled={loading}
                          placeholder="Ví dụ: Thay khóa..."
                          value={inputs.extraDescription}
                          onChange={(e) => handleInputChange(room.id, "extraDescription", e.target.value)}
                          className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-[13px] text-slate-100 transition-colors focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <button
                      disabled={loading}
                      className="active-scale mt-2 w-full rounded-lg bg-indigo-600 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                      onClick={() => handleSubmitBill(room.id, oldElectricity, oldWater)}
                    >
                      {loading ? "Đang tính..." : "Lưu & Tính tiền phòng"}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
