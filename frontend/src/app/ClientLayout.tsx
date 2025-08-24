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
        fetch('http://localhost:8090/api/v1/users/me', {
            credentials: 'include',
        })
            .then((response) => response.json())
            .then((data) => {
                setLoginMember(data)
            })
            .catch((error) => {
                setNoLoginMember()
            })
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