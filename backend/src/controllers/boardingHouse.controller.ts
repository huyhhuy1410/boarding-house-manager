import { Request, Response } from "express";
import { BoardingHouseService } from "../services/boardingHouse.service";
import { asyncHandler } from "../utils/async-handler";

export class BoardingHouseController {
    private service = new BoardingHouseService();

    getAll = asyncHandler(async (req: Request, res: Response) => {
        const list = await this.service.getAll();
        res.status(200).json(list);
    });

    create = asyncHandler(async (req: Request, res: Response) => {
        const { name } = req.body;
        const bh = await this.service.create(name);
        res.status(201).json(bh);
    });

    update = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { name } = req.body;
        const bh = await this.service.update(id, name);
        res.status(200).json(bh);
    });

    destroy = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        await this.service.delete(id);
        res.status(200).json({ message: "Đã xóa dãy trọ thành công!" });
    });
}