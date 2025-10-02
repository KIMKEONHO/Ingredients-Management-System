"use client";

import { useState, useEffect, useCallback } from 'react';
import { notificationService, NotificationResponseDto } from '@/lib/api/services/notificationService';

interface UseNotificationsReturn {
  notifications: NotificationResponseDto[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

export function useNotifications(shouldFetch: boolean = true): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<NotificationResponseDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 알람 목록 조회
  const fetchNotifications = useCallback(async () => {
    if (!shouldFetch) {
      console.log('알람 조회 건너뜀: shouldFetch = false');
      return;
    }
    
    try {
      console.log('알람 목록 조회 시작...');
      setIsLoading(true);
      setError(null);
      
      const [notificationsResponse, countResponse] = await Promise.all([
        notificationService.getUserNotifications(),
        notificationService.getUnreadNotificationCount()
      ]);

      console.log('알람 목록 응답:', notificationsResponse);
      console.log('알람 목록 응답 타입:', typeof notificationsResponse);
      console.log('알람 목록 응답 구조:', JSON.stringify(notificationsResponse, null, 2));
      console.log('읽지 않은 알람 개수 응답:', countResponse);
      console.log('읽지 않은 알람 개수 응답 타입:', typeof countResponse);
      console.log('읽지 않은 알람 개수 응답 구조:', JSON.stringify(countResponse, null, 2));

      // 알람 목록 설정 - RsData 형태로 응답
      if (notificationsResponse && notificationsResponse.resultCode === '200') {
        setNotifications(notificationsResponse.data);
        console.log('알람 목록 설정 완료:', notificationsResponse.data);
      } else {
        console.error('알람 목록 조회 실패:', notificationsResponse?.msg || '응답이 없습니다');
        console.error('알람 목록 응답 전체:', notificationsResponse);
        setError(notificationsResponse?.msg || '알람 목록을 불러올 수 없습니다.');
      }
      
      // 읽지 않은 알람 개수 설정 - RsData 형태로 응답
      if (countResponse && countResponse.resultCode === '200') {
        setUnreadCount(countResponse.data);
        console.log('읽지 않은 알람 개수 설정 완료:', countResponse.data);
      } else {
        console.error('읽지 않은 알람 개수 조회 실패:', countResponse?.msg || '응답이 없습니다');
        console.error('읽지 않은 알람 개수 응답 전체:', countResponse);
        setError(countResponse?.msg || '읽지 않은 알람 개수를 불러올 수 없습니다.');
      }
    } catch (err) {
      console.error('알람 조회 실패:', err);
      setError('알람을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [shouldFetch]);

  // 알람 읽음 처리
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      const response = await notificationService.markAsRead(notificationId);
      console.log('markAsRead 응답:', response);
      
      if (response && response.resultCode === '200') {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, isRead: true, readAt: new Date().toISOString() }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        console.log('알람 읽음 처리 완료:', response.msg);
      } else {
        console.error('알람 읽음 처리 실패:', response?.msg || '응답이 없습니다');
        console.error('markAsRead 응답 전체:', response);
        setError(response?.msg || '알람 읽음 처리에 실패했습니다.');
      }
    } catch (err) {
      console.error('알람 읽음 처리 실패:', err);
      setError('알람 읽음 처리에 실패했습니다.');
    }
  }, []);

  // 모든 알람 읽음 처리
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await notificationService.markAllAsRead();
      console.log('markAllAsRead 응답:', response);
      
      if (response && response.resultCode === '200') {
        setNotifications(prev => 
          prev.map(notification => ({
            ...notification,
            isRead: true,
            readAt: new Date().toISOString()
          }))
        );
        setUnreadCount(0);
        console.log('모든 알람 읽음 처리 완료:', response.msg);
      } else {
        console.error('모든 알람 읽음 처리 실패:', response?.msg || '응답이 없습니다');
        console.error('markAllAsRead 응답 전체:', response);
        setError(response?.msg || '모든 알람 읽음 처리에 실패했습니다.');
      }
    } catch (err) {
      console.error('모든 알람 읽음 처리 실패:', err);
      setError('모든 알람 읽음 처리에 실패했습니다.');
    }
  }, []);

  // 알람 삭제
  const deleteNotification = useCallback(async (notificationId: number) => {
    try {
      const response = await notificationService.deleteNotification(notificationId);
      console.log('deleteNotification 응답:', response);
      
      if (response && response.resultCode === '200') {
        setNotifications(prev => {
          const deletedNotification = prev.find(n => n.id === notificationId);
          const newNotifications = prev.filter(n => n.id !== notificationId);
          
          // 삭제된 알람이 읽지 않은 상태였다면 카운트 감소
          if (deletedNotification && !deletedNotification.isRead) {
            setUnreadCount(prevCount => Math.max(0, prevCount - 1));
          }
          
          return newNotifications;
        });
        console.log('알람 삭제 완료:', response.msg);
      } else {
        console.error('알람 삭제 실패:', response?.msg || '응답이 없습니다');
        console.error('deleteNotification 응답 전체:', response);
        setError(response?.msg || '알람 삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('알람 삭제 실패:', err);
      setError('알람 삭제에 실패했습니다.');
    }
  }, []);

  // 알람 일괄 삭제
  const deleteAllNotifications = useCallback(async () => {
    try {
      console.log('알람 일괄 삭제 시작, 총 개수:', notifications.length);
      
      // 모든 알람을 개별적으로 삭제
      const deletePromises = notifications.map(notification => 
        notificationService.deleteNotification(notification.id)
      );
      
      const responses = await Promise.all(deletePromises);
      console.log('일괄 삭제 응답들:', responses);
      
      // 모든 삭제가 성공했는지 확인
      const allSuccessful = responses.every(response => 
        response && response.resultCode === '200'
      );
      
      if (allSuccessful) {
        // 모든 알람 제거
        setNotifications([]);
        setUnreadCount(0);
        console.log('모든 알람 삭제 완료');
      } else {
        console.error('일부 알람 삭제 실패');
        setError('일부 알람 삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('알람 일괄 삭제 실패:', err);
      setError('알람 일괄 삭제에 실패했습니다.');
    }
  }, [notifications]);

  // 알람 목록 새로고침
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  // SSE 알람 처리 콜백
  const handleSSENotification = useCallback((notification: NotificationResponseDto) => {
    console.log('SSE로 받은 새 알람 처리:', notification);
    
    // 새로운 알람을 목록에 추가
    setNotifications(prev => [notification, ...prev]);
    
    // 읽지 않은 알람 개수 증가
    if (!notification.isRead) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  // 컴포넌트 마운트 시 알람 목록 조회
  useEffect(() => {
    if (shouldFetch) {
      fetchNotifications();
    }
  }, [fetchNotifications, shouldFetch]);

  // SSE 연결 설정
  useSSENotifications(handleSSENotification, shouldFetch);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refreshNotifications
  };
}

// SSE 연결을 위한 훅
export function useSSENotifications(onNotification: (notification: NotificationResponseDto) => void, shouldConnect: boolean = true) {
  useEffect(() => {
    if (!shouldConnect) {
      console.log('SSE 연결 건너뜀: shouldConnect = false');
      return;
    }
    
    console.log('SSE 연결 시작...');
    let eventSource: EventSource | null = null;

    const connectSSE = () => {
      try {
        console.log('SSE 연결 시도...');
        eventSource = notificationService.createSSEConnection();

        eventSource.onopen = () => {
          console.log('SSE 연결 성공');
        };

        eventSource.onmessage = (event) => {
          console.log('SSE 메시지 수신:', event.data);
          try {
            const data = JSON.parse(event.data);
            console.log('SSE 메시지 파싱 결과:', data);
            if (data.resultCode === '200') {
              console.log('새 알람 수신:', data.data);
              onNotification(data.data);
            }
          } catch (err) {
            console.error('SSE 메시지 파싱 실패:', err, '원본 데이터:', event.data);
          }
        };

        eventSource.addEventListener('notification', (event) => {
          console.log('SSE notification 이벤트 수신:', event.data);
          try {
            const notification = JSON.parse(event.data);
            console.log('SSE 알람 파싱 결과:', notification);
            
            // 콜백 함수를 통해 알람 처리
            onNotification(notification);
          } catch (err) {
            console.error('SSE 알람 파싱 실패:', err, '원본 데이터:', event.data);
          }
        });

        eventSource.onerror = (error) => {
          console.error('SSE 연결 오류:', error);
          console.log('SSE 연결 상태:', eventSource?.readyState);
          // 연결 재시도
          setTimeout(() => {
            if (eventSource && eventSource.readyState === EventSource.CLOSED) {
              console.log('SSE 재연결 시도...');
              connectSSE();
            }
          }, 5000);
        };
      } catch (err) {
        console.error('SSE 연결 실패:', err);
      }
    };

    connectSSE();

    return () => {
      console.log('SSE 연결 정리...');
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [onNotification, shouldConnect]);
}
