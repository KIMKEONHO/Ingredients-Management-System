import { apiClient } from '../client';
import { API_ENDPOINTS, createApiUrl } from '../endpoints';

// 피드백 생성 요청 DTO
export interface CreateComplaintFeedbackRequestDto {
  title?: string;
  content?: string;
}

// 피드백 수정 요청 DTO
export interface UpdateComplaintFeedbackRequestDto {
  title?: string;
  content?: string;
}

// 피드백 응답 DTO
export interface ComplaintFeedbackResponseDto {
  id?: number;
  title?: string;
  content?: string;
  complaintId?: number;
  responderNickname?: string;
  createAt?: string;
  modifiedAt?: string;
}

// RsData 응답 래퍼
export interface RsDataComplaintFeedbackResponseDto {
  resultCode?: string;
  msg?: string;
  data?: ComplaintFeedbackResponseDto;
}

export interface RsDataListComplaintFeedbackResponseDto {
  resultCode?: string;
  msg?: string;
  data?: ComplaintFeedbackResponseDto[];
}

// 피드백 조회
export const getFeedback = async (complaintId: number): Promise<ComplaintFeedbackResponseDto | null> => {
  try {
    const url = createApiUrl(API_ENDPOINTS.FEEDBACK.BY_COMPLAINT, { complaintId });
    
    console.log('피드백 조회 API 호출:', {
      complaintId,
      url
    });
    
    const response = await apiClient.get<RsDataComplaintFeedbackResponseDto>(url);
    
    console.log('피드백 조회 API 응답 성공:', {
      complaintId,
      response: response
    });
    
    return response.data || null;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    const errorResponse = error && typeof error === 'object' && 'response' in error ? error.response : null;
    const errorData = errorResponse && typeof errorResponse === 'object' && 'data' in errorResponse ? errorResponse.data : null;
    const errorStatus = errorResponse && typeof errorResponse === 'object' && 'status' in errorResponse ? errorResponse.status : null;
    
    console.error('피드백 조회 중 오류가 발생했습니다:', {
      complaintId,
      error: errorData || errorMessage,
      status: errorStatus
    });
    throw new Error('피드백을 조회할 수 없습니다.');
  }
};

// 피드백 생성
export const createFeedback = async (complaintId: number, feedbackData: CreateComplaintFeedbackRequestDto): Promise<void> => {
  try {
    const url = createApiUrl(API_ENDPOINTS.FEEDBACK.BY_COMPLAINT, { complaintId });
    
    console.log('피드백 생성 API 호출:', {
      complaintId,
      feedbackData,
      url
    });
    
    const response = await apiClient.post(url, feedbackData);
    
    console.log('피드백 생성 API 응답 성공:', {
      complaintId,
      response: response
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    const errorResponse = error && typeof error === 'object' && 'response' in error ? error.response : null;
    const errorData = errorResponse && typeof errorResponse === 'object' && 'data' in errorResponse ? errorResponse.data : null;
    const errorStatus = errorResponse && typeof errorResponse === 'object' && 'status' in errorResponse ? errorResponse.status : null;
    
    console.error('피드백 생성 중 오류가 발생했습니다:', {
      complaintId,
      feedbackData,
      error: errorData || errorMessage,
      status: errorStatus
    });
    throw new Error('피드백을 생성할 수 없습니다.');
  }
};

// 피드백 수정
export const updateFeedback = async (feedbackId: number, feedbackData: UpdateComplaintFeedbackRequestDto): Promise<void> => {
  try {
    const url = createApiUrl(API_ENDPOINTS.FEEDBACK.BY_ID, { feedbackId });
    
    console.log('피드백 수정 API 호출:', {
      feedbackId,
      feedbackData,
      url
    });
    
    const response = await apiClient.put(url, feedbackData);
    
    console.log('피드백 수정 API 응답 성공:', {
      feedbackId,
      response: response
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    const errorResponse = error && typeof error === 'object' && 'response' in error ? error.response : null;
    const errorData = errorResponse && typeof errorResponse === 'object' && 'data' in errorResponse ? errorResponse.data : null;
    const errorStatus = errorResponse && typeof errorResponse === 'object' && 'status' in errorResponse ? errorResponse.status : null;
    
    console.error('피드백 수정 중 오류가 발생했습니다:', {
      feedbackId,
      feedbackData,
      error: errorData || errorMessage,
      status: errorStatus
    });
    throw new Error('피드백을 수정할 수 없습니다.');
  }
};

// 피드백 삭제
export const deleteFeedback = async (feedbackId: number): Promise<void> => {
  try {
    const url = createApiUrl(API_ENDPOINTS.FEEDBACK.BY_ID, { feedbackId });
    
    console.log('피드백 삭제 API 호출:', {
      feedbackId,
      url
    });
    
    const response = await apiClient.delete(url);
    
    console.log('피드백 삭제 API 응답 성공:', {
      feedbackId,
      response: response
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    const errorResponse = error && typeof error === 'object' && 'response' in error ? error.response : null;
    const errorData = errorResponse && typeof errorResponse === 'object' && 'data' in errorResponse ? errorResponse.data : null;
    const errorStatus = errorResponse && typeof errorResponse === 'object' && 'status' in errorResponse ? errorResponse.status : null;
    
    console.error('피드백 삭제 중 오류가 발생했습니다:', {
      feedbackId,
      error: errorData || errorMessage,
      status: errorStatus
    });
    throw new Error('피드백을 삭제할 수 없습니다.');
  }
};

// 모든 피드백 조회
export const getAllFeedback = async (): Promise<ComplaintFeedbackResponseDto[]> => {
  try {
    const url = API_ENDPOINTS.FEEDBACK.BASE;
    
    console.log('모든 피드백 조회 API 호출:', {
      url
    });
    
    const response = await apiClient.get<RsDataListComplaintFeedbackResponseDto>(url);
    
    console.log('모든 피드백 조회 API 응답 성공:', {
      response: response
    });
    
    return response.data || [];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    const errorResponse = error && typeof error === 'object' && 'response' in error ? error.response : null;
    const errorData = errorResponse && typeof errorResponse === 'object' && 'data' in errorResponse ? errorResponse.data : null;
    const errorStatus = errorResponse && typeof errorResponse === 'object' && 'status' in errorResponse ? errorResponse.status : null;
    
    console.error('모든 피드백 조회 중 오류가 발생했습니다:', {
      error: errorData || errorMessage,
      status: errorStatus
    });
    throw new Error('피드백 목록을 조회할 수 없습니다.');
  }
};

// FeedbackService 클래스
export class FeedbackService {
  static async getFeedback(complaintId: number): Promise<ComplaintFeedbackResponseDto | null> {
    return getFeedback(complaintId);
  }

  static async createFeedback(complaintId: number, feedbackData: CreateComplaintFeedbackRequestDto): Promise<void> {
    return createFeedback(complaintId, feedbackData);
  }

  static async updateFeedback(feedbackId: number, feedbackData: UpdateComplaintFeedbackRequestDto): Promise<void> {
    return updateFeedback(feedbackId, feedbackData);
  }

  static async deleteFeedback(feedbackId: number): Promise<void> {
    return deleteFeedback(feedbackId);
  }

  static async getAllFeedback(): Promise<ComplaintFeedbackResponseDto[]> {
    return getAllFeedback();
  }
}
