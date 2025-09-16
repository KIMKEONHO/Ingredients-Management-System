import { createContext, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Member = {
  id: number;
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
          console.log('로컬 스토리지에서 사용자 데이터 복원:', parsedUserData);
          // 유효한 사용자 데이터인지 확인 (id가 0이 아니고 nickname이 있는지)
          if (parsedUserData.id && parsedUserData.nickname) {
            _setLoginMember(parsedUserData);
          } else {
            console.log('유효하지 않은 사용자 데이터, 로그아웃 처리');
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userData');
          }
        } catch (error) {
          console.error('사용자 데이터 파싱 실패:', error);
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('userData');
        }
      }
      // 로그인 상태 확인 완료 후 pending 상태 해제
      setLoginMemberPending(false);
    } else {
      // 서버 사이드에서는 항상 pending 상태 해제
      setLoginMemberPending(false);
    }
  }, []);

  const removeLoginMember = () => {
    console.log('로그인 멤버 제거');
    _setLoginMember(createEmptyMember());
    setLoginMemberPending(false);
    
    // 로그인 상태를 로컬 스토리지에서 제거
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userData');
      console.log('로컬 스토리지에서 로그인 상태 제거됨');
    }
  };

  const setLoginMember = (member: Member) => {
    console.log('로그인 멤버 설정:', member);
    _setLoginMember({
      ...member,
      roles: member.roles || ['USER'] // roles가 없으면 기본값으로 USER 설정
    });
    setLoginMemberPending(false);
    
    // 로그인 상태를 로컬 스토리지에 저장
    if (typeof window !== 'undefined') {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userData', JSON.stringify(member));
      console.log('로컬 스토리지에 로그인 상태 저장됨:', {
        isLoggedIn: localStorage.getItem('isLoggedIn'),
        userData: localStorage.getItem('userData')
      });
    }
  };

  const setNoLoginMember = () => {
    console.log('로그인 멤버 제거 (setNoLoginMember)');
    setLoginMemberPending(false);
    
    // 로그인 상태를 로컬 스토리지에서 제거
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userData');
      console.log('로컬 스토리지에서 로그인 상태 제거됨 (setNoLoginMember)');
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