"use client";

import Link from "next/link";
import { useGlobalLoginMember } from "../../stores/auth/loginMamber";
import { useEffect, useRef, useState } from "react";

export default function Header() {
  const { isLogin, loginMember, logoutAndHome } = useGlobalLoginMember();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const [notifications, setNotifications] = useState<
    Array<{ id: number; message: string; read: boolean }>
  >([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    // 초기 더미 알림 데이터 (필요 시 API 연동으로 대체)
    setNotifications([
      { id: 1, message: "발주 요청이 승인되었습니다.", read: false },
      { id: 2, message: "재고 임계값을 초과했습니다.", read: false },
      { id: 3, message: "이번 주 만료 예정 재료가 있습니다.", read: true },
    ]);
  }, []);

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

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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
              src="https://dev-bucket-lolgun0629-1.s3.ap-northeast-2.amazonaws.com/img1/default/mkfood_letter_logo_nuggi_v3.png" 
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
              <div className="absolute right-0 mt-2 w-72 bg-white border rounded-md shadow-lg z-50">
                <div className="px-3 py-2 border-b text-sm font-semibold">알림</div>
                <ul className="max-h-64 overflow-auto">
                  {notifications.length === 0 ? (
                    <li className="px-3 py-3 text-sm text-gray-500">새 알림이 없습니다.</li>
                  ) : (
                    notifications.map((n) => (
                      <li
                        key={n.id}
                        className={`px-3 py-3 text-sm hover:bg-gray-50 ${
                          n.read ? "text-gray-500" : "text-gray-800"
                        }`}
                      >
                        {n.message}
                      </li>
                    ))
                  )}
                </ul>
                <div className="px-3 py-2 border-t text-xs flex items-center justify-between">
                  <span className="text-gray-500">읽지 않은 알림 {unreadCount}개</span>
                  <button onClick={markAllAsRead} className="text-green-600 hover:underline">
                    모두 읽음
                  </button>
                </div>
              </div>
            )}
          </div>
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
                      {(loginMember.nickname || loginMember.name) ? (loginMember.nickname || loginMember.name).charAt(0).toUpperCase() : 'U'}
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