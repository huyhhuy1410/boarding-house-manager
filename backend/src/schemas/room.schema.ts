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
    renterCccdNumber: z.string().nullable().optional(),
    renterCccdDate: z.string().nullable().optional(),
    renterCccdPlace: z.string().nullable().optional(),
    renterAddress: z.string().nullable().optional(),
    renterDob: z.string().nullable().optional(),
    renterMemberCount: z.number().int().nonnegative().nullable().optional(),
    renterVehiclePlates: z.string().nullable().optional(),
    renterDeposit: z.number().nullable().optional(),
    electricityDeposit: z.number().nonnegative("Cọc điện không được âm!").optional(),
    isElectricityIncluded: z.boolean().optional(),
    rentStartDate: z.string().nullable().optional(), // Nhận chuỗi ngày tháng ISO từ FE gửi lên
    rentStartElectricity: z.number().nonnegative("Chỉ số điện đầu vào không được âm!").optional(),
    rentStartWater: z.number().nonnegative("Chỉ số nước đầu vào không được âm!").optional(),
    electricityPrice: z
      .number()
      .nonnegative("Giá điện không được là số âm!")
      .optional(),
    waterPrice: z.number().nonnegative("Giá nước không được là số âm!").optional(),
    internetPrice: z
      .number()
      .nonnegative("Giá internet không được là số âm!")
      .optional(),
    trashPrice: z
      .number()
      .nonnegative("Giá rác không được là số âm!")
      .optional(),
    billingDay: z
      .number()
      .min(1, "Ngày chốt hóa đơn phải từ 1 đến 31!")
      .max(31, "Ngày chốt hóa đơn phải từ 1 đến 31!")
      .optional(),
  }),
});

// Sử dụng partial() để tự động biến tất cả các trường trên thành optional khi update
export const updateRoomSchema = z.object({
  body: createRoomSchema.shape.body.partial(),
});

export const relocateRoomSchema = z.object({
  body: z.object({
    oldRoomId: z.string({ message: "ID phòng cũ là bắt buộc!" }),
    newRoomId: z.string({ message: "ID phòng mới là bắt buộc!" }),
    lastElectricity: z.number({ message: "Số điện cuối cùng của phòng cũ là bắt buộc!" }).nonnegative("Số điện không được âm!"),
    lastWater: z.number({ message: "Số nước cuối cùng của phòng cũ là bắt buộc!" }).nonnegative("Số nước không được âm!"),
    newRoomStartElectricity: z.number({ message: "Số điện bắt đầu của phòng mới là bắt buộc!" }).nonnegative("Số điện không được âm!"),
    newRoomStartWater: z.number({ message: "Số nước bắt đầu của phòng mới là bắt buộc!" }).nonnegative("Số nước không được âm!"),
    rentAmount: z.number().nonnegative().optional(),
    internetAmount: z.number().nonnegative().optional(),
    trashAmount: z.number().nonnegative().optional(),
    extraAmount: z.number().optional(),
    extraDescription: z.string().nullable().optional(),
  }),
});

