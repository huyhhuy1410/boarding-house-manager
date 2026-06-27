import React from "react";
import { Plus, CheckCircle2, AlertCircle } from "lucide-react";
import { Room } from "../services/room.service";
import { BoardingHouse } from "../services/room.service";

interface RoomsTabProps {
  rooms: Room[];
  boardingHouses: BoardingHouse[];
  roomFilter: string;
  setRoomFilter: (filter: string) => void;
  selectedMonth: number;
  selectedYear: number;
  onAddRoomClick: () => void;
  onRoomClick: (room: Room) => void;
  formatCurrency: (val: number) => string;
}

export const RoomsTab: React.FC<RoomsTabProps> = ({
  rooms,
  boardingHouses,
  roomFilter,
  setRoomFilter,
  selectedMonth,
  selectedYear,
  onAddRoomClick,
  onRoomClick,
  formatCurrency,
}) => {
  const filteredRooms = rooms.filter((room) => {
    if (roomFilter === "ALL") return true;
    return room.boardingHouseId === roomFilter;
  });

  return (
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

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
        <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Danh sách phòng trọ</span>
        <button
          className="btn-primary"
          style={{ width: "auto", padding: "6px 12px", borderRadius: "8px", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px" }}
          onClick={onAddRoomClick}
        >
          <Plus size={14} /> Thêm phòng
        </button>
      </div>

      <div className="room-grid">
        {filteredRooms.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", color: "var(--text-muted)", padding: "40px 20px" }}>Chưa có phòng trọ nào. Hãy bấm "Thêm phòng" để bắt đầu!</div>
        ) : (
          filteredRooms.map((room) => {
            const isNewRenter = room.status === "OCCUPIED" && (() => {
              if (!room.rentStartDate) return false;
              const d = new Date(room.rentStartDate);
              return d.getUTCMonth() + 1 === selectedMonth && d.getUTCFullYear() === selectedYear;
            })();

            return (
              <div key={room.id} className="room-card" onClick={() => onRoomClick(room)} style={{ cursor: "pointer" }}>
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
          })
        )}
      </div>
    </>
  );
};
