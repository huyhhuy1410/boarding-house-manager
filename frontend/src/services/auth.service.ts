import api from "./api";

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export const authService = {
  /**
   * Đăng nhập người dùng vào hệ thống
   * @param credentials chứa email và mật khẩu
   * @returns Thông tin user và token từ backend
   */
  login: async (credentials: { email: string; password: string }): Promise<User> => {
    try {
      // 1. Gửi request POST đến endpoint đăng nhập của backend
      const response = await api.post<LoginResponse>("/api/auth/login", credentials);
      const { user, token } = response.data.data;

      // 2. Lưu token vào localStorage để duy trì trạng thái đăng nhập khi người dùng tải lại trang.
      // Giải thích: Đây là mô hình Stateless Authentication. 
      // Server không lưu Session mà trình duyệt sẽ lưu JWT. Token này được đính kèm vào mọi request tiếp theo nhờ Axios Interceptor.
      localStorage.setItem("rental_hub_token", token);
      localStorage.setItem("rental_hub_user", JSON.stringify(user));

      return user;
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      throw error;
    }
  },

  /**
   * Đăng xuất người dùng khỏi hệ thống
   */
  logout: () => {
    // Xóa toàn bộ thông tin đăng nhập khỏi bộ nhớ của trình duyệt
    localStorage.removeItem("rental_hub_token");
    localStorage.removeItem("rental_hub_user");
    
    // Tải lại trang để reset toàn bộ State của ứng dụng React và đưa người dùng về màn hình Login
    window.location.reload();
  },

  /**
   * Lấy thông tin user hiện tại từ localStorage
   */
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem("rental_hub_user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  /**
   * Kiểm tra xem người dùng đã đăng nhập chưa bằng cách kiểm tra sự tồn tại của token
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("rental_hub_token");
  }
};
