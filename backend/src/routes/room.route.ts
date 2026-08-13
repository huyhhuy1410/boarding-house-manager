import { Router } from 'express';
import { RoomController } from '../controllers/room.controller';
import { validate } from '../middlewares/validation.middleware';
import { createRoomSchema, updateRoomSchema, relocateRoomSchema } from '../schemas/room.schema';

import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const roomController = new RoomController();

// Áp dụng authMiddleware bảo vệ toàn bộ các endpoint bên dưới
router.use(authMiddleware);

// Đăng ký các Endpoint API cho Room
router.get('/', roomController.getAll);
router.post('/relocate', validate(relocateRoomSchema), roomController.relocate);
router.get('/:id', roomController.getById);
router.post('/', validate(createRoomSchema), roomController.create);
router.put('/:id', validate(updateRoomSchema), roomController.update);
router.delete('/:id', roomController.destroy);

export default router;
