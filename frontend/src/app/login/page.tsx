"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const socialLoginForKakaoUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/oauth2/authorization/kakao`;
  const socialLoginForGoogleUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/oauth2/authorization/google`;
  const redirectUrlAfterSocialLogin = 'http://localhost:3000';

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-lime-100 flex items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5">
        <section className="w-full max-w-lg mx-auto">
        <div className="mb-6 text-center">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-white font-bold">FM</div>
          <h1 className="mt-4 text-3xl font-bold text-green-800">로그인</h1>
          <p className="mt-1 text-sm text-green-700/70">계정에 로그인하세요</p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-black/5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="space-y-5"
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                이메일 또는 아이디
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path d="M1.5 6.75A2.25 2.25 0 013.75 4.5h16.5A2.25 2.25 0 0122.5 6.75v10.5A2.25 2.25 0 0120.25 19.5H3.75A2.25 2.25 0 011.5 17.25V6.75zm1.91-.53a.75.75 0 00-.66 1.34l8.25 4.125a.75.75 0 00.66 0l8.25-4.125a.75.75 0 10-.66-1.34L12 10.06 3.41 6.22z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="이메일 또는 아이디를 입력하세요"
                  className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path d="M12 2a5 5 0 00-5 5v3H6a2 2 0 00-2 2v7a2 2 0 002 2h12a2 2 0 002-2v-7a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zm-3 8V7a3 3 0 116 0v3H9z" />
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="비밀번호를 입력하세요"
                  className="w-full rounded-lg border border-gray-300 pl-10 pr-10 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <button
                  type="button"
                  aria-label="비밀번호 표시"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5"
                    >
                      <path d="M3.53 2.47a.75.75 0 10-1.06 1.06l18 18a.75.75 0 101.06-1.06l-2.33-2.33A12.7 12.7 0 0021.75 12S18 4.5 12 4.5c-1.77 0-3.37.45-4.76 1.2L3.53 2.47zM4.79 6.03l2.28 2.28A8.94 8.94 0 003.75 12S6.77 17.25 12 17.25c1.08 0 2.08-.18 2.98-.49l1.78 1.78A10.2 10.2 0 0112 19.5C6 19.5 2.25 12 2.25 12s1.51-2.86 3.78-5.97z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5"
                    >
                      <path d="M12 5.25C6 5.25 2.25 12 2.25 12S6 18.75 12 18.75 21.75 12 21.75 12 18 5.25 12 5.25zm0 10.5a3.75 3.75 0 110-7.5 3.75 3.75 0 010 7.5z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-lg bg-green-600 py-2.5 text-white font-semibold shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              로그인
            </button>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <Link href="#" className="hover:text-green-700">
                아이디 찾기
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="#" className="hover:text-green-700">
                비밀번호 찾기
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="#" className="hover:text-green-700">
                회원가입
              </Link>
            </div>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-gray-400">또는</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href={`${socialLoginForKakaoUrl}?redirectUrl=${redirectUrlAfterSocialLogin}`}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FEE500] py-2.5 font-medium text-black shadow hover:brightness-95"
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm bg-black text-[#FEE500] text-[10px] font-bold">K</span>
                카카오로 로그인
              </Link>
              <Link
                href={`${socialLoginForGoogleUrl}?redirectUrl=${redirectUrlAfterSocialLogin}`}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-2.5 font-medium text-gray-700 hover:bg-gray-50"
              >
                <span className="text-[#DB4437]">G</span>
                구글로 로그인
              </Link>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          <span>로그인에 문제가 있으신가요? </span>
          <Link href="#" className="font-medium text-green-700 hover:underline">
            고객지원
          </Link>
        </div>
        </section>
      </div>
    </main>
  );
}


