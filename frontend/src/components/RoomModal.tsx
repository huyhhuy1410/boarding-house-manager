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
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      backdropFilter: "blur(4px)",
      WebkitBackdropFilter: "blur(4px)",
      zIndex: 2000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
    }}>
      <form onSubmit={handleSubmit} style={{
        backgroundColor: "var(--surface-color)",
        border: "1px solid var(--border-color)",
        borderRadius: "20px",
        width: "100%",
        maxWidth: "420px",
        maxHeight: "90vh",
        overflowY: "auto",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.4)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
            {editingRoom ? `Chỉnh sửa: ${editingRoom.name}` : "Thêm Phòng Trọ Mới"}
          </h3>
          <button type="button" onClick={onClose} style={{ backgroundColor: "transparent", border: "none", color: "var(--text-muted)", fontSize: "1.2rem", cursor: "pointer" }}>×</button>
        </div>

        {/* Thông tin cơ bản */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <h4 style={{ fontSize: "0.8rem", color: "var(--primary-color)", textTransform: "uppercase", fontWeight: "bold", borderLeft: "2px solid var(--primary-color)", paddingLeft: "6px" }}>Thông tin cơ bản</h4>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Tên phòng</label>
              <input type="text" placeholder="Ví dụ: A1" value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-color)", color: "var(--text-primary)", fontSize: "0.85rem" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Thuộc dãy trọ</label>
              <select value={boardingHouseId} onChange={(e) => setBoardingHouseId(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-color)", color: "var(--text-primary)", fontSize: "0.85rem" }}>
                <option value="" disabled>-- Chọn dãy --</option>
                {boardingHouses.map((house) => (
                  <option key={house.id} value={house.id}>{house.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Giá thuê phòng (đ)</label>
              <input type="number" placeholder="Ví dụ: 3000000" value={price} onChange={(e) => setPrice(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-color)", color: "var(--text-primary)", fontSize: "0.85rem" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Ngày chốt (1-31)</label>
              <input type="number" min="1" max="31" placeholder="Mặc định: 30" value={billingDay} onChange={(e) => setBillingDay(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-color)", color: "var(--text-primary)", fontSize: "0.85rem" }} />
            </div>
          </div>
        </div>

        {/* Đơn giá dịch vụ */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <h4 style={{ fontSize: "0.8rem", color: "var(--primary-color)", textTransform: "uppercase", fontWeight: "bold", borderLeft: "2px solid var(--primary-color)", paddingLeft: "6px" }}>Đơn giá dịch vụ</h4>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Đơn giá điện (đ/kWh)</label>
              <input type="number" placeholder="3500" value={electricityPrice} onChange={(e) => setElectricityPrice(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-color)", color: "var(--text-primary)", fontSize: "0.85rem" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Đơn giá nước (đ/m3)</label>
              <input type="number" placeholder="15000" value={waterPrice} onChange={(e) => setWaterPrice(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-color)", color: "var(--text-primary)", fontSize: "0.85rem" }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Internet/phòng (đ)</label>
              <input type="number" placeholder="100000" value={internetPrice} onChange={(e) => setInternetPrice(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-color)", color: "var(--text-primary)", fontSize: "0.85rem" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Rác thải/phòng (đ)</label>
              <input type="number" placeholder="20000" value={trashPrice} onChange={(e) => setTrashPrice(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-color)", color: "var(--text-primary)", fontSize: "0.85rem" }} />
            </div>
          </div>
        </div>

        {/* Trạng thái & Khách thuê */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <h4 style={{ fontSize: "0.8rem", color: "var(--primary-color)", textTransform: "uppercase", fontWeight: "bold", borderLeft: "2px solid var(--primary-color)", paddingLeft: "6px" }}>Trạng thái & Khách thuê</h4>
          
          <div>
            <label style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Trạng thái phòng</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as any)} style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-color)", color: "var(--text-primary)", fontSize: "0.85rem" }}>
              <option value="VACANT">Phòng trống</option>
              <option value="OCCUPIED">Đang thuê</option>
              <option value="MAINTENANCE">Bảo trì</option>
            </select>
          </div>

          {status === "OCCUPIED" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "12px", borderRadius: "10px", backgroundColor: "var(--bg-color)", border: "1px dashed var(--border-color)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Tên khách thuê</label>
                  <input type="text" placeholder="Nguyễn Văn A" value={renterName} onChange={(e) => setRenterName(e.target.value)} style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid var(--border-color)", backgroundColor: "var(--surface-color)", color: "var(--text-primary)", fontSize: "0.8rem" }} />
                </div>
                <div>
                  <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Số điện thoại</label>
                  <input type="text" placeholder="090..." value={renterPhone} onChange={(e) => setRenterPhone(e.target.value)} style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid var(--border-color)", backgroundColor: "var(--surface-color)", color: "var(--text-primary)", fontSize: "0.8rem" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Cọc phòng (đ)</label>
                  <input type="number" value={renterDeposit} onChange={(e) => setRenterDeposit(e.target.value)} style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid var(--border-color)", backgroundColor: "var(--surface-color)", color: "var(--text-primary)", fontSize: "0.8rem" }} />
                </div>
                <div>
                  <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Cọc điện gối (đ)</label>
                  <input type="number" value={electricityDeposit} onChange={(e) => setElectricityDeposit(e.target.value)} style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid var(--border-color)", backgroundColor: "var(--surface-color)", color: "var(--text-primary)", fontSize: "0.8rem" }} />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "4px 0" }}>
                <input type="checkbox" id="modalIsElecInc" checked={isElectricityIncluded} onChange={(e) => setIsElectricityIncluded(e.target.checked)} />
                <label htmlFor="modalIsElecInc" style={{ fontSize: "0.72rem", color: "var(--text-secondary)", cursor: "pointer" }}>Bao tiền điện (áp dụng cho 3 Trời)</label>
              </div>

              <div>
                <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Ngày bắt đầu thuê</label>
                <input type="date" value={rentStartDate} onChange={(e) => setRentStartDate(e.target.value)} style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid var(--border-color)", backgroundColor: "var(--surface-color)", color: "var(--text-primary)", fontSize: "0.8rem" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Số điện ban đầu</label>
                  <input type="number" value={rentStartElectricity} onChange={(e) => setRentStartElectricity(e.target.value)} style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid var(--border-color)", backgroundColor: "var(--surface-color)", color: "var(--text-primary)", fontSize: "0.8rem" }} />
                </div>
                <div>
                  <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Số nước ban đầu</label>
                  <input type="number" value={rentStartWater} onChange={(e) => setRentStartWater(e.target.value)} style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid var(--border-color)", backgroundColor: "var(--surface-color)", color: "var(--text-primary)", fontSize: "0.8rem" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Buttons điều hướng */}
        <div style={{ display: "flex", gap: "10px", marginTop: "12px", borderTop: "1px solid var(--border-color)", paddingTop: "14px" }}>
          {editingRoom && (
            <button type="button" disabled={loading} onClick={() => onDelete(editingRoom.id)} style={{ padding: "10px", borderRadius: "10px", border: "none", backgroundColor: "var(--danger-glow)", color: "var(--danger)", fontSize: "0.82rem", fontWeight: "bold", cursor: "pointer" }}>Xóa</button>
          )}
          <button type="button" disabled={loading} onClick={onClose} className="btn-secondary" style={{ flex: 1, padding: "10px", fontSize: "0.82rem", backgroundColor: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border-color)", borderRadius: "10px" }}>Hủy</button>
          <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 2, padding: "10px", fontSize: "0.82rem" }}>
            {loading ? "Đang lưu..." : "Lưu lại"}
          </button>
        </div>
      </form>
    </div>
  );
};
