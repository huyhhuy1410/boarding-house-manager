import React, { useState, useEffect } from "react";
import { Room } from "../services/room.service";
import { useNotification } from "./NotificationProvider";
import { formatNumberString, parseNumberString } from "./RoomModal";

interface RelocateModalProps {
  show: boolean;
  room: Room | null; // Phòng cũ đang có khách thuê cần chuyển đi
  rooms: Room[]; // Danh sách toàn bộ phòng để lọc phòng trống
  onClose: () => void;
  onRelocate: (payload: {
    oldRoomId: string;
    newRoomId: string;
    lastElectricity: number;
    lastWater: number;
    newRoomStartElectricity: number;
    newRoomStartWater: number;
    rentAmount?: number;
    internetAmount?: number;
    trashAmount?: number;
    extraAmount?: number;
    extraDescription?: string;
  }) => Promise<void>;
  loading: boolean;
  formatCurrency: (val: number) => string;
}

export const RelocateModal: React.FC<RelocateModalProps> = ({
  show,
  room,
  rooms,
  onClose,
  onRelocate,
  loading,
  formatCurrency,
}) => {
  const { showToast } = useNotification();

  // State các trường nhập liệu
  const [targetRoomId, setTargetRoomId] = useState<string>("");
  const [lastElectricity, setLastElectricity] = useState<string>("");
  const [lastWater, setLastWater] = useState<string>("");
  const [newRoomStartElectricity, setNewRoomStartElectricity] = useState<string>("0");
  const [newRoomStartWater, setNewRoomStartWater] = useState<string>("0");
  
  // Custom billing cho hóa đơn chốt phòng cũ
  const [rentAmount, setRentAmount] = useState<string>("");
  const [extraAmount, setExtraAmount] = useState<string>("0");
  const [extraDescription, setExtraDescription] = useState<string>("");

  // Tiện ích tính toán gợi ý tiền phòng lẻ
  const [daysStayed, setDaysStayed] = useState<number>(0);
  const [suggestedRent, setSuggestedRent] = useState<number>(0);
  const [isProrated, setIsProrated] = useState<boolean>(false);

  // Chỉ số điện nước cũ gần nhất để đối chiếu hiển thị hướng dẫn
  const [oldRoomStartElectricity, setOldRoomStartElectricity] = useState<number>(0);
  const [oldRoomStartWater, setOldRoomStartWater] = useState<number>(0);

  // Khoá cuộn trang nền khi mở modal
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  // Cài đặt thông số ban đầu khi phòng trọ được truyền vào
  useEffect(() => {
    if (show && room) {
      const lastBill = room.bills && room.bills.length > 0 ? room.bills[0] : null;
      const startElec = lastBill ? lastBill.newElectricity : room.rentStartElectricity;
      const startWat = lastBill ? lastBill.newWater : room.rentStartWater;

      setOldRoomStartElectricity(startElec);
      setOldRoomStartWater(startWat);

      // Đặt mặc định chỉ số cuối là chỉ số chốt gần nhất để người dùng sửa đổi
      setLastElectricity(startElec.toString());
      setLastWater(startWat.toString());

      setNewRoomStartElectricity("0");
      setNewRoomStartWater("0");
      setExtraAmount("0");
      setExtraDescription("");
      setTargetRoomId("");

      // Tính số ngày ở thực tế từ rentStartDate đến nay
      if (room.rentStartDate) {
        const start = new Date(room.rentStartDate);
        const today = new Date();
        const diffTime = today.getTime() - start.getTime();
        const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        setDaysStayed(days);

        if (days < 30) {
          const suggested = Math.round((room.price * days) / 30);
          setSuggestedRent(suggested);
          setRentAmount(formatNumberString(suggested.toString()));
          setIsProrated(true);
        } else {
          setSuggestedRent(room.price);
          setRentAmount(formatNumberString(room.price.toString()));
          setIsProrated(false);
        }
      } else {
        setDaysStayed(0);
        setSuggestedRent(room.price);
        setRentAmount(formatNumberString(room.price.toString()));
        setIsProrated(false);
      }
    }
  }, [show, room]);

  if (!show || !room) return null;

  // Lọc danh sách phòng trống làm phòng đích (VACANT)
  const vacantRooms = rooms.filter((r) => r.status === "VACANT");

  const handleProrateToggle = (checked: boolean) => {
    setIsProrated(checked);
    if (checked) {
      setRentAmount(formatNumberString(suggestedRent.toString()));
    } else {
      setRentAmount(formatNumberString(room.price.toString()));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!targetRoomId) {
      showToast("Vui lòng chọn phòng trọ đích cần chuyển đến!", "error");
      return;
    }

    const lastElecNum = Number(lastElectricity);
    const lastWaterNum = Number(lastWater);
    const newStartElecNum = Number(newRoomStartElectricity);
    const newStartWaterNum = Number(newRoomStartWater);

    if (isNaN(lastElecNum) || lastElectricity === "") {
      showToast("Chỉ số điện chốt phòng cũ không hợp lệ!", "error");
      return;
    }
    if (lastElecNum < oldRoomStartElectricity) {
      showToast(`Số điện chốt không được nhỏ hơn số điện chốt gần nhất (${oldRoomStartElectricity})!`, "error");
      return;
    }

    if (isNaN(lastWaterNum) || lastWater === "") {
      showToast("Chỉ số nước chốt phòng cũ không hợp lệ!", "error");
      return;
    }
    if (lastWaterNum < oldRoomStartWater) {
      showToast(`Số nước chốt không được nhỏ hơn số nước chốt gần nhất (${oldRoomStartWater})!`, "error");
      return;
    }

    if (isNaN(newStartElecNum) || newRoomStartElectricity === "") {
      showToast("Chỉ số điện đầu vào của phòng mới không hợp lệ!", "error");
      return;
    }
    if (isNaN(newStartWaterNum) || newRoomStartWater === "") {
      showToast("Chỉ số nước đầu vào của phòng mới không hợp lệ!", "error");
      return;
    }

    const parsedRent = Number(parseNumberString(rentAmount));
    const parsedExtra = Number(parseNumberString(extraAmount));

    if (isNaN(parsedRent) || parsedRent < 0) {
      showToast("Tiền phòng chốt không hợp lệ!", "error");
      return;
    }

    onRelocate({
      oldRoomId: room.id,
      newRoomId: targetRoomId,
      lastElectricity: lastElecNum,
      lastWater: lastWaterNum,
      newRoomStartElectricity: newStartElecNum,
      newRoomStartWater: newStartWaterNum,
      rentAmount: parsedRent,
      extraAmount: parsedExtra,
      extraDescription: extraDescription.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/75 p-4 backdrop-blur-[3px]">
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[90vh] w-full max-w-[440px] flex-col gap-4 overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3.5">
          <div>
            <h3 className="text-[17px] font-bold text-slate-100">
              Nghiệp Vụ Chuyển Phòng
            </h3>
            <p className="mt-0.5 text-[11.5px] text-slate-500">
              Phòng hiện tại: <span className="font-bold text-indigo-400">{room.name}</span> ({room.boardingHouse?.name})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer border-0 bg-transparent text-xl leading-none text-slate-400 hover:text-slate-200"
          >
            ×
          </button>
        </div>

        {/* Khách hàng hiện tại */}
        <div className="rounded-xl bg-[#1e2d4a]/20 p-3 text-[12.5px] border border-indigo-950/40">
          <span className="text-slate-400">Khách thuê:</span>{" "}
          <strong className="text-indigo-300">{room.renterName}</strong>
          {room.renterPhone && <span className="text-slate-500"> ({room.renterPhone})</span>}
          <div className="mt-1 flex justify-between border-t border-indigo-950/20 pt-1 text-[11.5px]">
            <span>Tổng cọc di chuyển:</span>
            <span className="font-bold text-emerald-400">
              {formatCurrency(Number(room.renterDeposit || 0) + Number(room.electricityDeposit || 0))}
            </span>
          </div>
        </div>

        {/* Chọn phòng trọ đích */}
        <div className="flex flex-col gap-1">
          <label className="text-[11.5px] font-bold uppercase tracking-wider text-indigo-400">
            Chọn phòng trống chuyển đến
          </label>
          <select
            value={targetRoomId}
            onChange={(e) => setTargetRoomId(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-[13px] text-slate-100 transition-colors focus:border-indigo-500 focus:outline-none"
          >
            <option value="">-- Chọn phòng trống --</option>
            {vacantRooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} - Dãy: {r.boardingHouse?.name} ({formatCurrency(r.price)})
              </option>
            ))}
          </select>
          {vacantRooms.length === 0 && (
            <span className="text-[11px] text-amber-500">
              ⚠️ Không còn phòng trống nào để chuyển. Vui lòng tạo thêm phòng mới hoặc giải phóng phòng trước!
            </span>
          )}
        </div>

        {/* Chốt số điện nước phòng cũ */}
        <div className="flex flex-col gap-2.5 border-t border-border pt-3">
          <h4 className="border-l-2 border-indigo-500 pl-2 text-[12.5px] font-bold uppercase tracking-wider text-indigo-400">
            Chốt điện nước phòng cũ ({room.name})
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11.5px] text-slate-400">
                Số Điện Cuối (Số đầu: {oldRoomStartElectricity})
              </label>
              <input
                type="number"
                placeholder="Nhập số điện..."
                value={lastElectricity}
                onChange={(e) => setLastElectricity(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-[13px] text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11.5px] text-slate-400">
                Số Nước Cuối (Số đầu: {oldRoomStartWater})
              </label>
              <input
                type="number"
                placeholder="Nhập số nước..."
                value={lastWater}
                onChange={(e) => setLastWater(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-[13px] text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Chỉ số điện nước phòng mới */}
        <div className="flex flex-col gap-2.5 border-t border-border pt-3">
          <h4 className="border-l-2 border-indigo-500 pl-2 text-[12.5px] font-bold uppercase tracking-wider text-indigo-400">
            Điện nước ban đầu phòng mới
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11.5px] text-slate-400">
                Số điện xuất phát
              </label>
              <input
                type="number"
                placeholder="0"
                value={newRoomStartElectricity}
                onChange={(e) => setNewRoomStartElectricity(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-[13px] text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11.5px] text-slate-400">
                Số nước xuất phát
              </label>
              <input
                type="number"
                placeholder="0"
                value={newRoomStartWater}
                onChange={(e) => setNewRoomStartWater(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-[13px] text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Thanh toán / Tiền phòng phòng cũ */}
        <div className="flex flex-col gap-3 border-t border-border pt-3">
          <h4 className="border-l-2 border-indigo-500 pl-2 text-[12.5px] font-bold uppercase tracking-wider text-indigo-400">
            Hóa đơn thanh toán phòng cũ
          </h4>

          {/* Toggle tính tiền lẻ */}
          {daysStayed > 0 && daysStayed < 30 && (
            <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-indigo-950/20 p-2 border border-indigo-950/40 text-[12px] text-slate-300">
              <input
                type="checkbox"
                checked={isProrated}
                onChange={(e) => handleProrateToggle(e.target.checked)}
                className="accent-indigo-600"
              />
              <div>
                Tính tiền phòng lẻ theo ngày: <strong>{daysStayed} ngày</strong>
                <div className="text-[11px] text-slate-500">
                  Gợi ý: {formatCurrency(suggestedRent)} (Full: {formatCurrency(room.price)})
                </div>
              </div>
            </label>
          )}

          <div>
            <label className="mb-1 block text-[11.5px] text-slate-400">
              Tiền phòng chốt thu tháng này (đ)
            </label>
            <input
              type="text"
              placeholder="0"
              value={rentAmount}
              onChange={(e) => setRentAmount(formatNumberString(e.target.value))}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-[13px] text-slate-100 focus:border-indigo-500 focus:outline-none font-bold text-indigo-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="mb-1 block text-[11.5px] text-slate-400">
                Chi phí phát sinh phòng cũ (nếu có, đ)
              </label>
              <input
                type="text"
                placeholder="Ví dụ: 100.000"
                value={extraAmount}
                onChange={(e) => setExtraAmount(formatNumberString(e.target.value))}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-[13px] text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-[11.5px] text-slate-400">
                Lý do phát sinh
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Phí vệ sinh phòng, đền bù mất chìa khoá..."
                value={extraDescription}
                onChange={(e) => setExtraDescription(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-[13px] text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-4 flex gap-2.5 border-t border-border pt-4">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="active-scale flex-1 rounded-xl border border-border py-2.5 text-[13px] text-slate-400 transition-colors hover:bg-slate-800/40 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading || vacantRooms.length === 0}
            className="active-scale flex-[2] rounded-xl bg-indigo-600 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-500"
          >
            {loading ? "Đang xử lý..." : "Xác nhận chuyển"}
          </button>
        </div>
      </form>
    </div>
  );
};
