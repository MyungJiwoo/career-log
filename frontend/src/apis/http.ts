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

/**
 * 사용자 로그아웃을 처리합니다.
 */
export const logout = (): Promise<{ message: string }> => axiosInstance.post('/auth/logout').then((res) => res.data);
/**
 * 사용자 로그인을 처리합니다.
 * @param {object} formData - 사용자 로그인 정보 (예: 이메일, 비밀번호)
 */
export const login = (formData: any): Promise<{ user: User }> =>
  axiosInstance.post('/auth/login', formData).then((res) => res.data);

/**
 * 토큰 유효성을 확인합니다.
 */
export const fetchVerifyToken = (): Promise<{ isValid: boolean; user?: User; message?: string }> =>
  axiosInstance.post('/auth/verify-token').then((res) => res.data);

/**
 * 지원한 회사 목록을 가져옵니다.
 * @param {string} progress - 필터링할 진행 상태 (예: 'pending', 'interview', 'offer', 'declined')
 */
export const fetchAppliedJobs = (progress: string): Promise<AppliedJob[]> =>
  axiosInstance.get('/appliedJob', { params: { progress } }).then((res) => res.data);

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
 * @param {object} payload - 생성할 지원 정보 데이터
 */
export const createJob = (payload: any): Promise<AppliedJob> =>
  axiosInstance.post('/appliedJob', payload).then((res) => res.data);

/**
 * 기존 지원 정보를 업데이트합니다.
 * @param {object} params - 업데이트할 지원 정보 파라미터
 * @param {string} params.id - 업데이트할 지원 ID
 * @param {object} params.payload - 업데이트할 지원 정보 데이터
 */
export const updateJob = ({ id, payload }: { id: string; payload: any }): Promise<AppliedJob> =>
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
 * @param {string} params.status - 업데이트할 상태
 */
export const updateStageStatus = ({
  jobId,
  stageId,
  status,
}: {
  jobId: string;
  stageId: string;
  status: string;
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
