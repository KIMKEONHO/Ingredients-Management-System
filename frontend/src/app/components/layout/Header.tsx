"use client";

import Link from "next/link";
import { useGlobalLoginMember } from "../../stores/auth/loginMamber";
import { useEffect, useRef, useState } from "react";

export default function Header() {
  const { isLogin, loginMember, logoutAndHome } = useGlobalLoginMember();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<
    Array<{ id: number; message: string; read: boolean }>
  >([]);
  const notifRef = useRef<HTMLDivElement>(null);

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
    };
    if (isNotifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotifOpen]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="bg-white p-4 shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-bold text-green-700">
            FreshTracker
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-gray-600">
            <Link href="#" className="hover:text-gray-900">
              재고 통계
            </Link>
            <Link href="#" className="hover:text-gray-900">
              재고 관리
            </Link>
            <Link href="#" className="hover:text-gray-900">
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
          <div className="relative text-xl">
            <span role="img" aria-label="cart">🛒</span>
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-1">3</span>
          </div>
          {isLogin ? (
            <div className="flex items-center gap-3">
              <span className="text-gray-700">{loginMember.nickname}</span>
              <button onClick={logoutAndHome} className="text-gray-600 hover:text-gray-900">로그아웃</button>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-gray-900">로그인</Link>
              <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition">
                회원가입
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}