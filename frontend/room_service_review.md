# Code Review Report: Frontend Room Service & Schema Mismatch

## 1. Compilation Test Results
* **Command Executed**: `npx tsc --noEmit` in `frontend/`
* **Status**: **Failed** (exit code 1)
* **Error details**:
  ```
  src/App.tsx(8,3): error TS6133: 'DollarSign' is declared but its value is never read.
  ```
* **Analysis**:
  - The frontend build fails due to a strict compiler rule: `noUnusedLocals: true` in `tsconfig.json`. The icon `DollarSign` is imported from `lucide-react` but never used in `src/App.tsx`.
  - The target file `src/services/room.service.ts` itself **compiles without syntax or type errors**, because it is not currently imported or integrated anywhere in `App.tsx` (which is still using local mock data and has a separate, local `Room` interface).

---

## 2. Detailed Findings

### Finding 1: Type Safety of Axios API Calls (Implicit `any` vs Generic Arguments)
* **Current Issue**:
  Axios requests are written without passing generic arguments. For example:
  ```typescript
  const response = await axios.get("/api/rooms");
  return response.data;
  ```
  Without generic arguments, `response.data` defaults to the `any` type in TypeScript. The return type of `getAll` is then implicitly cast from `any` to `Room[]`. This bypasses TypeScript's compile-time safety check, making it easy to introduce runtime bugs if the API response structure changes or does not match `Room[]`.
* **Recommendation**:
  Use generic arguments on Axios methods to enforce type checking at compile-time:
  ```typescript
  const response = await axios.get<Room[]>("/api/rooms");
  return response.data; // response.data is typed as Room[]
  ```

---

### Finding 2: Error Logging Under TypeScript Strict Mode
* **Current Issue**:
  The catch blocks in `room.service.ts` are structured as:
  ```typescript
  } catch (error) {
    console.error("Error fetching all rooms:", error);
    throw error;
  }
  ```
  Under TypeScript's strict mode (where `useUnknownInCatchVariables` is active by default), the caught `error` is typed as `unknown`. While `console.error` accepts arguments of type `any` or `unknown`, any attempt to inspect the error properties (e.g. `error.response` or `error.message`) will result in a compiler error unless the type is explicitly narrowed or cast.
* **Recommendation**:
  Use Axios type guards (`axios.isAxiosError(error)`) to safely check and narrow the error type to `AxiosError`, which allows accessing its properties without compilation errors.

---

### Finding 3: Lack of Custom Error Rethrowing
* **Current Issue**:
  The service functions currently catch errors, log them, and immediately `throw error;` which rethrows the raw `AxiosError`.
  This has two main drawbacks:
  1. **Leaks Implementation Details**: It forces calling React components to know that Axios is used, check for `AxiosError` types, and manually extract low-level HTTP details.
  2. **Silently Ignores Server-Side Messages**: Standard server-side responses from our Express backend return helpful validation or error messages, such as `{ error: "Tên phòng trọ đã tồn tại!" }` or `{ message: "Dữ liệu đầu vào không hợp lệ!", errors: [...] }`. Rethrowing the raw error makes it difficult for UI components to extract and show these messages (stored in `error.response.data.error` or `error.response.data.message`) without duplicate, repetitive boilerplate code.
* **Recommendation**:
  Extract the server-side error message in the service layer using a helper and throw a standardized `Error` with that message:
  ```typescript
  const message = axios.isAxiosError(error)
    ? error.response?.data?.error || error.response?.data?.message || error.message
    : error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định";
  throw new Error(message);
  ```

---

### Finding 4: Critical Payload Schema Mismatch (Zod vs Frontend Types)
* **Current Issue**:
  There is a major mismatch between what the frontend expects to send and what the backend is willing to accept:
  1. **Frontend `Room` Interface**:
     Defines fields like `status` (`"VACANT" | "OCCUPIED" | "MAINTENANCE"`), `renterName`, `renterPhone`, `renterDeposit`, and `rentStartDate` as required fields (non-optional, though nullable).
  2. **Frontend `roomService.create` signature**:
     `create: async (data: Omit<Room, "id">): Promise<Room>`
     This forces the UI caller to supply all the above fields when creating a room.
  3. **Backend validation (`createRoomSchema`)**:
     The Zod schema body ONLY defines:
     `name`, `type`, `price`, `electricityPrice`, `waterPrice`, `internetPrice`, and `trashPrice`.
     It does **not** define `status` or any of the renter-related fields.
  4. **Validation Middleware Behavior**:
     The backend `validation.middleware.ts` runs Zod validation and reassigns `req.body = parsed.body`. Because Zod strips out any fields that are not defined in the schema, the backend silently deletes `status`, `renterName`, `renterPhone`, `renterDeposit`, and `rentStartDate` from the payload before it even reaches the controller!
  5. **Backend Business Logic constraint**:
     The backend `RoomService.createRoom` method does not accept renter info or status during creation (since these default in the DB / are managed via other processes). Similarly, updates via `updateRoomSchema` only allow updating the room configuration fields, not the renter info or status directly.
