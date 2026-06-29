import axios from "axios";

// 1. Khởi tạo một Axios Instance dùng chung
// Việc tạo instance giúp chúng ta dễ cấu hình base URL hoặc headers mặc định sau này.
const api = axios.create({
  baseURL: "", // Trống vì Vite dev server đã cấu hình proxy tự động sang backend (port 5000)
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. Request Interceptor: Trạm kiểm soát trước khi gửi Request đi
// Trước khi một request được gửi lên server, interceptor này sẽ chạy.
// Nó sẽ lấy token từ localStorage (nếu có) và đính kèm vào Authorization header.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("rental_hub_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ⚡ Bypass iOS Safari GET Cache bằng cách thêm timestamp ngẫu nhiên
    if (config.method === "get" || config.method === "GET") {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Response Interceptor: Trạm kiểm soát sau khi nhận Response về
// Khi server phản hồi, trước khi dữ liệu được trả về cho component xử lý,
// interceptor này sẽ kiểm tra xem có lỗi xác thực (401 Unauthorized) hay không.
// Nếu có, tức là token đã hết hạn hoặc không hợp lệ -> xóa token và reload trang để Auth Gate khóa giao diện.
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Nếu server trả về mã lỗi 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      console.warn("Phiên đăng nhập đã hết hạn hoặc token không hợp lệ. Đang đăng xuất...");
      localStorage.removeItem("rental_hub_token");

      // Chỉ tự động reload lại trang khi không ở màn hình đăng nhập
      // Điều này ngăn chặn việc reload vô hạn nếu gọi API login sai mật khẩu (nếu API login trả 401)
      const isLoginEndpoint = error.config.url?.includes("/api/auth/login");
      if (!isLoginEndpoint) {
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
