'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useLoginMember } from './stores/auth/loginMamber'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import { LoginMemberContext } from './stores/auth/loginMamber'

export function ClientLayout({ children }: { children: React.ReactNode }) {
    const { loginMember, setLoginMember, setNoLoginMember, isLoginMemberPending, isLogin, logout, logoutAndHome } =
        useLoginMember()
    const pathname = usePathname()

    // 전역관리를 위한 Store 등록 - context api 사용
    const loginMemberContextValue = {
        loginMember,
        setLoginMember,
        isLoginMemberPending,
        isLogin,
        logout,
        logoutAndHome,
    }

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                console.log('로그인 상태 확인 중...');
                
                // 로컬 스토리지에서 로그인 상태 먼저 확인
                const isLoggedInLocal = localStorage.getItem('isLoggedIn') === 'true';
                const userData = localStorage.getItem('userData');
                
                if (isLoggedInLocal && userData) {
                    try {
                        const parsedUserData = JSON.parse(userData);
                        console.log('로컬 스토리지에서 사용자 데이터 복원:', parsedUserData);
                        setLoginMember(parsedUserData);
                        return; // 로컬 데이터가 있으면 API 호출 생략
                    } catch (error) {
                        console.error('사용자 데이터 파싱 실패:', error);
                        localStorage.removeItem('isLoggedIn');
                        localStorage.removeItem('userData');
                    }
                }
                
                // 백엔드 API 호출로 인증 상태 확인 (선택적)
                try {
                    const response = await fetch('http://localhost:8090/api/v1/users/me', {
                        credentials: 'include',
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        console.log('백엔드 로그인 성공:', data);
                        setLoginMember(data);
                    } else {
                        console.log('백엔드 로그인 실패:', response.status);
                        // 백엔드 실패 시에도 로컬 상태는 유지
                        if (!isLoggedInLocal) {
                            setNoLoginMember();
                        }
                    }
                } catch (error) {
                    console.error('백엔드 API 호출 실패:', error);
                    // 백엔드 연결 실패 시에도 로컬 상태는 유지
                    if (!isLoggedInLocal) {
                        setNoLoginMember();
                    }
                }
            } catch (error) {
                console.error('로그인 상태 확인 중 오류:', error);
                // 에러 발생 시에도 로컬 상태는 유지
                const isLoggedInLocal = localStorage.getItem('isLoggedIn') === 'true';
                if (!isLoggedInLocal) {
                    setNoLoginMember();
                }
            }
        };

        checkAuthStatus();
        
        // 페이지 이동 시 인증 상태 재확인을 위한 이벤트 리스너 추가
        const handleRouteChange = () => {
            checkAuthStatus();
        };
        
        // 페이지 포커스 시 인증 상태 재확인
        const handleFocus = () => {
            checkAuthStatus();
        };
        
        window.addEventListener('focus', handleFocus);
        
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [pathname]) // pathname을 의존성으로 추가하여 페이지 이동 시마다 실행

    if (isLoginMemberPending) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-2xl font-bold">로딩중...</div>
            </div>
        )
    }

    // 관리자 로그인 페이지일 때는 헤더와 푸터 없이 렌더링
    if (pathname === '/admin/login') {
        return (
            <LoginMemberContext value={loginMemberContextValue}>
                {children}
            </LoginMemberContext>
        )
    }

    return (
        <LoginMemberContext value={loginMemberContextValue}>
            <main className="flex flex-col min-h-screen">
                {/* 헤더 영역 */}
                <Header />
                {children}
                {/* 푸터 영역 */}
                <Footer />
            </main>
        </LoginMemberContext>
    )
}