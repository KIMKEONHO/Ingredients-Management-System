import { apiClient } from '../client';
import { API_ENDPOINTS, createApiUrl } from '../endpoints';

// 백엔드 ComplaintStatus enum과 일치하는 타입 정의
export enum ComplaintStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS', 
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED'
}

// 백엔드 ComplaintDetailResponseDto와 일치하는 타입 정의
export interface ComplaintDetailResponseDto {
  complaintId: number;
  title: string;
  content: string;
  status: ComplaintStatus;
}

// 민원 작성 요청 DTO
export interface CreateComplaintRequestDto {
  title: string;
  content: string;
  categoryCode?: number;
}

// 민원 작성 응답 DTO
export interface CreateComplaintResponseDto {
  complaintId: number;
  title: string;
  content: string;
  status: ComplaintStatus;
}

// 백엔드 RsData 응답 구조
export interface RsData<T> {
  resultCode: string;
  msg: string;
  data: T;
}

export class ComplaintService {
  // 내 민원 목록 조회
  static async getMyComplaints(): Promise<RsData<ComplaintDetailResponseDto[]>> {
    const response = await apiClient.get<RsData<ComplaintDetailResponseDto[]>>(
      API_ENDPOINTS.COMPLAINTS.USERS
    );
    return response;
  }

  // 민원 상세 조회
  static async getComplaintDetail(complaintId: number): Promise<RsData<ComplaintDetailResponseDto>> {
    const url = createApiUrl(API_ENDPOINTS.COMPLAINTS.DETAIL, { id: complaintId });
    const response = await apiClient.get<RsData<ComplaintDetailResponseDto>>(url);
    return response;
  }

  // 민원 작성
  static async createComplaint(request: CreateComplaintRequestDto): Promise<RsData<CreateComplaintResponseDto>> {
    const response = await apiClient.post<RsData<CreateComplaintResponseDto>>(
      API_ENDPOINTS.COMPLAINTS.CREATE,
      request
    );
    return response;
  }

  // 민원 수정
  static async updateComplaint(
    complaintId: number, 
    request: CreateComplaintRequestDto
  ): Promise<RsData<CreateComplaintResponseDto>> {
    const url = createApiUrl(API_ENDPOINTS.COMPLAINTS.UPDATE, { id: complaintId });
    const response = await apiClient.patch<RsData<CreateComplaintResponseDto>>(url, request);
    return response;
  }

  // 민원 삭제
  static async deleteComplaint(complaintId: number): Promise<RsData<null>> {
    const url = createApiUrl(API_ENDPOINTS.COMPLAINTS.DELETE, { id: complaintId });
    const response = await apiClient.delete<RsData<null>>(url);
    return response;
  }

  // 민원 상태 변경 (관리자용)
  static async updateComplaintStatus(
    complaintId: number, 
    statusCode: number
  ): Promise<RsData<null>> {
    const url = createApiUrl(API_ENDPOINTS.COMPLAINTS.STATUS_UPDATE, { 
      id: complaintId, 
      statusCode: statusCode 
    });
    const response = await apiClient.patch<RsData<null>>(url);
    return response;
  }

  // 전체 민원 조회 (관리자용)
  static async getAllComplaints(): Promise<RsData<ComplaintDetailResponseDto[]>> {
    const response = await apiClient.get<RsData<ComplaintDetailResponseDto[]>>(
      API_ENDPOINTS.COMPLAINTS.ALL
    );
    return response;
  }
}

// 민원 상태 관련 유틸리티 함수들
export const ComplaintStatusUtils = {
  // 상태 코드를 한글로 변환
  getStatusLabel: (status: ComplaintStatus): string => {
    switch (status) {
      case ComplaintStatus.PENDING:
        return '보류';
      case ComplaintStatus.IN_PROGRESS:
        return '진행 중';
      case ComplaintStatus.COMPLETED:
        return '완료';
      case ComplaintStatus.REJECTED:
        return '거부됨';
      default:
        return '알 수 없음';
    }
  },

  // 상태에 따른 색상 반환
  getStatusColor: (status: ComplaintStatus): { text: string; bg: string; icon: string } => {
    switch (status) {
      case ComplaintStatus.PENDING:
        return { text: 'text-blue-600', bg: 'bg-blue-50', icon: 'text-blue-500' };
      case ComplaintStatus.IN_PROGRESS:
        return { text: 'text-yellow-600', bg: 'bg-yellow-50', icon: 'text-yellow-500' };
      case ComplaintStatus.COMPLETED:
        return { text: 'text-green-600', bg: 'bg-green-50', icon: 'text-green-500' };
      case ComplaintStatus.REJECTED:
        return { text: 'text-red-600', bg: 'bg-red-50', icon: 'text-red-500' };
      default:
        return { text: 'text-gray-600', bg: 'bg-gray-50', icon: 'text-gray-500' };
    }
  },

  // 상태 코드를 enum으로 변환
  fromCode: (code: number): ComplaintStatus => {
    switch (code) {
      case 1:
        return ComplaintStatus.PENDING;
      case 2:
        return ComplaintStatus.IN_PROGRESS;
      case 3:
        return ComplaintStatus.COMPLETED;
      case 4:
        return ComplaintStatus.REJECTED;
      default:
        throw new Error(`Invalid status code: ${code}`);
    }
  },

  // enum을 코드로 변환
  toCode: (status: ComplaintStatus): number => {
    switch (status) {
      case ComplaintStatus.PENDING:
        return 1;
      case ComplaintStatus.IN_PROGRESS:
        return 2;
      case ComplaintStatus.COMPLETED:
        return 3;
      case ComplaintStatus.REJECTED:
        return 4;
      default:
        throw new Error(`Invalid status: ${status}`);
    }
  }
};
