import { Request, Response } from "express";
import { TelegramService } from "../services/telegram.service";

/**
 * Controller to handle incoming Telegram webhook updates.
 */
export class TelegramController {
  private telegramService = new TelegramService();

  /**
   * HTTP POST /api/telegram/webhook
   * Processes incoming Telegram messages, validates sender Chat ID, and forwards command to TelegramService.
   */
  handleWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
      const { message } = req.body;

      // If payload is not a valid message, acknowledge webhook immediately
      if (!message || !message.chat || !message.text) {
        res.sendStatus(200);
        return;
      }

      const chatId = message.chat.id.toString();
      const text = message.text;

      console.log(`[Telegram Bot] Incoming message from chatId: ${chatId}, text: "${text}"`);

      // 🔐 Bảo mật Webhook bằng Secret Token
      const secretToken = req.headers["x-telegram-bot-api-secret-token"];
      const expectedToken = process.env.TELEGRAM_WEBHOOK_SECRET_TOKEN;
      if (expectedToken && secretToken !== expectedToken) {
        console.error(`[Telegram Bot] Unauthorized webhook call! Invalid secret token header.`);
        res.sendStatus(200);
        return;
      }

      // TODO: Validate that the incoming chatId matches process.env.TELEGRAM_CHAT_ID to secure the webhook.
      // If unauthorized, log warning and return early with res.sendStatus(200) to stop Telegram retries.
      const chatIds =
        process.env.TELEGRAM_CHAT_ID?.split(",").map((id) => id.trim()) || [];
      if (chatIds.length > 0 && !chatIds.includes(chatId)) {
        console.error(`[Telegram Bot] Unauthorized Telegram chat ID: ${chatId}. Allowed: ${chatIds.join(", ")}`);
        res.sendStatus(200);
        return;
      }

      console.log(`[Telegram Bot] Processing authorized command: "${text}" from chatId: ${chatId}`);

      // TODO: Delegate processing to telegramService.handleWebhookMessage(chatId, text)
      await this.telegramService.handleWebhookMessage(chatId, text);

      console.log(`[Telegram Bot] Successfully processed command: "${text}" for chatId: ${chatId}`);

      // TODO: Respond with HTTP 200 OK to acknowledge receipt of the Telegram update
      res.sendStatus(200);
    } catch (error) {
      console.error("Error processing Telegram webhook:", error);
      // Respond 200 to avoid Telegram repeating failed webhook delivery loops
      res.sendStatus(200);
    }
  };
}
