import { Router } from 'express';
import { RoomController } from '../controllers/room.controller';
import { validate } from '../middlewares/validation.middleware';
import { createRoomSchema, updateRoomSchema } from '../schemas/room.schema';

const router = Router();
const roomController = new RoomController();

// Đăng ký các Endpoint API cho Room
router.get('/', roomController.getAll);
router.get('/:id', roomController.getById);
router.post('/', validate(createRoomSchema), roomController.create);
router.put('/:id', validate(updateRoomSchema), roomController.update);
router.delete('/:id', roomController.destroy);

export default router;
