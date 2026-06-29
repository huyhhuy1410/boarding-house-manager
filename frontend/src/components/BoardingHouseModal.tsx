import React, { useState, useEffect } from "react";
import { BoardingHouse } from "../services/room.service";
import { useNotification } from "./NotificationProvider";

interface BoardingHouseModalProps {
  show: boolean;
  editingBoardingHouse: BoardingHouse | null;
  boardingHouses: BoardingHouse[];
  onClose: () => void;
  onSave: (
    boardingHousePayload: Omit<BoardingHouse, "id"> & { id?: string },
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  loading: boolean;
}

export const BoardingHouseModal: React.FC<BoardingHouseModalProps> = ({
  show,
  editingBoardingHouse,
  onClose,
  onSave,
  onDelete,
  loading,
}) => {
  const { showToast } = useNotification();
  const [name, setName] = useState<string>("");

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

  useEffect(() => {
    if (editingBoardingHouse) {
      setName(editingBoardingHouse.name);
    } else {
      setName("");
    }
  }, [editingBoardingHouse]);

  if (!show) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Vui lòng nhập đầy đủ tên dãy trọ!", "error");
      return;
    }
    const payload = {
      name: name.trim(),
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/75 p-4 backdrop-blur-[3px]">
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[90vh] w-full max-w-[420px] flex-col gap-4 overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border pb-3.5">
          <h3 className="text-[17px] font-bold text-slate-100">
            {editingBoardingHouse
              ? `Chỉnh sửa: ${editingBoardingHouse.name}`
              : "Thêm dãy trọ"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer border-0 bg-transparent text-xl leading-none text-slate-400 hover:text-slate-200"
          >
            ×
          </button>
        </div>

        {/* Thông tin cơ bản */}
        <div className="mt-1.5 flex flex-col gap-2.5">
          <h4 className="border-l-2 border-indigo-500 pl-2 text-[12.5px] font-bold uppercase tracking-wider text-indigo-400">
            Thông tin cơ bản
          </h4>

          <div>
            <label className="mb-1 block text-[11.5px] text-slate-400">
              Tên dãy trọ
            </label>
            <input
              type="text"
              autoFocus 
              placeholder="Ví dụ: Dãy trọ A1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-[13px] text-slate-100
  transition-colors focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Buttons điều hướng */}
        <div className="mt-5 flex gap-2.5 border-t border-border pt-4">
          {editingBoardingHouse && (
            <button
              type="button"
              disabled={loading}
              onClick={() => onDelete(editingBoardingHouse.id)}
              className="active-scale whitespace-nowrap rounded-xl border border-red-900/60 bg-red-950/40 px-3.5 py-2.5 text-[13px] font-bold text-red-400 transition-colors hover:bg-red-900/60"
            >
              {loading ? "Đang xóa..." : "Xóa"}
            </button>
          )}
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="active-scale flex-1 rounded-xl border border-border py-2.5 text-[13px] text-slate-400 transition-colors hover:bg-slate-800/40"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="active-scale flex-[2] rounded-xl bg-indigo-600 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-indigo-700"
          >
            {loading ? "Đang lưu..." : "Lưu lại"}
          </button>
        </div>
      </form>
    </div>
  );
};
