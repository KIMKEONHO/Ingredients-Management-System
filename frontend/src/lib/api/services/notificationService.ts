import { apiClient } from '../client';
import { API_ENDPOINTS, createApiUrl } from '../endpoints';

export interface NotificationResponseDto {
  id: number;
  type: 'LIKE' | 'COMPLAINT' | 'EXPIRING_SOON';
  title: string;
  message: string;
  data: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

// RsData 응답 타입 정의
export interface RsData<T> {
  resultCode: string;
  msg: string;
  data: T;
}

export interface NotificationListResponse extends RsData<NotificationResponseDto[]> {}
export interface NotificationCountResponse extends RsData<number> {}
export interface NotificationResponse extends RsData<null> {}

class NotificationService {
  /**
   * 사용자의 알람 목록 조회
   */
  async getUserNotifications(page: number = 0, size: number = 20): Promise<NotificationListResponse> {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.NOTIFICATIONS.BASE}?page=${page}&size=${size}`);
      console.log('getUserNotifications 원본 응답:', response);
      return response as NotificationListResponse;
    } catch (error) {
      console.error('getUserNotifications 에러:', error);
      throw error;
    }
  }

  /**
   * 사용자의 읽지 않은 알람 개수 조회
   */
  async getUnreadNotificationCount(): Promise<NotificationCountResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
      console.log('getUnreadNotificationCount 원본 응답:', response);
      return response as NotificationCountResponse;
    } catch (error) {
      console.error('getUnreadNotificationCount 에러:', error);
      throw error;
    }
  }

  /**
   * 알람 읽음 처리
   */
  async markAsRead(notificationId: number): Promise<NotificationResponse> {
    try {
      const url = createApiUrl(API_ENDPOINTS.NOTIFICATIONS.MARK_READ, { notificationId });
      const response = await apiClient.patch(url);
      console.log('markAsRead 원본 응답:', response);
      return response as NotificationResponse;
    } catch (error) {
      console.error('markAsRead 에러:', error);
      throw error;
    }
  }

  /**
   * 모든 알람 읽음 처리
   */
  async markAllAsRead(): Promise<NotificationResponse> {
    try {
      const response = await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
      console.log('markAllAsRead 원본 응답:', response);
      return response as NotificationResponse;
    } catch (error) {
      console.error('markAllAsRead 에러:', error);
      throw error;
    }
  }

  /**
   * 알람 삭제
   */
  async deleteNotification(notificationId: number): Promise<NotificationResponse> {
    try {
      const url = createApiUrl(API_ENDPOINTS.NOTIFICATIONS.DELETE, { notificationId });
      const response = await apiClient.delete(url);
      console.log('deleteNotification 원본 응답:', response);
      return response as NotificationResponse;
    } catch (error) {
      console.error('deleteNotification 에러:', error);
      throw error;
    }
  }

  /**
   * SSE 연결 생성 (실시간 알람 수신)
   */
  createSSEConnection(): EventSource {
    // 쿠키 기반 인증 사용 (토큰 파라미터 제거)
    const API_BASE_URL = 'http://localhost:8090';
    const fullUrl = `${API_BASE_URL}${API_ENDPOINTS.NOTIFICATIONS.STREAM}`;
    console.log('SSE 연결 URL:', fullUrl);
    return new EventSource(fullUrl, {
      withCredentials: true
    });
  }
}

export const notificationService = new NotificationService();
