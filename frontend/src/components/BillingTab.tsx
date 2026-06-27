import React from "react";
import { CheckCircle2, AlertCircle, Copy } from "lucide-react";
import { Room } from "../services/room.service";
import { BoardingHouse } from "../services/room.service";
import { Bill } from "../services/bill.service";

interface BillingTabProps {
  rooms: Room[];
  bills: Bill[];
  boardingHouses: BoardingHouse[];
  roomFilter: string;
  setRoomFilter: (filter: string) => void;
  selectedMonth: number;
  selectedYear: number;
  billingInputs: Record<
    string,
    {
      newElectricity: string;
      newWater: string;
      extraAmount: string;
      extraDescription: string;
    }
  >;
  setBillingInputs: React.Dispatch<React.SetStateAction<any>>;
  onCreateBill: (roomId: string, oldElectricity: number, oldWater: number) => Promise<void>;
  onPayBill: (billId: string) => Promise<void>;
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
  onCopyZalo,
  formatCurrency,
  loading,
}) => {
  const activeRooms = rooms.filter((r) => r.status === "OCCUPIED" && (roomFilter === "ALL" || r.boardingHouseId === roomFilter));

  const handleInputChange = (roomId: string, field: string, value: string) => {
    setBillingInputs((prev: any) => ({
      ...prev,
      [roomId]: {
        ...(prev[roomId] || {
          newElectricity: "",
          newWater: "",
          extraAmount: "0",
          extraDescription: "",
        }),
        [field]: value,
      },
    }));
  };

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h3 className="text-[17px] font-bold text-slate-100">Chỉ số điện nước tháng này</h3>
        <p className="text-[12.5px] text-slate-500 mt-1">
          Nhập nhanh chỉ số điện nước cuối tháng để tạo hóa đơn gửi khách.
        </p>
      </div>

      {/* Bộ lọc Dãy trọ cho tab Ghi số điện (Billing) */}
      <div className="tabs-container flex bg-surface border border-border p-1 rounded-xl gap-1 overflow-x-auto">
        <button
          className={`flex-1 py-2 px-3.5 rounded-lg text-[13px] font-medium transition-all whitespace-nowrap active-scale ${
            roomFilter === "ALL" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
          }`}
          onClick={() => setRoomFilter("ALL")}
        >
          Tất cả
        </button>
        {boardingHouses.map((house) => (
          <button
            key={house.id}
            className={`flex-1 py-2 px-3.5 rounded-lg text-[13px] font-medium transition-all whitespace-nowrap active-scale ${
              roomFilter === house.id ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
            }`}
            onClick={() => setRoomFilter(house.id)}
          >
            {house.name}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 mt-1">
        {activeRooms.length === 0 ? (
          <div className="text-center text-slate-400 py-10 px-4 text-[13px]">
            Chưa có phòng nào đang thuê trong dãy trọ này.
          </div>
        ) : (
          activeRooms.map((room) => {
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

            const inputs = billingInputs[room.id] || {
              newElectricity: "",
              newWater: "",
              extraAmount: "0",
              extraDescription: "",
            };

            return (
              <div
                key={room.id}
                className="bg-surface border border-border rounded-2xl p-4 flex flex-col gap-3"
              >
                <div className="flex justify-between items-start border-b border-border pb-2.5 gap-2">
                  <span className="text-[16px] font-bold text-slate-100 flex flex-wrap items-center gap-1.5">
                    {room.name}
                    {isNewRenter && (
                      <span className="text-[8.5px] px-1.5 py-0.5 rounded bg-indigo-950/50 text-indigo-400 border border-indigo-900/60 font-bold">
                        Mới
                      </span>
                    )}
                    {room.isElectricityIncluded && (
                      <span className="text-[8.5px] px-1.5 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-900/60 font-bold">
                        Bao Điện
                      </span>
                    )}
                    <span
                      className={`text-[8.5px] px-1.5 py-0.5 rounded border font-bold ${
                        new Date().getDate() === room.billingDay
                          ? "bg-amber-950/50 text-amber-400 border-amber-900/60 font-extrabold animate-pulse"
                          : "bg-slate-800/40 text-slate-400 border-slate-700/60"
                      }`}
                    >
                      {new Date().getDate() === room.billingDay ? `Đến hạn (Ngày ${room.billingDay})` : `Hạn: Ngày ${room.billingDay}`}
                    </span>
                  </span>
                  <span className="text-[12px] text-slate-500 shrink-0 pt-0.5">
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

                    <div className="p-3 rounded-lg bg-[#0b0f19] border border-border flex flex-col gap-1.5 text-slate-300">
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
                      <div className="flex justify-between font-bold border-t border-border pt-1.5 text-[14px] text-indigo-400">
                        <span>Tổng tiền phòng:</span>
                        <span>{formatCurrency(bill.totalAmount)}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-1">
                      <div className="flex items-center gap-1.5">
                        <span>Thanh toán:</span>
                        {bill.isPaid ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 size={14} /> Đã đóng
                          </span>
                        ) : (
                          <span className="text-red-400 font-bold flex items-center gap-1">
                            <AlertCircle size={14} /> Chưa đóng
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          className="w-auto px-3.5 py-1.5 text-[12px] font-bold flex items-center gap-1 bg-[#1e2d4a]/50 text-slate-300 border border-border rounded-lg hover:bg-[#1e2d4a] transition-all active-scale"
                          onClick={() => onCopyZalo(bill, room.name, room.renterName)}
                        >
                          <Copy size={12} /> Zalo
                        </button>
                        {!bill.isPaid && (
                          <button
                            disabled={loading}
                            className="w-auto px-3.5 py-1.5 text-[12px] font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all active-scale disabled:opacity-50"
                            onClick={() => onPayBill(bill.id)}
                          >
                            {loading ? "Đang lưu..." : "Đã thu tiền"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* CHƯA CÓ HÓA ĐƠN TRONG THÁNG NÀY: FORM NHẬP */
                  <div className="flex flex-col gap-2.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11.5px] text-slate-400 block mb-1">Số Điện Mới (Cũ: {oldElectricity})</label>
                        <input
                          type="number"
                          disabled={loading}
                          placeholder="Nhập số điện..."
                          value={inputs.newElectricity}
                          onChange={(e) => handleInputChange(room.id, "newElectricity", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-[#0b0f19] text-slate-100 text-[13px] focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="text-[11.5px] text-slate-400 block mb-1">Số Nước Mới (Cũ: {oldWater})</label>
                        <input
                          type="number"
                          disabled={loading}
                          placeholder="Nhập số nước..."
                          value={inputs.newWater}
                          onChange={(e) => handleInputChange(room.id, "newWater", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-[#0b0f19] text-slate-100 text-[13px] focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11.5px] text-slate-400 block mb-1">Phát sinh riêng (đ)</label>
                        <input
                          type="number"
                          disabled={loading}
                          placeholder="0"
                          value={inputs.extraAmount}
                          onChange={(e) => handleInputChange(room.id, "extraAmount", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-[#0b0f19] text-slate-100 text-[13px] focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="text-[11.5px] text-slate-400 block mb-1">Lý do phát sinh</label>
                        <input
                          type="text"
                          disabled={loading}
                          placeholder="Ví dụ: Thay khóa..."
                          value={inputs.extraDescription}
                          onChange={(e) => handleInputChange(room.id, "extraDescription", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-[#0b0f19] text-slate-100 text-[13px] focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <button
                      disabled={loading}
                      className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold mt-2 transition-colors active-scale disabled:opacity-50"
                      onClick={() => onCreateBill(room.id, oldElectricity, oldWater)}
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
