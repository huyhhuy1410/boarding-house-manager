import { z } from "zod";

export const createBillSchema = z.object({
  body: z.object({
    roomId: z.string({
      message: "ID phòng trọ là bắt buộc!",
    }),
    month: z
      .number({
        message: "Tháng lập hóa đơn là bắt buộc!",
      })
      .min(1, "Tháng phải từ 1 đến 12!")
      .max(12, "Tháng phải từ 1 đến 12!"),
    year: z
      .number({
        message: "Năm lập hóa đơn là bắt buộc!",
      })
      .int()
      .positive("Năm phải là số dương!"),
    oldElectricity: z
      .number({
        message: "Số điện cũ là bắt buộc!",
      })
      .nonnegative("Số điện cũ không được âm!"),
    newElectricity: z
      .number({
        message: "Số điện mới là bắt buộc!",
      })
      .nonnegative("Số điện mới không được âm!"),
    oldWater: z
      .number({
        message: "Số nước cũ là bắt buộc!",
      })
      .nonnegative("Số nước cũ không được âm!"),
    newWater: z
      .number({
        message: "Số nước mới là bắt buộc!",
      })
      .nonnegative("Số nước mới không được âm!"),
    extraAmount: z
      .number()
      .nonnegative("Chi phí phát sinh không được âm!")
      .optional(),
    extraDescription: z.string().optional(),
  }),
});
