import React, { useRef } from "react";
import html2canvas from "html2canvas";
import { Download } from "lucide-react";
import { Bill } from "../services/bill.service";

interface BillImageCardProps {
  bill: Bill;
  roomName: string;
  renterName: string | null;
  formatCurrency: (val: number) => string;
}

export const BillImageCard: React.FC<BillImageCardProps> = ({
  bill,
  roomName,
  renterName,
  formatCurrency,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownloadImage = async () => {
    if (!printRef.current) return;
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#0f172a",
      } as unknown as { scale: number; useCORS: boolean; backgroundColor: string });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `HoaDon_${roomName.replace(/\s+/g, "")}_Thang${bill.month}_${bill.year}.png`;
      link.click();
    } catch (error) {
      console.error("Lỗi khi xuất ảnh hóa đơn:", error);
    }
  };

  const electricityUsed = bill.newElectricity - bill.oldElectricity;
  const waterUsed = bill.newWater - bill.oldWater;

  return (
    <>
      <button
        onClick={handleDownloadImage}
        className="active-scale border-border hover:bg-surface-hover flex w-auto items-center gap-1 rounded-lg border bg-[#1e2d4a]/50 px-3.5 py-1.5 text-[12px] font-bold text-indigo-400 transition-all"
      >
        <Download size={12} /> Tải ảnh
      </button>

      <div className="fixed left-0 top-[-9999px] z-[-9999]">
        <div
          ref={printRef}
          className="w-[400px] rounded-2xl border border-slate-800 bg-slate-900 p-6 font-sans text-slate-100"
        >
          <div className="mb-4 border-b border-dashed border-slate-700 pb-4 text-center">
            <h2 className="text-[20px] font-extrabold uppercase tracking-wide text-indigo-400">
              Biên Lai Thanh Toán
            </h2>
            <p className="mt-1 text-[12px] text-slate-400">
              Tháng {bill.month} / Năm {bill.year}
            </p>
          </div>

          <div className="mb-4 flex justify-between text-[13.5px] text-slate-300">
            <div>
              <span>Phòng: </span>
              <strong className="text-slate-100">{roomName}</strong>
            </div>
            <div>
              <span>Khách: </span>
              <strong className="text-slate-100">{renterName || "Chưa cập nhật"}</strong>
            </div>
          </div>

          <div className="mb-4 flex flex-col gap-2.5 border-b border-dashed border-slate-700 pb-4 text-[13px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">1. Tiền thuê phòng cơ bản:</span>
              <span className="font-semibold text-slate-200">{formatCurrency(bill.rentAmount)}</span>
            </div>

            <div className="flex flex-col gap-1 rounded-lg border border-slate-800/80 bg-slate-950/40 p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">2. Tiền điện:</span>
                <span className="font-semibold text-slate-200">{formatCurrency(bill.electricityAmount)}</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Chỉ số: {bill.oldElectricity} ➔ {bill.newElectricity} ({electricityUsed} kWh)
              </div>
            </div>

            <div className="flex flex-col gap-1 rounded-lg border border-slate-800/80 bg-slate-950/40 p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">3. Tiền nước:</span>
                <span className="font-semibold text-slate-200">{formatCurrency(bill.waterAmount)}</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Chỉ số: {bill.oldWater} ➔ {bill.newWater} ({waterUsed} m³)
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">4. Cước Internet cố định:</span>
              <span className="font-semibold text-slate-200">{formatCurrency(bill.internetAmount)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">5. Phí vệ sinh & rác thải:</span>
              <span className="font-semibold text-slate-200">{formatCurrency(bill.trashAmount)}</span>
            </div>

            {Number(bill.extraAmount) > 0 && (
              <div className="flex items-center justify-between text-amber-400">
                <span>6. Phát sinh ({bill.extraDescription || "Sửa chữa"}):</span>
                <span className="font-bold">+{formatCurrency(Number(bill.extraAmount))}</span>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-indigo-900/60 bg-indigo-950/40 p-3.5 text-center">
            <span className="mb-1 block text-[12px] font-semibold uppercase tracking-wider text-indigo-300">
              Tổng tiền cần thanh toán
            </span>
            <span className="text-[22px] font-black text-indigo-400">
              {formatCurrency(bill.totalAmount)}
            </span>
          </div>

          <div className="mt-4 text-center text-[10.5px] italic text-slate-500">
            Cảm ơn bạn đã hợp tác thanh toán đúng hạn!
          </div>
        </div>
      </div>
    </>
  );
};

