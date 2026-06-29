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
  loading?: boolean;
  onManageBHClick: () => void;
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
  loading = false,
  onManageBHClick,
}) => {
  const filteredRooms = rooms.filter((room) => {
    if (roomFilter === "ALL") return true;
    return room.boardingHouseId === roomFilter;
  });

  return (
    <>
      <button
        onClick={onManageBHClick}
        className="active-scale border-border rounded-lg border bg-slate-800/40 px-3 py-1.5 text-[12px]       
  text-indigo-400"
      >
        ⚙️ Quản lý dãy trọ
      </button>
      {/* Tab filters */}
      <div className="tabs-container border-border bg-surface flex gap-1 overflow-x-auto rounded-xl border p-1">
        <button
          className={`active-scale flex-1 whitespace-nowrap rounded-lg px-3.5 py-2 text-[13px] font-medium transition-all ${
            roomFilter === "ALL"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-400 hover:text-slate-200"
          }`}
          onClick={() => setRoomFilter("ALL")}
        >
          Tất cả
        </button>
        {boardingHouses.map((house) => (
          <button
            key={house.id}
            className={`active-scale flex-1 whitespace-nowrap rounded-lg px-3.5 py-2 text-[13px] font-medium transition-all ${
              roomFilter === house.id
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
            onClick={() => setRoomFilter(house.id)}
          >
            {house.name}
          </button>
        ))}
      </div>

      <div className="mt-1 flex items-center justify-between">
        <span className="text-[13px] text-slate-400">Danh sách phòng trọ</span>
        <button
          className="active-scale flex w-auto items-center gap-1 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-[12px] font-bold text-white hover:bg-indigo-700"
          onClick={onAddRoomClick}
        >
          <Plus size={14} /> Thêm phòng
        </button>
      </div>

      <div className="room-grid grid grid-cols-2 gap-3">
        {loading && rooms.length === 0 ? (
          // Hiển thị 4 Card Skeleton khi đang tải dữ liệu lần đầu
          Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="border-border/50 bg-surface/50 flex min-h-[150px] animate-pulse flex-col gap-3 rounded-2xl border p-4"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-16 rounded-md bg-slate-800"></div>
                <div className="h-4 w-12 rounded-md bg-slate-800"></div>
              </div>
              <div className="flex min-h-[50px] flex-col justify-center gap-1.5">
                <div className="h-4 w-28 rounded-md bg-slate-800"></div>
                <div className="h-3.5 w-20 rounded-md bg-slate-800"></div>
              </div>
              <div className="border-border/50 flex items-center justify-between border-t border-dashed pt-2.5">
                <div className="h-3 w-14 rounded-md bg-slate-800"></div>
                <div className="h-3 w-10 rounded-md bg-slate-800"></div>
              </div>
            </div>
          ))
        ) : filteredRooms.length === 0 ? (
          <div className="col-span-2 px-4 py-10 text-center text-[13px] text-slate-400">
            Chưa có phòng trọ nào. Hãy bấm "Thêm phòng" để bắt đầu!
          </div>
        ) : (
          filteredRooms.map((room) => {
            const isNewRenter =
              room.status === "OCCUPIED" &&
              (() => {
                if (!room.rentStartDate) return false;
                const d = new Date(room.rentStartDate);
                return (
                  d.getUTCMonth() + 1 === selectedMonth &&
                  d.getUTCFullYear() === selectedYear
                );
              })();

            return (
              <div
                key={room.id}
                className="room-card active-scale border-border bg-surface flex cursor-pointer flex-col gap-3 rounded-2xl border p-4"
                onClick={() => onRoomClick(room)}
              >
                <div className="flex items-center justify-between">
                  <span className="room-name text-[16px] font-bold text-slate-100">
                    {room.name}
                  </span>
                  <span
                    className={`room-badge rounded-md border px-2 py-0.5 text-[9.5px] font-bold uppercase ${
                      room.status === "OCCUPIED"
                        ? "border-emerald-900/60 bg-emerald-950/40 text-emerald-400"
                        : room.status === "VACANT"
                          ? "border-slate-700/60 bg-slate-800/60 text-slate-300"
                          : "border-red-900/60 bg-red-950/40 text-red-400"
                    }`}
                  >
                    {room.status === "OCCUPIED"
                      ? "Đang thuê"
                      : room.status === "VACANT"
                        ? "Trống"
                        : "Bảo trì"}
                  </span>
                </div>

                <div className="room-renter flex min-h-[50px] flex-col justify-center gap-1 text-[13px] text-slate-300">
                  {room.status === "OCCUPIED" ? (
                    <>
                      <div className="flex flex-wrap items-center gap-1 font-semibold text-slate-100">
                        {room.renterName}
                        {isNewRenter && (
                          <span className="rounded border border-indigo-900/60 bg-indigo-950/50 px-1.5 py-0.5 text-[8.5px] font-bold text-indigo-400">
                            Mới
                          </span>
                        )}
                      </div>
                      <div className="text-[11.5px] text-slate-400">
                        Giá: {formatCurrency(room.price)}/tháng
                      </div>
                      <div className="text-[11px] leading-tight text-slate-400">
                        Cọc:{" "}
                        {formatCurrency(
                          (room.renterDeposit || 0) + room.electricityDeposit,
                        )}
                        {room.electricityDeposit > 0 && (
                          <span className="mt-0.5 block text-[10px] text-slate-500">
                            (Điện gối: {formatCurrency(room.electricityDeposit)}
                            )
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <span className="italic text-slate-400">
                      Chưa có khách thuê
                    </span>
                  )}
                </div>

                <div className="border-border flex items-center justify-between border-t border-dashed pt-2.5 text-[11px] text-slate-400">
                  <span>Tháng này:</span>
                  {room.status === "OCCUPIED" ? (
                    room.isPaidThisMonth ? (
                      <span className="flex items-center gap-1 font-semibold text-emerald-400">
                        <CheckCircle2 size={12} className="text-emerald-400" />{" "}
                        Đã đóng
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 font-semibold text-red-400">
                        <AlertCircle size={12} className="text-red-400" /> Chưa
                        đóng
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
