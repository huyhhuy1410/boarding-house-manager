import prisma from "../config/prisma";
import { BillService } from "./bill.service";
import axios from "axios";

/**
 * Service to handle Telegram bot integration, command routing, utility logging, and bill generation.
 */
export class TelegramService {
  private billService = new BillService();

  // Temporary storage to cache incomplete utility readings before generating a bill.
  // Maps roomId -> { electricity, water, updatedAt }
  private tempReadings = new Map<
    string,
    { electricity?: number; water?: number; updatedAt: number }
  >();

  /**
   * Sends an HTML-formatted message to a Telegram chat.
   * @param chatId The recipient's chat ID.
   * @param text The HTML message content.
   * @returns Response data from the Telegram API.
   */
  async sendMessage(chatId: string | number, text: string): Promise<any> {
    const API_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    try {
      const response = await axios.post(
        API_URL,
        {
          chat_id: chatId,
          text: text,
          parse_mode: "HTML",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error sending message to Telegram:", error);
      throw error;
    }
  }

  /**
   * Finds a room by name using a loose search (case-insensitive, optional "phòng" prefix).
   * Includes the latest bill for reading comparisons.
   * @param inputName The raw room name search input.
   * @returns The found room with its latest bill and boarding house info.
   */
  private async findRoomByName(inputName: string) {
    const searchName = inputName.trim().toLowerCase();
    try {
      const rooms = await prisma.room.findMany({
        include: {
          boardingHouse: true,
          bills: {
            orderBy: [{ year: "desc" }, { month: "desc" }],
            take: 1, // Retrieve only the most recent bill
          },
        },
      });

      const room = rooms.find((room) => {
        const rName = room.name.toLowerCase();
        return (
          rName === searchName ||
          rName === `phòng ${searchName}` ||
          rName.replace("phòng", "").trim() === searchName
        );
      });

      if (!room) {
        throw new Error(`Room not found: ${inputName}`);
      }
      return room;
    } catch (error) {
      console.error("Error finding room by name:", error);
      throw error;
    }
  }

  /**
   * Routes incoming messages/commands from the Telegram webhook.
   * @param chatId The source Telegram chat ID.
   * @param text The received message text.
   */
  async handleWebhookMessage(
    chatId: string | number,
    text: string,
  ): Promise<void> {
    const command = text.trim();

    // Command: /start or /help - Sends guide instructions
    if (command.startsWith("/start") || command.startsWith("/help")) {
      await this.sendHelpMessage(chatId);
      return;
    }

    // Command: /status - Displays current month's billing status
    if (command.startsWith("/status")) {
      await this.sendStatusMessage(chatId);
      return;
    }

    // Command: /dien [room] [value] - Logs electricity reading
    const electricityMatch = command.match(
      /^\/(?:dien|d|electricity|e)\s+(\S+)\s+(\d+)$/i,
    );
    if (electricityMatch) {
      const [_, roomInput, readingStr] = electricityMatch;
      const reading = Number(readingStr);
      await this.handleLogUtility(chatId, roomInput, "electricity", reading);
      return;
    }

    // Command: /nuoc [room] [value] - Logs water reading
    const waterMatch = command.match(/^\/(?:nuoc|n|water|w)\s+(\S+)\s+(\d+)$/i);
    if (waterMatch) {
      const [_, roomInput, readingStr] = waterMatch;
      const reading = Number(readingStr);
      await this.handleLogUtility(chatId, roomInput, "water", reading);
      return;
    }

    // Command: /bill [room] [elec] [water] - Forces manual bill generation
    const billMatch = command.match(/^\/(?:bill|b)\s+(\S+)\s+(\d+)\s+(\d+)$/i);
    if (billMatch) {
      const [_, roomInput, elecStr, waterStr] = billMatch;
      const electricityReading = Number(elecStr);
      const waterReading = Number(waterStr);
      await this.handleBill(
        chatId,
        roomInput,
        electricityReading,
        waterReading,
      );
      return;
    }

    // Command: /chi [room] [amount] [desc] - Logs expense or maintenance fee
    const extraMatch = command.match(
      /^\/(?:chi|c|extra|e)\s+(\S+)\s+(\d+)\s+(.+)$/i,
    );
    if (extraMatch) {
      const [_, roomInput, amountStr, description] = extraMatch;
      const amount = Number(amountStr);
      await this.handleLogExtra(chatId, roomInput, amount, description);
      return;
    }
  }

  /**
   * Sends the help/guide message containing supported commands.
   * @param chatId Target Telegram chat ID.
   */
  private async sendHelpMessage(chatId: string | number): Promise<void> {
    const helpMessage = `
    🤖 <b>BOT QUẢN LÝ PHÒNG TRỌ</b>

    Các lệnh được hỗ trợ:
    - 📊 <b>/status</b> - Xem danh sách trạng thái hóa đơn.
    - ⚡ <b>/dien [tên_phòng] [chỉ_số]</b> - Ghi số điện.
    - 💧 <b>/nuoc [tên_phòng] [chỉ_số]</b> - Ghi số nước.
    - 📝 <b>/bill [tên_phòng] [điện] [nước]</b> - Tạo hóa đơn mới.
    - 🛠️ <b>/chi [tên_phòng/chung] [tiền] [lý_do]</b> - Ghi chi phí sửa chữa/phát sinh.
    `;
    await this.sendMessage(chatId, helpMessage);
  }

  /**
   * Fetches and reports the payment and billing status of all occupied rooms.
   * @param chatId Target Telegram chat ID.
   */
  private async sendStatusMessage(chatId: string | number): Promise<void> {
    // Get all occupied rooms to check bills
    const rooms = await prisma.room.findMany({
      where: { status: "OCCUPIED" },
    });
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Retrieve bills for the current month and year
    const bills = await prisma.bill.findMany({
      where: {
        month: currentMonth,
        year: currentYear,
        roomId: {
          in: rooms.map((room) => room.id),
        },
      },
    });

    const reportMessages: string[] = [];

    for (const room of rooms) {
      const bill = bills.find((bill) => bill.roomId === room.id);
      const name = room.name;

      let statusIcon = "";
      let statusText = "";

      if (!bill) {
        statusIcon = "⚠️";
        statusText = "Chưa ghi số";
      } else {
        if (bill.isPaid) {
          statusIcon = "✅";
          statusText = "Đã thanh toán";
        } else {
          statusIcon = "📝";
          statusText = "Chưa thanh toán";
        }
      }

      reportMessages.push(`${statusIcon} ${name}: ${statusText}`);
    }

    await this.sendMessage(chatId, reportMessages.join("\n"));
  }

  /**
   * Logs a single utility reading. Caches it until both readings are complete,
   * then auto-triggers bill generation.
   * @param chatId Telegram chat ID.
   * @param roomInput User input for the room name.
   * @param utility The type of utility ("electricity" | "water").
   * @param reading The new reading value.
   */
  private async handleLogUtility(
    chatId: string | number,
    roomInput: string,
    utility: "electricity" | "water",
    reading: number,
  ): Promise<void> {
    try {
      const room = await this.findRoomByName(roomInput);
      if (!room) {
        await this.sendMessage(chatId, `Không tìm thấy phòng ${roomInput}`);
        return;
      }
      if (room.status !== "OCCUPIED") {
        await this.sendMessage(
          chatId,
          "Phòng này chưa có người ở. Không thể ghi chỉ số điện/nước",
        );
        return;
      }

      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      // Check if a bill has already been generated for this month
      const bill = await prisma.bill.findUnique({
        where: {
          roomId_month_year: {
            roomId: room.id,
            month: currentMonth,
            year: currentYear,
          },
        },
      });

      if (bill) {
        await this.sendMessage(
          chatId,
          `Phòng ${room.name} đã có hóa đơn tháng ${currentMonth}/${currentYear} rồi`,
        );
        return;
      }

      // Determine previous reference reading based on rent start date or last bill
      const rentStartDate = room.rentStartDate;
      let oldReading = 0;

      if (rentStartDate) {
        const rentStartMonth = rentStartDate.getMonth() + 1;
        const rentStartYear = rentStartDate.getFullYear();

        if (rentStartMonth === currentMonth && rentStartYear === currentYear) {
          // If first month of rent, use starting values from room schema
          oldReading =
            utility === "electricity"
              ? room.rentStartElectricity || 0
              : room.rentStartWater || 0;
        } else {
          // Use previous bill's final readings
          const lastBill = room.bills[0];
          oldReading =
            utility === "electricity"
              ? lastBill?.newElectricity || 0
              : lastBill?.newWater || 0;
        }
      }

      // Validation: Prevent new readings from being lower than previous ones
      if (reading < oldReading) {
        await this.sendMessage(
          chatId,
          `Số mới (${reading}) không được nhỏ hơn số cũ (${oldReading})!`,
        );
        return;
      }

      // Get existing cached reading or initialize
      let cache = this.tempReadings.get(room.id);
      if (!cache) {
        cache = {
          updatedAt: new Date().getTime(),
        };
      }

      if (utility === "electricity") {
        cache.electricity = reading;
      } else {
        cache.water = reading;
      }

      cache.updatedAt = new Date().getTime();
      this.tempReadings.set(room.id, cache);

      // If both utility readings are now present, create the bill
      if (cache.electricity !== undefined && cache.water !== undefined) {
        await this.createBillWithLogging(
          chatId,
          room.id,
          room.name,
          currentMonth,
          currentYear,
          cache.electricity,
          cache.water,
        );
        // Clear reading cache on success
        this.tempReadings.delete(room.id);
      } else {
        const remaining = utility === "electricity" ? "nước" : "điện";
        await this.sendMessage(
          chatId,
          `Đã ghi nhận số ${utility === "electricity" ? "điện" : "nước"} (${reading}). Vui lòng nhập số ${remaining} để hoàn tất`,
        );
      }
    } catch (error) {
      console.error("Error in handleLogUtility:", error);
      await this.sendMessage(chatId, `Lỗi khi ghi chỉ số điện/nước`);
    }
  }

  /**
   * Generates a monthly bill, calculates details, creates database entries, and replies with a receipt.
   * @param chatId Telegram chat ID.
   * @param roomId The room database ID.
   * @param roomName The room display name.
   * @param month Billing month.
   * @param year Billing year.
   * @param newElectricity The new electricity reading.
   * @param newWater The new water reading.
   */
  private async createBillWithLogging(
    chatId: string | number,
    roomId: string,
    roomName: string,
    month: number,
    year: number,
    newElectricity: number,
    newWater: number,
  ): Promise<void> {
    try {
      const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
          bills: {
            orderBy: [{ year: "desc" }, { month: "desc" }],
            take: 1,
          },
        },
      });

      if (!room) {
        throw new Error(`Room not found: ${roomId}`);
      }

      let oldElectricity = room.rentStartElectricity;
      let oldWater = room.rentStartWater;

      // Check if this month is the tenant's first month
      const isNewRenter = room.rentStartDate
        ? room.rentStartDate.getMonth() + 1 === month &&
          room.rentStartDate.getFullYear() === year
        : false;

      if (!isNewRenter && room.bills.length > 0) {
        const lastBill = room.bills[0];
        oldElectricity = lastBill.newElectricity;
        oldWater = lastBill.newWater;
      }

      // Delegate calculation and persistence to BillService
      const bill = await this.billService.calculateAndCreateBill({
        roomId,
        month,
        year,
        newElectricity,
        newWater,
        oldElectricity,
        oldWater,
      });

      // Calculate usage metrics and sub-totals
      const electricityUsage = newElectricity - oldElectricity;
      const waterUsage = newWater - oldWater;
      const electricityAmount =
        electricityUsage * room.electricityPrice.toNumber();
      const waterAmount = waterUsage * room.waterPrice.toNumber();
      const internetAmount = room.internetPrice.toNumber();
      const trashAmount = room.trashPrice.toNumber();
      const totalAmount = bill.totalAmount.toNumber();

      // Format and send invoice receipt details
      let receiptText = `Phòng ${room.name} - ${month}/${year}`;
      receiptText += `
      Số điện cũ: ${oldElectricity} kWh
      Số điện mới: ${newElectricity} kWh
      Số điện sử dụng: ${electricityUsage} kWh
      Tiền điện: ${electricityAmount.toLocaleString()} VNĐ

      Số nước cũ: ${oldWater} m3
      Số nước mới: ${newWater} m3
      Số nước sử dụng: ${waterUsage} m3
      Tiền nước: ${waterAmount.toLocaleString()} VNĐ

      Tiền internet: ${internetAmount.toLocaleString()} VNĐ
      Tiền rác: ${trashAmount.toLocaleString()} VNĐ

      Tổng cộng tiền nhà: ${totalAmount.toLocaleString()} VNĐ
      `;
      await this.sendMessage(chatId, receiptText);
    } catch (error) {
      console.error("Error in createBillWithLogging:", error);
      await this.sendMessage(chatId, `Lỗi khi tạo hóa đơn`);
    }
  }

  /**
   * Helper command to immediately trigger billing manually with custom readings.
   * @param chatId Telegram chat ID.
   * @param roomInput Room name input.
   * @param electricity New electricity reading.
   * @param water New water reading.
   */
  private async handleBill(
    chatId: string | number,
    roomInput: string,
    electricity: number,
    water: number,
  ): Promise<void> {
    try {
      const room = await this.findRoomByName(roomInput);
      if (!room) {
        await this.sendMessage(chatId, "Không tìm thấy phòng này");
        return;
      }
      if (room.status !== "OCCUPIED") {
        await this.sendMessage(
          chatId,
          `Phòng ${room.name} chưa có người thuê.`,
        );
        return;
      }

      const { month, year } = this.getCurrentMonthAndYear();
      await this.createBillWithLogging(
        chatId,
        room.id,
        room.name,
        month,
        year,
        electricity,
        water,
      );
    } catch (error: any) {
      console.error("Error in handleBill:", error);
      await this.sendMessage(chatId, `❌ Thất bại: ${error.message}`);
    }
  }

  /**
   * Logs a new maintenance or repair expense in the system.
   * Supports specific rooms or general house expenses ("chung").
   * @param chatId Telegram chat ID.
   * @param roomInput Room name input or "chung".
   * @param amount Expense cost amount.
   * @param description Expense details/reason.
   */
  private async handleLogExtra(
    chatId: string | number,
    roomInput: string,
    amount: number,
    description: string,
  ): Promise<void> {
    try {
      let roomId = null;
      if (roomInput.toLowerCase() !== "chung") {
        const room = await this.findRoomByName(roomInput);
        if (!room) {
          await this.sendMessage(chatId, "Không tìm thấy phòng này");
          return;
        }
        roomId = room.id;
      }

      // Persist expense to database
      await prisma.expense.create({
        data: {
          title: description,
          amount,
          roomId,
        },
      });

      await this.sendMessage(
        chatId,
        `Đã ghi nhận chi phí sửa chữa: ${amount.toLocaleString()} VNĐ cho ${roomInput === "chung" ? "chung" : `phòng ${roomInput}`}`,
      );
    } catch (error: any) {
      console.error("Error in handleLogExtra:", error);
      await this.sendMessage(chatId, `❌ Thất bại: ${error.message}`);
    }
  }

  /**
   * Helper function to get current local month and year.
   * @returns Object containing month and year as numbers.
   */
  private getCurrentMonthAndYear(): { month: number; year: number } {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    return { month, year };
  }
}
