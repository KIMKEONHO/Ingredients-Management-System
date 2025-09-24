import { apiClient } from '../client';
import { API_ENDPOINTS, createApiUrl } from '../endpoints';

// 404 오류인지 확인하는 헬퍼 함수
const isNotFoundError = (error: unknown): boolean => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = error.response as { status?: number };
    return response.status === 404;
  }
  return false;
};

// AxiosError인지 확인하는 헬퍼 함수
const isAxiosError = (error: unknown): boolean => {
  return Boolean(error && typeof error === 'object' && 'isAxiosError' in error);
};

// HTTP 상태 코드를 가져오는 헬퍼 함수
const getHttpStatus = (error: unknown): number | null => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = error.response as { status?: number };
    return response.status || null;
  }
  return null;
};

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
    
    // 응답 데이터가 있는지 확인
    if (response && response.data) {
      return response.data;
    }
    
    // 피드백이 없는 경우 null 반환 (오류가 아님)
    console.log('피드백이 존재하지 않습니다:', { complaintId });
    return null;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    const errorStatus = getHttpStatus(error);
    const isAxiosErr = isAxiosError(error);
    
    console.log('피드백 조회 오류 상세:', {
      complaintId,
      isAxiosError: isAxiosErr,
      errorStatus,
      errorMessage
    });
    
    // 404 오류인 경우 피드백이 없는 것으로 처리 (정상적인 상황)
    if (isNotFoundError(error)) {
      console.log('피드백이 존재하지 않습니다 (404) - 정상적인 상황:', { complaintId });
      return null;
    }
    
    // 404가 아닌 HTTP 오류인 경우
    if (isAxiosErr && errorStatus && errorStatus >= 400 && errorStatus !== 404) {
      console.error('피드백 조회 중 HTTP 오류:', {
        complaintId,
        status: errorStatus,
        message: errorMessage
      });
      throw new Error(`피드백을 조회할 수 없습니다. (HTTP ${errorStatus})`);
    }
    
    // 네트워크 오류나 기타 오류
    console.error('피드백 조회 중 예상치 못한 오류:', {
      complaintId,
      error: errorMessage,
      isAxiosError: isAxiosErr,
      errorStatus
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
