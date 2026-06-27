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
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        padding: "8px 0",
      }}
    >
      <h3 style={{ fontSize: "1.2rem" }}>Chỉ số điện nước tháng này</h3>
      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
        Nhập nhanh chỉ số điện nước cuối tháng để tạo hóa đơn gửi khách.
      </p>

      {/* Bộ lọc Dãy trọ cho tab Ghi số điện (Billing) */}
      <div className="tabs-container" style={{ marginBottom: "4px" }}>
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

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          marginTop: "10px",
        }}
      >
        {activeRooms.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px 20px" }}>Chưa có phòng nào đang thuê trong dãy trọ này.</div>
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
                    <span
                      style={{
                        fontSize: "0.65rem",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        backgroundColor: new Date().getDate() === room.billingDay ? "var(--warning-glow)" : "transparent",
                        color: new Date().getDate() === room.billingDay ? "var(--warning)" : "var(--text-muted)",
                        fontWeight: new Date().getDate() === room.billingDay ? "bold" : "normal",
                        border: `1px solid ${new Date().getDate() === room.billingDay ? "var(--warning)" : "var(--border-color)"}`,
                      }}
                    >
                      {new Date().getDate() === room.billingDay ? "Đến hạn (Ngày " + room.billingDay + ")" : "Hạn: Ngày " + room.billingDay}
                    </span>
                  </span>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    Khách: {room.renterName}
                  </span>
                </div>

                {bill ? (
                  /* ĐÃ CÓ HÓA ĐƠN TRONG THÁNG NÀY */
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", color: "var(--text-secondary)" }}>
                      <div>Điện: {bill.oldElectricity} kWh ➔ {bill.newElectricity} kWh ({bill.newElectricity - bill.oldElectricity} kWh)</div>
                      <div>Nước: {bill.oldWater} m3 ➔ {bill.newWater} m3 ({bill.newWater - bill.oldWater} m3)</div>
                    </div>

                    <div style={{ padding: "10px", borderRadius: "8px", backgroundColor: "var(--bg-color)", display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Tiền phòng:</span>
                        <span>{formatCurrency(bill.rentAmount)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Tiền điện:</span>
                        <span>{formatCurrency(bill.electricityAmount)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Tiền nước:</span>
                        <span>{formatCurrency(bill.waterAmount)}</span>
                      </div>
                      {(bill.internetAmount > 0 || bill.trashAmount > 0) && (
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Cố định (Internet + Rác):</span>
                          <span>{formatCurrency(Number(bill.internetAmount) + Number(bill.trashAmount))}</span>
                        </div>
                      )}
                      {Number(bill.extraAmount) > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--warning)" }}>
                          <span>Phát sinh ({bill.extraDescription || "Sửa thiết bị"}):</span>
                          <span>+{formatCurrency(bill.extraAmount)}</span>
                        </div>
                      )}
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", borderTop: "1px solid var(--border-color)", paddingTop: "4px", fontSize: "0.95rem", color: "var(--primary-color)" }}>
                        <span>Tổng tiền phòng:</span>
                        <span>{formatCurrency(bill.totalAmount)}</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span>Thanh toán:</span>
                        {bill.isPaid ? (
                          <span style={{ color: "var(--success)", fontWeight: "bold", display: "flex", alignItems: "center", gap: "4px" }}>
                            <CheckCircle2 size={14} /> Đã đóng
                          </span>
                        ) : (
                          <span style={{ color: "var(--danger)", fontWeight: "bold", display: "flex", alignItems: "center", gap: "4px" }}>
                            <AlertCircle size={14} /> Chưa đóng
                          </span>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="btn-secondary"
                          style={{ width: "auto", padding: "6px 10px", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px", backgroundColor: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border-color)", borderRadius: "8px" }}
                          onClick={() => onCopyZalo(bill, room.name, room.renterName)}
                        >
                          <Copy size={12} /> Zalo
                        </button>
                        {!bill.isPaid && (
                          <button
                            className="btn-primary"
                            style={{ width: "auto", padding: "6px 10px", fontSize: "0.75rem", borderRadius: "8px" }}
                            onClick={() => onPayBill(bill.id)}
                          >
                            Đã thu tiền
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* CHƯA CÓ HÓA ĐƠN TRONG THÁNG NÀY: FORM NHẬP */
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div>
                        <label style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Số Điện Mới (Cũ: {oldElectricity})</label>
                        <input
                          type="number"
                          placeholder="Nhập số điện mới..."
                          value={inputs.newElectricity}
                          onChange={(e) => handleInputChange(room.id, "newElectricity", e.target.value)}
                          style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-color)", color: "var(--text-primary)", fontSize: "0.85rem" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Số Nước Mới (Cũ: {oldWater})</label>
                        <input
                          type="number"
                          placeholder="Nhập số nước mới..."
                          value={inputs.newWater}
                          onChange={(e) => handleInputChange(room.id, "newWater", e.target.value)}
                          style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-color)", color: "var(--text-primary)", fontSize: "0.85rem" }}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div>
                        <label style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Chi phí phát sinh riêng (đ)</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={inputs.extraAmount}
                          onChange={(e) => handleInputChange(room.id, "extraAmount", e.target.value)}
                          style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-color)", color: "var(--text-primary)", fontSize: "0.85rem" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Mô tả phát sinh (nếu có)</label>
                        <input
                          type="text"
                          placeholder="Ví dụ: Thay bóng đèn..."
                          value={inputs.extraDescription}
                          onChange={(e) => handleInputChange(room.id, "extraDescription", e.target.value)}
                          style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-color)", color: "var(--text-primary)", fontSize: "0.85rem" }}
                        />
                      </div>
                    </div>

                    <button
                      className="btn-primary"
                      style={{
                        padding: "10px",
                        fontSize: "0.82rem",
                        borderRadius: "8px",
                        marginTop: "8px",
                      }}
                      onClick={() => onCreateBill(room.id, oldElectricity, oldWater)}
                    >
                      Lưu & Tính tiền phòng
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
