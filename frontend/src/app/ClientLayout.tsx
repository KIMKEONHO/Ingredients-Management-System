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
                const response = await fetch('http://localhost:8090/api/v1/users/me', {
                    credentials: 'include',
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('로그인 성공:', data);
                    setLoginMember(data);
                } else {
                    console.log('로그인 실패:', response.status);
                    setNoLoginMember();
                }
            } catch (error) {
                console.error('로그인 상태 확인 중 오류:', error);
                setNoLoginMember();
            }
        };

        checkAuthStatus();
    }, [])

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