
import Link from "next/link";
import { useGlobalLoginMember } from "../stores/auth/loginMamber";

export default function Header() {
  const socialLoginForKakaoUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/oauth2/authorization/kakao`;
  const redirectUrlAfterSocialLogin = 'http://localhost:3000'

  const { isLogin, loginMember, logoutAndHome } = useGlobalLoginMember();

  return (
    <header className="bg-white p-4 shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="text-indigo-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-8 h-8"
            >
              <path
                fillRule="evenodd"
                d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6zm4.5 7.5a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0v-2.25a.75.75 0 0 1 .75-.75zm3.75-1.5a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0V12zm2.25-3a.75.75 0 0 1 .75.75v6.75a.75.75 0 0 1-1.5 0V9.75A.75.75 0 0 1 13.5 9zm3.75-1.5a.75.75 0 0 0-1.5 0v9a.75.75 0 0 0 1.5 0v-9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <nav className="flex space-x-6 text-gray-700">
            <a href="#" className="border-b-2 border-indigo-600 pb-1">
              홈
            </a>
            <a href="#" className="hover:text-indigo-600">
              카테고리
            </a>
            <a href="#" className="hover:text-indigo-600">
              인기글
            </a>
            <a href="#" className="hover:text-indigo-600">
              태그
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="검색"
              className="pl-3 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5zM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          {/* 카카오 로그인 (필요한 경우 활성화) */}
          {isLogin ? (
            <div className="flex items-center gap-4">
              <div>{loginMember.nickname}</div>
              <button onClick={logoutAndHome}>로그아웃</button>
            </div>
          ) : (
            <>
              <div className="bg-yellow-400 text-black px-4 py-2 rounded-md hover:bg-yellow-500 transition">
                <Link
                  href={`${socialLoginForKakaoUrl}?redirectUrl=${redirectUrlAfterSocialLogin}`}
                >
                  <span className="font-bold">카카오 로그인</span>
                </Link>
              </div>
              <button className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition">
                회원가입
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}