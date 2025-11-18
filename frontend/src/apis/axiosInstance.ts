import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

let isRefreshing = false;
let pendingQueue: (() => void)[] = [];

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401이면서, 이미 한 번 재시도한 요청이면 그냥 실패시킴
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // 이미 다른 요청이 refresh 중이면, refresh 끝난 뒤 다시 시도
      if (isRefreshing) {
        await new Promise<void>((resolve) => {
          pendingQueue.push(resolve);
        });
        return axiosInstance(originalRequest);
      }

      isRefreshing = true;
      try {
        await axiosInstance.post("/auth/refresh-token");

        isRefreshing = false;
        // 대기중인 요청들 다시 실행
        pendingQueue.forEach((resolve) => resolve());
        pendingQueue = [];

        // 원래 요청 재시도
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        pendingQueue = [];
        // 재발급도 실패 → 강제 로그아웃 처리 등
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
