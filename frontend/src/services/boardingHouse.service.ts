import api from "./api";

export interface BoardingHouse {
    id: string,
    name: string,
    _count?: { room: number },
    createdAt: string,
    updatedAt: string,
}

export const boardingHouseService = {
    getAll: async (): Promise<BoardingHouse[]> => {
        const response = await api.get<BoardingHouse[]>("/api/boarding-houses");
        return response.data;
    },

    create: async (name: string): Promise<BoardingHouse> => {
        const response = await api.post<BoardingHouse>("/api/boarding-houses", { name });
        return response.data;
    },

    update: async (id: string, name: string): Promise<BoardingHouse> => {
        const response = await api.put<BoardingHouse>(`/api/boarding-houses/${id}`, { name });
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/api/boarding-houses/${id}`);
    },
};