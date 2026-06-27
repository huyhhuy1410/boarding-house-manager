import { Router } from "express";
import { TelegramController } from "../controllers/telegram.controller";

const router = Router();
const telegramController = new TelegramController();

/**
 * Route registry for Telegram bot webhooks.
 */
// TODO: Define POST /webhook route mapping to telegramController.handleWebhook
router.post("/webhook", telegramController.handleWebhook);

export default router;
