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

      <div className="flex justify-between items-center mt-1">
        <span className="text-[13px] text-slate-400">Danh sách phòng trọ</span>
        <button
          className="w-auto px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-bold flex items-center gap-1 active-scale"
          onClick={onAddRoomClick}
        >
          <Plus size={14} /> Thêm phòng
        </button>
      </div>

      <div className="room-grid grid grid-cols-2 gap-3">
        {filteredRooms.length === 0 ? (
          <div className="col-span-2 text-center text-slate-400 py-10 px-4 text-[13px]">
            Chưa có phòng trọ nào. Hãy bấm "Thêm phòng" để bắt đầu!
          </div>
        ) : (
          filteredRooms.map((room) => {
            const isNewRenter = room.status === "OCCUPIED" && (() => {
              if (!room.rentStartDate) return false;
              const d = new Date(room.rentStartDate);
              return d.getUTCMonth() + 1 === selectedMonth && d.getUTCFullYear() === selectedYear;
            })();

            return (
              <div
                key={room.id}
                className="room-card bg-surface border border-border rounded-2xl p-4 flex flex-col gap-3 active-scale cursor-pointer"
                onClick={() => onRoomClick(room)}
              >
                <div className="flex justify-between items-center">
                  <span className="room-name text-[16px] font-bold text-slate-100">{room.name}</span>
                  <span
                    className={`room-badge text-[9.5px] font-bold px-2 py-0.5 rounded-md uppercase border ${
                      room.status === "OCCUPIED"
                        ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/60"
                        : room.status === "VACANT"
                          ? "bg-slate-800/60 text-slate-300 border-slate-700/60"
                          : "bg-red-950/40 text-red-400 border-red-900/60"
                    }`}
                  >
                    {room.status === "OCCUPIED"
                      ? "Đang thuê"
                      : room.status === "VACANT"
                        ? "Trống"
                        : "Bảo trì"}
                  </span>
                </div>

                <div className="room-renter text-[13px] text-slate-300 min-h-[50px] flex flex-col justify-center gap-1">
                  {room.status === "OCCUPIED" ? (
                    <>
                      <div className="font-semibold text-slate-100 flex flex-wrap items-center gap-1">
                        {room.renterName}
                        {isNewRenter && (
                          <span className="text-[8.5px] px-1.5 py-0.5 rounded bg-indigo-950/50 text-indigo-400 border border-indigo-900/60 font-bold">
                            Mới
                          </span>
                        )}
                      </div>
                      <div className="text-[11.5px] text-slate-400">
                        Giá: {formatCurrency(room.price)}/tháng
                      </div>
                      <div className="text-[11px] text-slate-400 leading-tight">
                        Cọc: {formatCurrency((room.renterDeposit || 0) + room.electricityDeposit)}
                        {room.electricityDeposit > 0 && (
                          <span className="block text-[10px] text-slate-500 mt-0.5">
                            (Điện gối: {formatCurrency(room.electricityDeposit)})
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <span className="text-slate-400 italic">Chưa có khách thuê</span>
                  )}
                </div>

                <div className="border-t border-border border-dashed pt-2.5 flex justify-between items-center text-[11px] text-slate-400">
                  <span>Tháng này:</span>
                  {room.status === "OCCUPIED" ? (
                    room.isPaidThisMonth ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-emerald-400" /> Đã đóng
                      </span>
                    ) : (
                      <span className="text-red-400 font-semibold flex items-center gap-1">
                        <AlertCircle size={12} className="text-red-400" /> Chưa đóng
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
