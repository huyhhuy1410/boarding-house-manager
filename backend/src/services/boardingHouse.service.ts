import { BoardinghouseRepository } from "../repositories/boardingHouse.repository";
import { AppError } from "../errors/app-error";
import prisma from "../config/prisma";
export class BoardingHouseService {
    private repo = new BoardinghouseRepository()
    async getAll() {
        return this.repo.findAll();
    }
    async getById(id: string) {
        const bh = await this.repo.findById(id)
        if (!bh) throw new AppError("Không tìm thấy dãy trọ", 404)
        return bh;
    }
    async create(name: string) {
        if (!name?.trim()) throw new AppError("Tên dãy trọ không được để trống", 400)
        return this.repo.create({ name: name.trim() })
    }
    async update(id: string, name: string) {
        await this.getById(id) // đảm bảo tồn tại
        if (!name?.trim()) throw new AppError("Tên dãy trọ không được để trống", 400)
        return this.repo.update(id, { name: name.trim() })
    }
    async delete(id: string) {
        const bh = await this.repo.findById(id)
        if (!bh) throw new AppError("Không tìm thấy dãy trọ", 404)
        const count = await prisma.room.count({ where: { boardingHouseId: id } })
        if (count > 0) {
            throw new AppError(
                `Không thể xóa! Dãy trọ ${bh.name} này còn ${count} phòng. Hãy xóa hoặc chuyển phòng trước.`,
                400
            );
        }
        return this.repo.delete(id);
    }
}  