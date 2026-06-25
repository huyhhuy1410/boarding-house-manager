import { z } from "zod";
import { RoomStatus } from "@prisma/client";

// Khai báo các giá trị enum hợp lệ của RoomStatus để Zod đối chiếu
const roomStatusEnum = z.enum(RoomStatus);

export const createRoomSchema = z.object({
  body: z.object({
    name: z
      .string({
        message: "Tên phòng trọ là bắt buộc!",
      })
      .min(2, "Tên phòng phải có ít nhất 2 ký tự!")
      .max(50, "Tên phòng không được dài quá 50 ký tự!"),

    boardingHouseId: z.string({
      message: "ID dãy trọ là bắt buộc!",
    }),

    price: z
      .number({
        message: "Giá thuê phòng là bắt buộc!",
      })
      .positive("Giá phòng phải là một số dương!"),
    status: roomStatusEnum.optional(),
    renterName: z.string().nullable().optional(),
    renterPhone: z.string().nullable().optional(),
    renterDeposit: z.number().nullable().optional(),
    electricityDeposit: z.number().nonnegative("Cọc điện không được âm!").optional(),
    isElectricityIncluded: z.boolean().optional(),
    rentStartDate: z.string().nullable().optional(), // Nhận chuỗi ngày tháng ISO từ FE gửi lên
    rentStartElectricity: z.number().nonnegative("Chỉ số điện đầu vào không được âm!").optional(),
    rentStartWater: z.number().nonnegative("Chỉ số nước đầu vào không được âm!").optional(),
    electricityPrice: z
      .number()
      .positive("Giá điện phải là số dương!")
      .optional(),
    waterPrice: z.number().positive("Giá nước phải là số dương!").optional(),
    internetPrice: z
      .number()
      .nonnegative("Giá internet không được là số âm!")
      .optional(),
    trashPrice: z
      .number()
      .nonnegative("Giá rác không được là số âm!")
      .optional(),
  }),
});

// Sử dụng partial() để tự động biến tất cả các trường trên thành optional khi update
export const updateRoomSchema = z.object({
  body: createRoomSchema.shape.body.partial(),
});
