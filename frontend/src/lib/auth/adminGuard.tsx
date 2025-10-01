"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGlobalLoginMember } from "@/app/stores/auth/loginMamber";

interface AdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AdminGuard({ children, fallback }: AdminGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { loginMember } = useGlobalLoginMember();
  const router = useRouter();

  useEffect(() => {
    const checkAdminAuth = () => {
      if (!loginMember) {
        // 로그인되지 않은 경우 관리자 로그인 페이지로 리다이렉트
        router.push('/admin/login');
        return;
      }

      // 관리자 권한 확인
      const userRoles = loginMember.roles || [];
      
      const isAdmin = userRoles.some((role: string) => 
        role === 'ADMIN' || role === 'ROLE_ADMIN' || role === 'admin'
      );

      if (!isAdmin) {
        // 관리자 권한이 없는 경우 접근 거부 페이지로 리다이렉트
        router.push('/access-denied');
        return;
      }

      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAdminAuth();
  }, [loginMember, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">권한 확인 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return fallback || null;
  }

  return <>{children}</>;
}

// HOC 형태로도 사용할 수 있는 함수
export function withAdminGuard<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AdminGuardedComponent(props: P) {
    return (
      <AdminGuard>
        <Component {...props} />
      </AdminGuard>
    );
  };
}
