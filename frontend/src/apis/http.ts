import axiosInstance from './axiosInstance';

// 공통 단계(Stage) 타입
export interface Stage {
  _id: string;
  order: number;
  name: string;
  status: 'pending' | 'pass' | 'nonpass';
}

// 지원 현황(AppliedJob) 타입
export interface AppliedJob {
  _id: string;
  number: number;
  companyName: string;
  position: string;
  appliedDate: string; // ISO Date String
  stages: Stage[];
  contents: string;
  progress: 'pending' | 'in progress' | 'completed';
  fileUrl: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
}

// 페이지네이션 응답 타입
export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

// 통계(Statistics) 타입
export interface Statistics {
  totalApplications: number;
  totalPassRate: number;
  totalDocumentApplications: number;
  documentPassRate: number;
  totalCodingTestAttempts: number;
  codingTestPassRate: number;
  totalAssignmentAttempts: number;
  assignmentPassRate: number;
  totalInterviewAttempts: number;
  interviewPassRate: number;
}

// 사용자 정보 타입
export interface User {
  userId?: string; // verify-token 시
  _id?: string; // login 시
  username: string;
  isLoggedIn?: boolean;
}

// 로그인 요청 타입
export interface LoginRequest {
  username: string;
  password: string;
}

// 지원 정보 생성/수정 요청 타입
export interface JobPayload {
  companyName: string;
  position: string;
  appliedDate: string;
  stages: Omit<Stage, '_id'>[];
  contents: string;
  progress: 'pending' | 'in progress' | 'completed';
  fileUrl: string[];
}

/**
 * 사용자 로그아웃을 처리합니다.
 */
export const logout = (): Promise<{ message: string }> => axiosInstance.post('/auth/logout').then((res) => res.data);
/**
 * 사용자 로그인을 처리합니다.
 * @param {LoginRequest} formData - 사용자 로그인 정보 (username, password)
 */
export const login = (formData: LoginRequest): Promise<{ user: User }> =>
  axiosInstance.post('/auth/login', formData).then((res) => res.data);

/**
 * 토큰 유효성을 확인합니다.
 */
export const fetchVerifyToken = (): Promise<{ isValid: boolean; user?: User; message?: string }> =>
  axiosInstance.post('/auth/verify-token').then((res) => res.data);

/**
 * 지원한 회사 목록을 페이지네이션과 함께 가져옵니다.
 * @param {string} progress - 필터링할 진행 상태 ('all' | 'pending' | 'in progress' | 'completed')
 * @param {number} page - 현재 페이지 번호 (기본값: 1)
 * @param {number} limit - 페이지당 항목 수 (기본값: 20)
 * @param {string} search - 회사명 검색어 (선택 사항)
 * @param {string} sortOrder - 정렬 순서 ('latest' | 'earliest', 기본값: 'latest')
 */
export const fetchAppliedJobs = (
  progress: string,
  page: number = 1,
  limit: number = 20,
  search?: string,
  sortOrder: string = 'latest'
): Promise<PaginatedResponse<AppliedJob>> =>
  axiosInstance.get('/appliedJob', { params: { progress, page, limit, search, sortOrder } }).then((res) => res.data);

/**
 * 특정 지원 상세 정보를 가져옵니다.
 * @param {string} id - 지원 ID
 */
export const fetchJobDetail = (id: string): Promise<AppliedJob> =>
  axiosInstance.get(`/appliedJob/${id}`).then((res) => res.data);

/**
 * 지원 관련 통계 정보를 가져옵니다.
 */
export const fetchStatistics = (): Promise<Statistics> =>
  axiosInstance.get('/appliedJob/statistics').then((res) => res.data);

/**
 * 새로운 지원 정보를 생성합니다.
 * @param {JobPayload} payload - 생성할 지원 정보 데이터
 */
export const createJob = (payload: JobPayload): Promise<AppliedJob> =>
  axiosInstance.post('/appliedJob', payload).then((res) => res.data);

/**
 * 기존 지원 정보를 업데이트합니다.
 * @param {object} params - 업데이트할 지원 정보 파라미터
 * @param {string} params.id - 업데이트할 지원 ID
 * @param {Partial<JobPayload>} params.payload - 업데이트할 지원 정보 데이터
 */
export const updateJob = ({ id, payload }: { id: string; payload: Partial<JobPayload> }): Promise<AppliedJob> =>
  axiosInstance.patch(`/appliedJob/${id}`, payload).then((res) => res.data);

/**
 * 특정 지원 정보를 삭제합니다.
 * @param {string} id - 삭제할 지원 ID
 */
export const deleteJob = (id: string): Promise<{ message: string }> =>
  axiosInstance.delete(`/appliedJob/${id}`).then((res) => res.data);

/**
 * 특정 지원의 단계 상태를 업데이트합니다.
 * @param {object} params - 업데이트할 단계 상태 파라미터
 * @param {string} params.jobId - 지원 ID
 * @param {string} params.stageId - 단계 ID
 * @param {Stage['status']} params.status - 업데이트할 상태
 */
export const updateStageStatus = ({
  jobId,
  stageId,
  status,
}: {
  jobId: string;
  stageId: string;
  status: Stage['status'];
}): Promise<AppliedJob> =>
  axiosInstance.patch(`/appliedJob/${jobId}/stages/${stageId}`, { status }).then((res) => res.data);

/**
 * 파일을 서버에 업로드합니다.
 * @param {File} file - 업로드할 파일 객체
 */
export const uploadFile = (file: File): Promise<string> => {
  const fileFormData = new FormData();
  fileFormData.append('file', file);
  fileFormData.append('originalName', encodeURIComponent(file.name));
  return axiosInstance
    .post('/upload/file', fileFormData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data.fileUrl);
};
