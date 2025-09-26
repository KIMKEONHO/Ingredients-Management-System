import { apiClient } from '../client';
import { 
  RsDataListComplaintDetailResponseDto, 
  ComplaintDetailResponseDto,
  transformComplaintData,
  Complaint 
} from '../../backend/apiV1/complaintTypes';

// 민원 상태 enum
export enum ComplaintStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED'
}

// 민원 상태 유틸리티 클래스
export class ComplaintStatusUtils {
  static getStatusLabel(status: ComplaintStatus): string {
    switch (status) {
      case ComplaintStatus.PENDING:
        return '접수됨';
      case ComplaintStatus.IN_PROGRESS:
        return '처리 중';
      case ComplaintStatus.COMPLETED:
        return '완료';
      case ComplaintStatus.REJECTED:
        return '거부됨';
      default:
        return '알 수 없음';
    }
  }

  static getStatusColor(status: ComplaintStatus): { text: string; bg: string } {
    switch (status) {
      case ComplaintStatus.PENDING:
        return { text: 'text-yellow-700', bg: 'bg-yellow-100' };
      case ComplaintStatus.IN_PROGRESS:
        return { text: 'text-blue-700', bg: 'bg-blue-100' };
      case ComplaintStatus.COMPLETED:
        return { text: 'text-blue-700', bg: 'bg-blue-100' };
      case ComplaintStatus.REJECTED:
        return { text: 'text-red-700', bg: 'bg-red-100' };
      default:
        return { text: 'text-gray-700', bg: 'bg-gray-100' };
    }
  }
}

// RsData 타입 정의
export interface RsData<T> {
  resultCode: string;
  msg: string;
  data: T;
}

// 민원 생성 요청 DTO
export interface CreateComplaintRequestDto {
  title: string;
  content: string;
  categoryCode: number; // 1: 식재료요청, 2: 오류사항
}

// 민원 생성 응답 DTO
export interface CreateComplaintResponseDto {
  resultCode: string;
  resultMessage: string;
  data?: {
    complaintId?: number;
    [key: string]: unknown;
  };
}

// 모든 민원 조회
export const getAllComplaints = async (): Promise<Complaint[]> => {
  try {
    const response = await apiClient.get<RsDataListComplaintDetailResponseDto>('/api/v1/complaints/all');
    
    if (response.data && Array.isArray(response.data)) {
      return transformComplaintData(response.data);
    }
    
    return [];
  } catch (error) {
    console.error('민원 목록을 가져오는 중 오류가 발생했습니다:', error);
    throw new Error('민원 목록을 가져올 수 없습니다.');
  }
};

// 단일 민원 조회
export const getComplaint = async (complaintId: number): Promise<ComplaintDetailResponseDto | null> => {
  try {
    const response = await apiClient.get<ComplaintDetailResponseDto>(`/api/v1/complaints/${complaintId}`);
    console.log('getComplaint 응답:', response);
    return response || null;
  } catch (error) {
    console.error('민원을 가져오는 중 오류가 발생했습니다:', error);
    throw new Error('민원을 가져올 수 없습니다.');
  }
};

// 민원 상태 업데이트
export const updateComplaintStatus = async (complaintId: number, statusCode: number): Promise<void> => {
  try {
    console.log('API 호출 시작:', {
      complaintId,
      statusCode,
      url: `/api/v1/complaints/${complaintId}/status/${statusCode}`
    });
    
    const response = await apiClient.patch(`/api/v1/complaints/${complaintId}/status/${statusCode}`);
    
    console.log('API 응답 성공:', {
      complaintId,
      statusCode,
      response: response
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    const errorResponse = error && typeof error === 'object' && 'response' in error ? error.response : null;
    const errorData = errorResponse && typeof errorResponse === 'object' && 'data' in errorResponse ? errorResponse.data : null;
    const errorStatus = errorResponse && typeof errorResponse === 'object' && 'status' in errorResponse ? errorResponse.status : null;
    
    console.error('민원 상태 업데이트 중 오류가 발생했습니다:', {
      complaintId,
      statusCode,
      error: errorData || errorMessage,
      status: errorStatus
    });
    throw new Error('민원 상태를 업데이트할 수 없습니다.');
  }
};

// 상태 코드 매핑 (백엔드 ComplaintStatus enum의 getCode() 값과 일치)
export const getStatusCodeFromStatus = (status: string): number => {
  switch (status) {
    case 'pending':
      return 1; // PENDING
    case 'processing':
      return 2; // IN_PROGRESS
    case 'completed':
      return 3; // COMPLETED
    case 'rejected':
      return 4; // REJECTED
    default:
      return 1; // 기본값은 PENDING
  }
};

// 민원 생성
export const createComplaint = async (requestData: CreateComplaintRequestDto): Promise<CreateComplaintResponseDto> => {
  try {
    const response = await apiClient.post<CreateComplaintResponseDto>('/api/v1/complaints/', requestData);
    return response;
  } catch (error) {
    console.error('민원 생성 중 오류가 발생했습니다:', error);
    throw new Error('민원을 생성할 수 없습니다.');
  }
};

// 내 민원 조회
export const getMyComplaints = async (): Promise<ComplaintDetailResponseDto[]> => {
  try {
    const response = await apiClient.get<RsDataListComplaintDetailResponseDto>('/api/v1/complaints/users');
    console.log('getMyComplaints 응답:', response);
    
    // RsData 형태의 응답에서 data 배열 추출
    if (response && response.data && Array.isArray(response.data)) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('내 민원 목록을 가져오는 중 오류가 발생했습니다:', error);
    throw new Error('내 민원 목록을 가져올 수 없습니다.');
  }
};

// ComplaintService 클래스
export class ComplaintService {
  static async createComplaint(requestData: CreateComplaintRequestDto): Promise<CreateComplaintResponseDto> {
    return createComplaint(requestData);
  }

  static async getAllComplaints(): Promise<Complaint[]> {
    return getAllComplaints();
  }

  static async getComplaint(complaintId: number): Promise<ComplaintDetailResponseDto | null> {
    return getComplaint(complaintId);
  }

  static async getMyComplaints(): Promise<ComplaintDetailResponseDto[]> {
    return getMyComplaints();
  }

  static async updateComplaintStatus(complaintId: number, statusCode: number): Promise<void> {
    return updateComplaintStatus(complaintId, statusCode);
  }
}