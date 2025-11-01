"use client";

import Link from "next/link";
import { useGlobalLoginMember } from "../../stores/auth/loginMamber";
import { useEffect, useRef, useState } from "react";
import { useNotifications, useSSENotifications } from "../../../lib/hooks/useNotifications";
import { NotificationResponseDto } from "../../../lib/api/services/notificationService";

export default function Header() {
  const { isLogin, loginMember, logoutAndHome } = useGlobalLoginMember();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // 알람 관련 훅 사용 (로그인한 사용자만)
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refreshNotifications
  } = useNotifications(isLogin);

  // SSE 연결로 실시간 알람 수신 (로그인한 사용자만)
  useSSENotifications((newNotification: NotificationResponseDto) => {
    // 새 알람이 오면 알람 목록 새로고침
    refreshNotifications();
  }, isLogin);

  // 알람 클릭 시 읽음 처리
  const handleNotificationClick = async (notification: NotificationResponseDto) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
  };

  // 알람 삭제 처리
  const handleDeleteNotification = async (notificationId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  // 모든 알람 일괄 삭제 처리
  const handleDeleteAllNotifications = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('모든 알람을 삭제하시겠습니까?')) {
      await deleteAllNotifications();
    }
  };

  // 알람 타입에 따른 아이콘 반환
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'LIKE':
        return '❤️';
      case 'COMPLAINT':
        return '📝';
      case 'EXPIRING_SOON':
        return '⚠️';
      default:
        return '🔔';
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isNotifOpen || isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotifOpen, isUserMenuOpen]);

  // 모든 알람 읽음 처리
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleFeatureClick = (e: React.MouseEvent, featurePath: string) => {
    if (!isLogin) {
      e.preventDefault();
      // 로그인 페이지로 이동
      window.location.href = '/login';
    }
  };

  return (
    <header className="bg-white p-4 shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            <img 
              src="https://dev-bucket-lolgun0629-1.s3.ap-northeast-2.amazonaws.com/default/mkfood_letter_logo_nuggi_v3.png" 
              alt="MKFood Logo" 
              className="h-10 w-auto hover:opacity-80 transition-opacity"
            />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-gray-600">
            <Link 
              href="/callender" 
              className="hover:text-gray-900"
              onClick={(e) => handleFeatureClick(e, '/callender')}
            >
              식단 관리
            </Link>
            <Link 
              href="/recipe-recommendation" 
              className="hover:text-gray-900"
              onClick={(e) => handleFeatureClick(e, '/recipe-recommendation')}
            >
              레시피 추천
            </Link>
            <Link 
              href="/recipe-community" 
              className="hover:text-gray-900"
              onClick={(e) => handleFeatureClick(e, '/recipe-community')}
            >
              레시피 공유
            </Link>
            <Link 
              href="/statistics" 
              className="hover:text-gray-900"
              onClick={(e) => handleFeatureClick(e, '/statistics')}
            >
              재고 통계
            </Link>
            <Link href="/inventory" className="hover:text-gray-900">
              재고 관리
            </Link>
            <Link href="/support" className="hover:text-gray-900">
              고객 지원
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {isLogin && (
            <div className="relative text-xl" ref={notifRef}>
              <button
                aria-label="알림 보기"
                className="relative"
                onClick={() => setIsNotifOpen((prev) => !prev)}
              >
                <span role="img" aria-label="bell">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
                    {unreadCount}
                  </span>
                )}
              </button>
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border rounded-md shadow-lg z-50">
                <div className="px-3 py-2 border-b text-sm font-semibold flex items-center justify-between">
                  <span>알림</span>
                  <div className="flex items-center gap-2">
                    {notifications.length > 0 && (
                      <button 
                        onClick={handleDeleteAllNotifications}
                        className="text-xs text-red-600 hover:underline"
                        title="모든 알림 삭제"
                      >
                        🗑️ 전체삭제
                      </button>
                    )}
                    <button 
                      onClick={refreshNotifications}
                      className="text-xs text-blue-600 hover:underline"
                      title="새로고침"
                    >
                      🔄
                    </button>
                    {isLoading && (
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </div>
                </div>
                
                {error && (
                  <div className="px-3 py-2 text-sm text-red-500 bg-red-50">
                    {error}
                  </div>
                )}
                
                <ul className="max-h-64 overflow-auto">
                  {notifications.length === 0 ? (
                    <li className="px-3 py-3 text-sm text-gray-500">새 알림이 없습니다.</li>
                  ) : (
                    notifications.map((notification) => (
                      <li
                        key={notification.id}
                        className={`px-3 py-3 text-sm hover:bg-gray-50 cursor-pointer relative group ${
                          notification.isRead ? "text-gray-500" : "text-gray-800 bg-blue-50"
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 flex items-start gap-2">
                            <span className="text-lg mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </span>
                            <div className="flex-1">
                              <div className="font-medium text-xs text-gray-600 mb-1">
                                {notification.title}
                              </div>
                              <div className="text-sm">
                                {notification.message}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {new Date(notification.createdAt).toLocaleString('ko-KR')}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={(e) => handleDeleteNotification(notification.id, e)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 ml-2 p-1"
                            title="삭제"
                          >
                            ×
                          </button>
                        </div>
                        {!notification.isRead && (
                          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </li>
                    ))
                  )}
                </ul>
                
                {notifications.length > 0 && (
                  <div className="px-3 py-2 border-t text-xs flex items-center justify-between">
                    <span className="text-gray-500">읽지 않은 알림 {unreadCount}개</span>
                    <button 
                      onClick={handleMarkAllAsRead} 
                      className="text-green-600 hover:underline disabled:opacity-50"
                      disabled={unreadCount === 0}
                    >
                      모두 읽음
                    </button>
                  </div>
                )}
              </div>
            )}
            </div>
          )}
          {isLogin ? (
            <div className="flex items-center gap-3">
              {/* 사용자 프로필 영역 */}
              <div className="flex items-center gap-3">
                {/* 프로필 이미지 또는 아바타 */}
                <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border-2 border-gray-200 shadow-sm">
                  {loginMember.profile ? (
                    <img 
                      src={loginMember.profile} 
                      alt={`${loginMember.nickname}의 프로필`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // 이미지 로드 실패 시 아바타로 대체
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                              ${loginMember.nickname ? loginMember.nickname.charAt(0).toUpperCase() : 'U'}
                            </div>
                          `;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                      {(loginMember?.nickname || loginMember?.name) ? (loginMember?.nickname || loginMember?.name)?.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>
                {/* 닉네임 (마이페이지 링크) */}
                <Link 
                  href="/mypage" 
                  className="text-gray-700 hover:text-gray-900 font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center gap-1"
                >
                  <span>{loginMember.nickname || loginMember.name || '사용자'}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
              </div>
              
              {/* 사용자 메뉴 드롭다운 */}
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="text-gray-600 hover:text-gray-900 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
                >
                  ▼
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <Link 
                        href="/mypage" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        마이페이지
                      </Link>
                      <hr className="my-1" />
                      <button 
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logoutAndHome();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        로그아웃
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-gray-900">로그인</Link>
              <Link href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}