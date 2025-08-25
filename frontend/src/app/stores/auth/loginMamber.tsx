import { createContext, useState, use } from "react";
import { useRouter } from "next/navigation";

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

  const removeLoginMember = () => {
    _setLoginMember(createEmptyMember());
    setLoginMemberPending(false);
  };

  const setLoginMember = (member: Member) => {
    console.log('로그인 멤버 설정:', member);
    _setLoginMember({
      ...member,
      roles: member.roles || ['USER'] // roles가 없으면 기본값으로 USER 설정
    });
    setLoginMemberPending(false);
  };

  const setNoLoginMember = () => {
    console.log('로그인 멤버 제거');
    setLoginMemberPending(false);
  };

  const isLogin = loginMember.id !== 0;

  const logout = (callback: () => void) => {
    fetch("http://localhost:8090/api/v1/members/logout", {
      method: "DELETE",
      credentials: "include",
    }).then(() => {
      removeLoginMember();
      callback();
    });
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