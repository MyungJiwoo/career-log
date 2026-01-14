import axios, { AxiosError } from 'axios';

export interface ErrorResponse {
  message?: string;
  error?: string; // 파일 업로드 실패
  remainingAttempts?: number; // 로그인 실패
  isValid?: boolean; // 토큰 검증 실패
}

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let isRefreshing = false;
let pendingQueue: (() => void)[] = [];

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 로그인 실패(401) 시 인터셉터가 리프레시 로직을 타서 페이지를 새로고침(forceLogout)하느라 컴포넌트의 onError가 실행되지 않음
    const isLoginRequest = originalRequest.url.includes('/auth/login');

    // 401이면서, 이미 한 번 재시도한 요청이면 그냥 실패시킴
    if (error.response?.status === 401 && !originalRequest._retry && !isLoginRequest) {
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
        await axiosInstance.post('/auth/refresh-token');

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
        forceLogout();
        return Promise.reject(refreshError);
      }
    }

    handleCommonError(error);

    return Promise.reject(error);
  },
);

/**
 * 강제 로그아웃 함수
 */
const forceLogout = async () => {
  try {
    // 리프레시 토큰이 만료되었더라도 서버 측 세션을 정리하기 위해 호출
    await axiosInstance.post('/auth/logout');
  } catch (error) {
    console.warn('서버 세션 정리 중 오류 발생 : ', error);
  } finally {
    // 클라이언트 상태 초기화 및 리다이렉트
    window.location.href = '/login';
  }
};

/**
 * 공통 오류 처리 핸들러
 */
const handleCommonError = (error: AxiosError<ErrorResponse>) => {
  const status = error.response?.status;
  const message = error.response?.data?.message || '알 수 없는 에러가 발생했습니다.';

  console.error(`[API Error] ${status}: ${message}`);

  if (status === 500) {
    alert('서버 점검 중입니다.');
  }
};

export default axiosInstance;
