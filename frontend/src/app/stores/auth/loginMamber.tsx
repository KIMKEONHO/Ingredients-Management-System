import { createContext, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Member = {
  id: number;
  userId?: number; // 백엔드 응답의 userId 필드
  email?: string; // 백엔드 응답의 email 필드
  name?: string; // 백엔드 응답의 name 필드
  profile?: string; // 백엔드 응답의 profile 필드
  createDate: string;
  modifyDate: string;
  nickname: string;
  roles?: string[]; // roles 필드 추가
};

export const LoginMemberContext = createContext<{
  loginMember: Member;
  setLoginMember: (member: Member) => void;
  isLoginMemberPending: boolean;
  isLogin: boolean;
  logout: (callback: () => void) => void;
  logoutAndHome: () => void;
}>({
  loginMember: createEmptyMember(),
  setLoginMember: () => {},
  isLoginMemberPending: true,
  isLogin: false,
  logout: () => {},
  logoutAndHome: () => {},
});

function createEmptyMember(): Member {
  return {
    id: 0,
    createDate: "",
    modifyDate: "",
    nickname: "",
    roles: [], // 기본값으로 빈 배열 설정
  };
}

export function useLoginMember() {
  const router = useRouter();

  const [isLoginMemberPending, setLoginMemberPending] = useState(true);
  const [loginMember, _setLoginMember] = useState<Member>(createEmptyMember());

  // 컴포넌트 마운트 시 로컬 스토리지에서 로그인 상태 복원
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      const userData = localStorage.getItem('userData');
      
      if (isLoggedIn === 'true' && userData) {
        try {
          const parsedUserData = JSON.parse(userData);
          _setLoginMember(parsedUserData);
        } catch (error) {
          console.error('사용자 데이터 파싱 실패:', error);
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('userData');
        }
      }
      setLoginMemberPending(false);
    }
  }, []);

  const removeLoginMember = () => {
    _setLoginMember(createEmptyMember());
    setLoginMemberPending(false);
    
    // 로그인 상태를 로컬 스토리지에서 제거
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userData');
    }
  };

  const setLoginMember = (member: Member) => {
    _setLoginMember({
      ...member,
      roles: member.roles || ['USER'] // roles가 없으면 기본값으로 USER 설정
    });
    setLoginMemberPending(false);
    
    // 로그인 상태를 로컬 스토리지에 저장
    if (typeof window !== 'undefined') {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userData', JSON.stringify(member));
    }
  };

  const setNoLoginMember = () => {
    setLoginMemberPending(false);
    
    // 로그인 상태를 로컬 스토리지에서 제거
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userData');
    }
  };

  const isLogin = loginMember.id !== 0;

  const logout = async (callback: () => void) => {
    try {
      const { AuthService } = await import('@/lib/api/services/authService');
      const result = await AuthService.logout();
      
      if (result.success) {
        removeLoginMember();
        callback();
      } else {
        console.error('로그아웃 실패:', result.error);
        // 로그아웃 실패해도 로컬 상태는 정리
        removeLoginMember();
        callback();
      }
    } catch (error) {
      console.error('로그아웃 에러:', error);
      // 에러가 발생해도 로컬 상태는 정리
      removeLoginMember();
      callback();
    }
  };

  const logoutAndHome = () => {
    logout(() => router.replace("/"));
  };

  return {
    loginMember,
    setLoginMember,
    isLoginMemberPending,
    setNoLoginMember,
    isLogin,

    logout,
    logoutAndHome,
  };
}

export function useGlobalLoginMember() {
  return use(LoginMemberContext);
}