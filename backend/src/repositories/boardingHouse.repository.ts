import prisma from "../config/prisma";
export class BoardinghouseRepository {
    async findAll() {
        return prisma.boardingHouse.findMany({
            orderBy: {
                createdAt: "asc"
            },
            include: {
                _count: {
                    select: { rooms: true }
                }
            }
        })
    }
    async findById(id: string) {
        return prisma.boardingHouse.findUnique({
            where: { id }
        })
    }
    async create(data: { name: string }) {
        return prisma.boardingHouse.create({ data });
    }

    async update(id: string, data: { name: string }) {
        return prisma.boardingHouse.update({ where: { id }, data });
    }

    async delete(id: string) {
        return prisma.boardingHouse.delete({ where: { id } });
    }
}
