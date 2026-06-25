import { PrismaClient, RoomStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Đang xóa dữ liệu cũ...");
  await prisma.bill.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.boardingHouse.deleteMany({});

  console.log("Đang tạo các Dãy trọ (Boarding Houses)...");
  
  const house9Do = await prisma.boardingHouse.create({
    data: { name: "Hẻm 9 Đơ" },
  });

  const house3Troi = await prisma.boardingHouse.create({
    data: { name: "3 Trời" },
  });

  const houseKiot = await prisma.boardingHouse.create({
    data: { name: "Dãy Kiot" },
  });

  console.log("Đang tạo dữ liệu phòng trọ mẫu...");

  // 1. Dãy Hẻm 9 Đơ
  // Phòng A1: Khách mới vào tháng 6/2026, có cọc điện gối đầu
  await prisma.room.create({
    data: {
      name: "Phòng A1",
      boardingHouseId: house9Do.id,
      status: RoomStatus.OCCUPIED,
      price: 2500000,
      electricityPrice: 3500,
      waterPrice: 15000,
      internetPrice: 100000,
      trashPrice: 20000,
      renterName: "Nguyễn Văn An",
      renterPhone: "0901234567",
      renterDeposit: 2500000,
      electricityDeposit: 500000, // Tiền cọc điện gối đầu
      rentStartDate: new Date("2026-06-10T00:00:00.000Z"), // Khách mới trong tháng này (Tháng 6/2026)
      rentStartElectricity: 1240, // Số điện đầu vào
      rentStartWater: 180, // Số nước đầu vào
    },
  });

  // Phòng A2: Phòng trống
  await prisma.room.create({
    data: {
      name: "Phòng A2",
      boardingHouseId: house9Do.id,
      status: RoomStatus.VACANT,
      price: 2500000,
      electricityPrice: 3500,
      waterPrice: 15000,
      internetPrice: 100000,
      trashPrice: 20000,
    },
  });

  // Phòng A3: Khách cũ từ tháng 2/2026
  await prisma.room.create({
    data: {
      name: "Phòng A3",
      boardingHouseId: house9Do.id,
      status: RoomStatus.OCCUPIED,
      price: 2500000,
      electricityPrice: 3500,
      waterPrice: 15000,
      internetPrice: 100000,
      trashPrice: 20000,
      renterName: "Trần Văn Bình",
      renterPhone: "0907654321",
      renterDeposit: 2500000,
      electricityDeposit: 500000,
      rentStartDate: new Date("2026-02-15T00:00:00.000Z"), // Khách cũ từ lâu
    },
  });

  // 2. Dãy 3 Trời
  // Phòng B1: Khách mới vào tháng 6/2026, tính điện bình thường
  await prisma.room.create({
    data: {
      name: "Phòng B1",
      boardingHouseId: house3Troi.id,
      status: RoomStatus.OCCUPIED,
      price: 2000000,
      electricityPrice: 3500,
      waterPrice: 15000,
      internetPrice: 100000,
      trashPrice: 20000,
      renterName: "Lê Thị Thu",
      renterPhone: "0911223344",
      renterDeposit: 2000000,
      isElectricityIncluded: false, // Tính điện bình thường
      rentStartDate: new Date("2026-06-15T00:00:00.000Z"), // Khách mới trong tháng này (Tháng 6/2026)
      rentStartElectricity: 500,
      rentStartWater: 50,
    },
  });

  // Phòng B2: Khách cũ, ĐẶC BIỆT: BAO ĐIỆN (phòng cũ bao điện)
  await prisma.room.create({
    data: {
      name: "Phòng B2",
      boardingHouseId: house3Troi.id,
      status: RoomStatus.OCCUPIED,
      price: 2200000, // Giá phòng có bao điện cao hơn chút
      electricityPrice: 3500,
      waterPrice: 15000,
      internetPrice: 100000,
      trashPrice: 20000,
      renterName: "Phạm Hồng Phát",
      renterPhone: "0988888888",
      renterDeposit: 2200000,
      isElectricityIncluded: true, // Bao điện! Tiền điện sẽ là 0đ
      rentStartDate: new Date("2024-12-01T00:00:00.000Z"), // Khách cũ
    },
  });

  // Phòng B3: Phòng trống, được bao điện sẵn
  await prisma.room.create({
    data: {
      name: "Phòng B3",
      boardingHouseId: house3Troi.id,
      status: RoomStatus.VACANT,
      price: 2200000,
      electricityPrice: 3500,
      waterPrice: 15000,
      internetPrice: 100000,
      trashPrice: 20000,
      isElectricityIncluded: true, // Bao điện!
    },
  });

  // 3. Dãy Kiot thương mại
  await prisma.room.create({
    data: {
      name: "Kiot 01",
      boardingHouseId: houseKiot.id,
      status: RoomStatus.OCCUPIED,
      price: 5000000,
      electricityPrice: 4000,
      waterPrice: 18000,
      internetPrice: 150000,
      trashPrice: 50000,
      renterName: "Trần Hữu Lợi",
      renterPhone: "0933333333",
      renterDeposit: 10000000,
      rentStartDate: new Date("2025-10-01T00:00:00.000Z"),
    },
  });

  await prisma.room.create({
    data: {
      name: "Kiot 02",
      boardingHouseId: houseKiot.id,
      status: RoomStatus.VACANT,
      price: 5000000,
      electricityPrice: 4000,
      waterPrice: 18000,
      internetPrice: 150000,
      trashPrice: 50000,
    },
  });

  console.log("Gieo dữ liệu (Seeding) thành công!");
}

main()
  .catch((e) => {
    console.error("Lỗi khi gieo dữ liệu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
