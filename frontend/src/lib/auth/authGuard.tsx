'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useGlobalLoginMember } from '@/app/stores/auth/loginMamber';
import { AuthService } from '@/lib/api/services/authService';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  redirectTo?: string;
}

export function AuthGuard({ 
  children, 
  requiredRoles = [], 
  redirectTo = '/login' 
}: AuthGuardProps) {
  const { isLogin, loginMember, isLoginMemberPending } = useGlobalLoginMember();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 로딩 중이면 대기
        if (isLoginMemberPending) {
          return;
        }

        // 로그인 상태 확인
        if (!isLogin) {
          console.log('로그인되지 않음, 로그인 페이지로 이동');
          router.push(redirectTo);
          return;
        }

        // 쿠키 존재 여부 확인
        if (!AuthService.hasAuthCookie()) {
          console.log('인증 쿠키 없음, 로그인 페이지로 이동');
          router.push(redirectTo);
          return;
        }

        // 권한 확인
        if (requiredRoles.length > 0) {
          const hasRequiredRole = requiredRoles.some(role => 
            loginMember.roles?.includes(role)
          );
          
          if (!hasRequiredRole) {
            console.log('권한 부족, 접근 거부 페이지로 이동');
            router.push('/access-denied');
            return;
          }
        }

        console.log('인증 성공, 페이지 렌더링');
        setIsAuthorized(true);
      } catch (error) {
        console.error('인증 확인 중 오류:', error);
        router.push(redirectTo);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [isLogin, loginMember, requiredRoles, router, redirectTo, isLoginMemberPending]);

  // 로딩 중이거나 로그인 상태 확인 중일 때
  if (isLoginMemberPending || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-2xl font-bold">인증 확인 중...</div>
      </div>
    );
  }

  // 인증되지 않은 경우
  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

// 관리자 전용 가드
export function AdminGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRoles={['ADMIN', 'ROLE_ADMIN']} redirectTo="/admin/login">
      {children}
    </AuthGuard>
  );
}

// 사용자 전용 가드
export function UserGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRoles={['USER', 'ROLE_USER']} redirectTo="/login">
      {children}
    </AuthGuard>
  );
}
