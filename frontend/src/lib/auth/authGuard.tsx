'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGlobalLoginMember } from '@/app/stores/auth/loginMamber';

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
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 로딩 중이면 대기
        if (isLoginMemberPending) {
          return;
        }

        // 로컬 스토리지에서 로그인 상태 확인 (우선 확인)
        const isLoggedInLocal = typeof window !== 'undefined' && localStorage.getItem('isLoggedIn') === 'true';
        const userData = typeof window !== 'undefined' && localStorage.getItem('userData');
        
        
        // 로컬 스토리지에 로그인 정보가 있으면 인증 성공으로 처리
        if (isLoggedInLocal && userData) {
          try {
            const parsedUserData = JSON.parse(userData);
            
            // 권한 확인 (requiredRoles가 있을 때만)
            if (requiredRoles.length > 0) {
              const hasRequiredRole = requiredRoles.some(role => 
                parsedUserData.roles?.includes(role)
              );
              
              if (!hasRequiredRole) {
                router.push('/access-denied');
                return;
              }
            }
            
            console.log('로컬 스토리지 기반 인증 성공, 페이지 렌더링');
            setIsAuthorized(true);
            return;
          } catch (error) {
            console.error('사용자 데이터 파싱 실패:', error);
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userData');
          }
        }
        
        // 전역 상태에서 로그인 상태 확인
        if (!isLogin) {
          // 현재 URL을 저장하여 로그인 후 원래 페이지로 돌아갈 수 있도록 함
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
          }
          router.push(redirectTo);
          return;
        }

        // 로그인된 상태이므로 인증 성공
        console.log('전역 상태 기반 인증 성공, 페이지 렌더링');
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-2xl font-bold text-gray-700">인증 확인 중...</div>
          <div className="text-gray-500 mt-2">잠시만 기다려주세요</div>
        </div>
      </div>
    );
  }

  // 인증되지 않은 경우
  if (!isAuthorized) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h1>
          <p className="text-gray-600 mb-6">
            이 기능을 사용하려면 로그인이 필요합니다.<br />
            로그인 후 다시 시도해주세요.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push(redirectTo)}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              로그인하기
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
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
    <AuthGuard requiredRoles={[]} redirectTo="/login">
      {children}
    </AuthGuard>
  );
}