* **Impact**:
  - The frontend compiler forces components to supply dummy/mock values for renter details and status during creation.
  - If a developer sends actual renter data or changes `status` during creation or updates through these CRUD endpoints, those updates are silently stripped out, creating hard-to-debug behaviors.
* **Recommendation**:
  Define proper DTOs (Data Transfer Objects) on the frontend that mirror the backend schemas:
  - `CreateRoomDto`: Defines only `name`, `type`, `price`, and optional pricing/utility fields.
  - `UpdateRoomDto`: A `Partial<CreateRoomDto>`.
  This ensures the frontend only sends fields the backend expects and processes.

---

## 3. Clean Refactored `room.service.ts`

Here is the clean, refactored frontend `room.service.ts` code addressing all the findings:

```typescript
import axios from "axios";

// Định nghĩa Interface Room tại Frontend khớp với định dạng trả về từ Backend
export interface Room {
  id: string;
  name: string;
  type: "ROW_A" | "ROW_B" | "KIOT";
  status: "VACANT" | "OCCUPIED" | "MAINTENANCE";
  price: number;
  electricityPrice: number;
  waterPrice: number;
  internetPrice: number;
  trashPrice: number;
  renterName: string | null;
  renterPhone: string | null;
  renterDeposit: number | null;
  rentStartDate: string | null;
}

// DTOs khớp chính xác với Zod schemas của Backend để tránh mismatch và strip payload
export interface CreateRoomDto {
  name: string;
  type: "ROW_A" | "ROW_B" | "KIOT";
  price: number;
  electricityPrice?: number;
  waterPrice?: number;
  internetPrice?: number;
  trashPrice?: number;
}

export type UpdateRoomDto = Partial<CreateRoomDto>;

/**
 * Helper extractor để trích xuất thông tin lỗi từ backend dưới TypeScript strict mode
 */
const handleServiceError = (error: unknown, defaultMessage: string): never => {
  let errorMessage = defaultMessage;

  if (axios.isAxiosError(error)) {
    // Trích xuất từ response của Express backend (nếu có)
    const backendError = error.response?.data?.error || error.response?.data?.message;
    if (backendError) {
      errorMessage = backendError;
    } else if (error.message) {
      errorMessage = error.message;
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  console.error(`${defaultMessage}:`, error);
  throw new Error(errorMessage);
};

export const roomService = {
  /**
   * Gọi API lấy toàn bộ danh sách phòng trọ
   */
  getAll: async (): Promise<Room[]> => {
    try {
      const response = await axios.get<Room[]>("/api/rooms");
      return response.data;
    } catch (error) {
      handleServiceError(error, "Lỗi khi lấy danh sách phòng trọ");
    }
  },

  /**
   * Gọi API lấy chi tiết một phòng trọ
   */
  getById: async (id: string): Promise<Room> => {
    try {
      const response = await axios.get<Room>(`/api/rooms/${id}`);
      return response.data;
    } catch (error) {
      handleServiceError(error, `Lỗi khi lấy chi tiết phòng trọ ID ${id}`);
    }
  },

  /**
   * Gọi API tạo phòng trọ mới
   */
  create: async (data: CreateRoomDto): Promise<Room> => {
    try {
      const response = await axios.post<Room>("/api/rooms", data);
      return response.data;
    } catch (error) {
      handleServiceError(error, "Lỗi khi tạo phòng trọ mới");
    }
  },

  /**
   * Gọi API cập nhật thông tin cấu hình phòng trọ
   */
  update: async (id: string, data: UpdateRoomDto): Promise<Room> => {
    try {
      const response = await axios.put<Room>(`/api/rooms/${id}`, data);
      return response.data;
    } catch (error) {
      handleServiceError(error, `Lỗi khi cập nhật thông tin phòng trọ ID ${id}`);
    }
  },

  /**
   * Gọi API xóa phòng trọ
   */
  delete: async (id: string): Promise<void> => {
    try {
      await axios.delete<void>(`/api/rooms/${id}`);
    } catch (error) {
      handleServiceError(error, `Lỗi khi xóa phòng trọ ID ${id}`);
    }
  },
};
```
