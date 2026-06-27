import React, { useState, useEffect } from "react";
import { Room } from "../services/room.service";
import { BoardingHouse } from "../services/room.service";

interface RoomModalProps {
  show: boolean;
  editingRoom: Room | null;
  boardingHouses: BoardingHouse[];
  onClose: () => void;
  onSave: (roomPayload: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  loading: boolean;
}

export const RoomModal: React.FC<RoomModalProps> = ({
  show,
  editingRoom,
  boardingHouses,
  onClose,
  onSave,
  onDelete,
  loading,
}) => {
  const [name, setName] = useState<string>("");
  const [boardingHouseId, setBoardingHouseId] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [electricityPrice, setElectricityPrice] = useState<string>("3500");
  const [waterPrice, setWaterPrice] = useState<string>("15000");
  const [internetPrice, setInternetPrice] = useState<string>("100000");
  const [trashPrice, setTrashPrice] = useState<string>("20000");
  const [billingDay, setBillingDay] = useState<string>("30");
  const [status, setStatus] = useState<"VACANT" | "OCCUPIED" | "MAINTENANCE">("VACANT");
  
  // Tenant states
  const [renterName, setRenterName] = useState<string>("");
  const [renterPhone, setRenterPhone] = useState<string>("");
  const [renterDeposit, setRenterDeposit] = useState<string>("0");
  const [electricityDeposit, setElectricityDeposit] = useState<string>("0");
  const [isElectricityIncluded, setIsElectricityIncluded] = useState<boolean>(false);
  const [rentStartDate, setRentStartDate] = useState<string>("");
  const [rentStartElectricity, setRentStartElectricity] = useState<string>("0");
  const [rentStartWater, setRentStartWater] = useState<string>("0");

  useEffect(() => {
    if (editingRoom) {
      setName(editingRoom.name);
      setBoardingHouseId(editingRoom.boardingHouseId);
      setPrice(editingRoom.price.toString());
      setElectricityPrice(editingRoom.electricityPrice.toString());
      setWaterPrice(editingRoom.waterPrice.toString());
      setInternetPrice(editingRoom.internetPrice.toString());
      setTrashPrice(editingRoom.trashPrice.toString());
      setBillingDay(editingRoom.billingDay?.toString() || "30");
      setStatus(editingRoom.status);
      setRenterName(editingRoom.renterName || "");
      setRenterPhone(editingRoom.renterPhone || "");
      setRenterDeposit(editingRoom.renterDeposit?.toString() || "0");
      setElectricityDeposit(editingRoom.electricityDeposit.toString());
      setIsElectricityIncluded(editingRoom.isElectricityIncluded);
      setRentStartDate(editingRoom.rentStartDate ? editingRoom.rentStartDate.substring(0, 10) : "");
      setRentStartElectricity(editingRoom.rentStartElectricity.toString());
      setRentStartWater(editingRoom.rentStartWater.toString());
    } else {
      setName("");
      setBoardingHouseId(boardingHouses[0]?.id || "");
      setPrice("");
      setElectricityPrice("3500");
      setWaterPrice("15000");
      setInternetPrice("100000");
      setTrashPrice("20000");
      setBillingDay("30");
      setStatus("VACANT");
      setRenterName("");
      setRenterPhone("");
      setRenterDeposit("0");
      setElectricityDeposit("0");
      setIsElectricityIncluded(false);
      setRentStartDate("");
      setRentStartElectricity("0");
      setRentStartWater("0");
    }
  }, [editingRoom, show, boardingHouses]);

  if (!show) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price.trim() || !boardingHouseId) {
      alert("Vui lòng nhập đầy đủ tên phòng, giá thuê và chọn dãy trọ!");
      return;
    }
    const payload = {
      name,
      boardingHouseId,
      price: Number(price),
      electricityPrice: Number(electricityPrice),
      waterPrice: Number(waterPrice),
      internetPrice: Number(internetPrice),
      trashPrice: Number(trashPrice),
      billingDay: Number(billingDay),
      status,
      renterName: status === "OCCUPIED" ? renterName || null : null,
      renterPhone: status === "OCCUPIED" ? renterPhone || null : null,
      renterDeposit: status === "OCCUPIED" ? Number(renterDeposit) : 0,
      electricityDeposit: status === "OCCUPIED" ? Number(electricityDeposit) : 0,
      isElectricityIncluded: status === "OCCUPIED" ? isElectricityIncluded : false,
      rentStartDate: status === "OCCUPIED" && rentStartDate ? new Date(rentStartDate).toISOString() : null,
      rentStartElectricity: status === "OCCUPIED" ? Number(rentStartElectricity) : 0,
      rentStartWater: status === "OCCUPIED" ? Number(rentStartWater) : 0,
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-[3px] z-[2000] flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-surface border border-border rounded-2xl w-full max-w-[420px] max-h-[90vh] overflow-y-auto p-5 flex flex-col gap-4.5 shadow-2xl"
      >
        <div className="flex justify-between items-center border-b border-border pb-2.5">
          <h3 className="text-[17px] font-bold text-slate-100">
            {editingRoom ? `Chỉnh sửa: ${editingRoom.name}` : "Thêm Phòng Trọ Mới"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="bg-transparent border-0 text-slate-400 hover:text-slate-200 text-xl cursor-pointer leading-none"
          >
            ×
          </button>
        </div>

        {/* Thông tin cơ bản */}
        <div className="flex flex-col gap-2.5">
          <h4 className="text-[12.5px] text-indigo-400 uppercase font-bold tracking-wider border-l-2 border-indigo-500 pl-2">
            Thông tin cơ bản
          </h4>
          
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11.5px] text-slate-400 block mb-1">Tên phòng</label>
              <input
                type="text"
                placeholder="Ví dụ: A1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-[#0b0f19] text-slate-100 text-[13px] focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-[11.5px] text-slate-400 block mb-1">Thuộc dãy trọ</label>
              <select
                value={boardingHouseId}
                onChange={(e) => setBoardingHouseId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-[#0b0f19] text-slate-100 text-[13px] focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="" disabled>-- Chọn dãy --</option>
                {boardingHouses.map((house) => (
                  <option key={house.id} value={house.id}>{house.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11.5px] text-slate-400 block mb-1">Giá thuê phòng (đ)</label>
              <input
                type="number"
                placeholder="Ví dụ: 3000000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-[#0b0f19] text-slate-100 text-[13px] focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-[11.5px] text-slate-400 block mb-1">Ngày chốt (1-31)</label>
              <input
                type="number"
                min="1"
                max="31"
                placeholder="Mặc định: 30"
                value={billingDay}
                onChange={(e) => setBillingDay(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-[#0b0f19] text-slate-100 text-[13px] focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Đơn giá dịch vụ */}
        <div className="flex flex-col gap-2.5">
          <h4 className="text-[12.5px] text-indigo-400 uppercase font-bold tracking-wider border-l-2 border-indigo-500 pl-2">
            Đơn giá dịch vụ
          </h4>
          
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11.5px] text-slate-400 block mb-1">Điện (đ/kWh)</label>
              <input
                type="number"
                placeholder="3500"
                value={electricityPrice}
                onChange={(e) => setElectricityPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-[#0b0f19] text-slate-100 text-[13px] focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-[11.5px] text-slate-400 block mb-1">Nước (đ/m3)</label>
              <input
                type="number"
                placeholder="15000"
                value={waterPrice}
                onChange={(e) => setWaterPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-[#0b0f19] text-slate-100 text-[13px] focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11.5px] text-slate-400 block mb-1">Internet/phòng (đ)</label>
              <input
                type="number"
                placeholder="100000"
                value={internetPrice}
                onChange={(e) => setInternetPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-[#0b0f19] text-slate-100 text-[13px] focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-[11.5px] text-slate-400 block mb-1">Rác thải/phòng (đ)</label>
              <input
                type="number"
                placeholder="20000"
                value={trashPrice}
                onChange={(e) => setTrashPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-[#0b0f19] text-slate-100 text-[13px] focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Trạng thái & Khách thuê */}
        <div className="flex flex-col gap-2.5">
          <h4 className="text-[12.5px] text-indigo-400 uppercase font-bold tracking-wider border-l-2 border-indigo-500 pl-2">
            Trạng thái & Khách thuê
          </h4>
          
          <div>
            <label className="text-[11.5px] text-slate-400 block mb-1">Trạng thái phòng</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-[#0b0f19] text-slate-100 text-[13px] focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="VACANT">Phòng trống</option>
              <option value="OCCUPIED">Đang thuê</option>
              <option value="MAINTENANCE">Bảo trì</option>
            </select>
          </div>

          {status === "OCCUPIED" && (
            <div className="flex flex-col gap-2.5 p-3 rounded-xl bg-[#0b0f19] border border-border border-dashed">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Tên khách thuê</label>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={renterName}
                    onChange={(e) => setRenterName(e.target.value)}
                    className="w-full max-w-full min-w-0 px-2.5 py-1.5 rounded-lg border border-border bg-surface text-slate-100 text-[12.5px] focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    placeholder="090..."
                    value={renterPhone}
                    onChange={(e) => setRenterPhone(e.target.value)}
                    className="w-full max-w-full min-w-0 px-2.5 py-1.5 rounded-lg border border-border bg-surface text-slate-100 text-[12.5px] focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Cọc phòng (đ)</label>
                  <input
                    type="number"
                    value={renterDeposit}
                    onChange={(e) => setRenterDeposit(e.target.value)}
                    className="w-full max-w-full min-w-0 px-2.5 py-1.5 rounded-lg border border-border bg-surface text-slate-100 text-[12.5px] focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Cọc điện gối (đ)</label>
                  <input
                    type="number"
                    value={electricityDeposit}
                    onChange={(e) => setElectricityDeposit(e.target.value)}
                    className="w-full max-w-full min-w-0 px-2.5 py-1.5 rounded-lg border border-border bg-surface text-slate-100 text-[12.5px] focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="modalIsElecInc"
                  checked={isElectricityIncluded}
                  onChange={(e) => setIsElectricityIncluded(e.target.checked)}
                  className="rounded border-border text-indigo-600 focus:ring-0 focus:ring-offset-0 bg-[#0b0f19] cursor-pointer"
                />
                <label
                  htmlFor="modalIsElecInc"
                  className="text-[11.5px] text-slate-400 cursor-pointer select-none"
                >
                  Bao tiền điện (cho 3 Trời)
                </label>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Ngày bắt đầu thuê</label>
                <input
                  type="date"
                  value={rentStartDate}
                  onChange={(e) => setRentStartDate(e.target.value)}
                  className="w-full max-w-full min-w-0 px-2.5 py-1.5 rounded-lg border border-border bg-surface text-slate-100 text-[12.5px] focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Số điện đầu</label>
                  <input
                    type="number"
                    value={rentStartElectricity}
                    onChange={(e) => setRentStartElectricity(e.target.value)}
                    className="w-full max-w-full min-w-0 px-2.5 py-1.5 rounded-lg border border-border bg-surface text-slate-100 text-[12.5px] focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Số nước đầu</label>
                  <input
                    type="number"
                    value={rentStartWater}
                    onChange={(e) => setRentStartWater(e.target.value)}
                    className="w-full max-w-full min-w-0 px-2.5 py-1.5 rounded-lg border border-border bg-surface text-slate-100 text-[12.5px] focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Buttons điều hướng */}
        <div className="flex gap-2.5 mt-3 border-t border-border pt-4">
          {editingRoom && (
            <button
              type="button"
              disabled={loading}
              onClick={() => onDelete(editingRoom.id)}
              className="px-3.5 py-2.5 rounded-xl bg-red-950/40 border border-red-900/60 hover:bg-red-900/60 text-red-400 text-[13px] font-bold transition-colors active-scale whitespace-nowrap"
            >
              {loading ? "Đang xóa..." : "Xóa"}
            </button>
          )}
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-border text-slate-400 hover:bg-slate-800/40 text-[13px] transition-colors active-scale"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-[2] py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold transition-colors active-scale"
          >
            {loading ? "Đang lưu..." : "Lưu lại"}
          </button>
        </div>
      </form>
    </div>
  );
};
