"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { COLOR_PRESETS } from "@/lib/constants/colors";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nickName: "",
    name: "",
    phoneNumber: ""
  });
  
  const [emailVerificationCode, setEmailVerificationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  
  // 실시간 유효성 검사
  const [validationErrors, setValidationErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nickName: "",
    name: "",
    phoneNumber: ""
  });

  // 이메일 유효성 검사
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 비밀번호 유효성 검사
  const validatePassword = (password: string) => {
    // 8-20자, 숫자 1개 이상, 특수문자 1개 이상 포함
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&+=]).{8,20}$/;
    return passwordRegex.test(password);
  };

  // 전화번호 유효성 검사 (010-1234-5678 형식)
  const validatePhone = (phone: string) => {
    const phoneRegex = /^01(?:0|1|[6-9])-(?:\d{3}|\d{4})-\d{4}$/;
    return phoneRegex.test(phone);
  };

  // 실시간 유효성 검사 실행
  useEffect(() => {
    const errors: typeof validationErrors = {
      email: "",
      password: "",
      confirmPassword: "",
      nickName: "",
      name: "",
      phoneNumber: ""
    };

    // 이메일 검사
    if (formData.email && !validateEmail(formData.email)) {
      errors.email = "올바른 이메일 형식을 입력해주세요.";
    }

    // 비밀번호 검사
    if (formData.password && !validatePassword(formData.password)) {
      errors.password = "비밀번호는 8-20자이며, 숫자와 특수문자를 각각 최소 1개 포함해야 합니다.";
    }

    // 비밀번호 확인 검사
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }

    // 닉네임 검사
    if (formData.nickName) {
      if (formData.nickName.includes(' ')) {
        errors.nickName = "닉네임에는 띄어쓰기를 사용할 수 없습니다.";
      } else if (formData.nickName.trim().length < 2) {
        errors.nickName = "닉네임은 2자 이상이어야 합니다.";
      }
    }

    // 이름 검사
    if (formData.name) {
      if (formData.name.includes(' ')) {
        errors.name = "이름에는 띄어쓰기를 사용할 수 없습니다.";
      } else if (formData.name.trim().length < 2) {
        errors.name = "이름은 2자 이상이어야 합니다.";
      }
    }

    // 전화번호 검사
    if (formData.phoneNumber && !validatePhone(formData.phoneNumber)) {
      errors.phoneNumber = "올바른 전화번호 형식을 입력해주세요.";
    }

    setValidationErrors(errors);
  }, [formData]);

  // 이메일 인증 코드 발송
  const handleSendVerificationEmail = async () => {
    if (!formData.email || !validateEmail(formData.email)) {
      setErrorMessage("올바른 이메일을 입력해주세요.");
      return;
    }

    setIsSendingEmail(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mail: formData.email
        })
      });

      if (response.ok) {
        setEmailSent(true);
        setErrorMessage("");
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "이메일 발송에 실패했습니다.");
      }
    } catch (error) {
      setErrorMessage("이메일 발송 중 오류가 발생했습니다.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  // 이메일 인증 코드 확인
  const handleVerifyEmail = async () => {
    if (!emailVerificationCode) {
      setErrorMessage("인증 코드를 입력해주세요.");
      return;
    }

    setIsVerifyingEmail(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/email/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mail: formData.email,
          verifyCode: emailVerificationCode
        })
      });

      if (response.ok) {
        setEmailVerified(true);
        setErrorMessage("");
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "인증 코드가 올바르지 않습니다.");
      }
    } catch (error) {
      setErrorMessage("이메일 인증 중 오류가 발생했습니다.");
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  // 회원가입 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 모든 필드 검증
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.nickName || !formData.name || !formData.phoneNumber) {
      setErrorMessage("모든 필드를 입력해주세요.");
      return;
    }

    if (!emailVerified) {
      setErrorMessage("이메일 인증을 완료해주세요.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    // 유효성 검사 오류가 있는지 확인
    const hasErrors = Object.values(validationErrors).some(error => error !== "");
    if (hasErrors) {
      setErrorMessage("입력 정보를 확인해주세요.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      // 백엔드 회원가입 API 호출
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          nickName: formData.nickName,
          name: formData.name,
          phoneNumber: formData.phoneNumber
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert("회원가입이 완료되었습니다!");
        // 로그인 페이지로 이동
        window.location.href = '/login';
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "회원가입에 실패했습니다.");
      }
    } catch (error) {
      setErrorMessage("회원가입 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <main className={`min-h-screen ${COLOR_PRESETS.LOGIN_PAGE.background} flex items-center justify-center px-4 py-8`}>
      <div className={`w-full max-w-2xl rounded-2xl ${COLOR_PRESETS.LOGIN_PAGE.card} p-6 shadow-xl ring-1 ring-black/5`}>
        <section className="w-full max-w-xl mx-auto">
          <div className="mb-6 text-center">
            <div className={`mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full ${COLOR_PRESETS.LOGIN_PAGE.button} text-white font-bold`}>FM</div>
            <h1 className={`mt-4 text-3xl font-bold ${COLOR_PRESETS.LOGIN_PAGE.accent}`}>회원가입</h1>
            <p className="mt-1 text-sm text-blue-700/70">새로운 계정을 만들어보세요</p>
          </div>

          <div className={`rounded-2xl ${COLOR_PRESETS.LOGIN_PAGE.card} p-8 shadow-xl ring-1 ring-black/5`}>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 이메일 입력 */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  이메일 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                        <path d="M1.5 6.75A2.25 2.25 0 013.75 4.5h16.5A2.25 2.25 0 0122.5 6.75v10.5A2.25 2.25 0 0120.25 19.5H3.75A2.25 2.25 0 011.5 17.25V6.75zm1.91-.53a.75.75 0 00-.66 1.34l8.25 4.125a.75.75 0 00.66 0l8.25-4.125a.75.75 0 10-.66-1.34L12 10.06 3.41 6.22z" />
                      </svg>
                    </span>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="이메일을 입력하세요"
                      className={`w-full rounded-lg border ${COLOR_PRESETS.LOGIN_PAGE.border} pl-10 pr-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 ${COLOR_PRESETS.LOGIN_PAGE.focus}`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendVerificationEmail}
                    disabled={isSendingEmail || !formData.email || !validateEmail(formData.email)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${COLOR_PRESETS.LOGIN_PAGE.button} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isSendingEmail ? "발송중..." : "인증메일"}
                  </button>
                </div>
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                )}
              </div>

              {/* 이메일 인증 코드 */}
              {emailSent && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    이메일 인증 코드 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={emailVerificationCode}
                      onChange={(e) => setEmailVerificationCode(e.target.value)}
                      placeholder="인증 코드를 입력하세요"
                      className={`flex-1 rounded-lg border ${COLOR_PRESETS.LOGIN_PAGE.border} px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 ${COLOR_PRESETS.LOGIN_PAGE.focus}`}
                    />
                    <button
                      type="button"
                      onClick={handleVerifyEmail}
                      disabled={isVerifyingEmail || !emailVerificationCode || emailVerified}
                      className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${emailVerified ? 'bg-blue-600' : COLOR_PRESETS.LOGIN_PAGE.button} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {emailVerified ? "인증완료" : isVerifyingEmail ? "확인중..." : "확인"}
                    </button>
                  </div>
                  {emailVerified && (
                    <p className="mt-1 text-sm text-green-600">✓ 이메일 인증이 완료되었습니다.</p>
                  )}
                </div>
              )}

              {/* 비밀번호 입력 */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  비밀번호 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                      <path d="M12 2a5 5 0 00-5 5v3H6a2 2 0 00-2 2v7a2 2 0 002 2h12a2 2 0 002-2v-7a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zm-3 8V7a3 3 0 116 0v3H9z" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                                         placeholder="비밀번호를 입력하세요 (8-20자, 숫자+특수문자 포함)"
                    className={`w-full rounded-lg border ${COLOR_PRESETS.LOGIN_PAGE.border} pl-10 pr-10 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 ${COLOR_PRESETS.LOGIN_PAGE.focus}`}
                  />
                  <button
                    type="button"
                    aria-label="비밀번호 표시"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                        <path d="M3.53 2.47a.75.75 0 10-1.06 1.06l18 18a.75.75 0 101.06-1.06l-2.33-2.33A12.7 12.7 0 0021.75 12S18 4.5 12 4.5c-1.77 0-3.37.45-4.76 1.2L3.53 2.47zM4.79 6.03l2.28 2.28A8.94 8.94 0 003.75 12S6.77 17.25 12 17.25c1.08 0 2.08-.18 2.98-.49l1.78 1.78A10.2 10.2 0 0112 19.5C6 19.5 2.25 12 2.25 12s1.51-2.86 3.78-5.97z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                        <path d="M12 5.25C6 5.25 2.25 12 2.25 12S6 18.75 12 18.75 21.75 12 21.75 12 18 5.25 12 5.25zm0 10.5a3.75 3.75 0 110-7.5 3.75 3.75 0 010 7.5z" />
                      </svg>
                    )}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                )}
              </div>

              {/* 비밀번호 확인 */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  비밀번호 확인 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                      <path d="M12 2a5 5 0 00-5 5v3H6a2 2 0 00-2 2v7a2 2 0 002 2h12a2 2 0 002-2v-7a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zm-3 8V7a3 3 0 116 0v3H9z" />
                    </svg>
                  </span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="비밀번호를 다시 입력하세요"
                    className={`w-full rounded-lg border ${COLOR_PRESETS.LOGIN_PAGE.border} pl-10 pr-10 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 ${COLOR_PRESETS.LOGIN_PAGE.focus}`}
                  />
                  <button
                    type="button"
                    aria-label="비밀번호 표시"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                        <path d="M3.53 2.47a.75.75 0 10-1.06 1.06l18 18a.75.75 0 101.06-1.06l-2.33-2.33A12.7 12.7 0 0021.75 12S18 4.5 12 4.5c-1.77 0-3.37.45-4.76 1.2L3.53 2.47zM4.79 6.03l2.28 2.28A8.94 8.94 0 003.75 12S6.77 17.25 12 17.25c1.08 0 2.08-.18 2.98-.49l1.78 1.78A10.2 10.2 0 0112 19.5C6 19.5 2.25 12 2.25 12s1.51-2.86 3.78-5.97z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                        <path d="M12 5.25C6 5.25 2.25 12 2.25 12S6 18.75 12 18.75 21.75 12 21.75 12 18 5.25 12 5.25zm0 10.5a3.75 3.75 0 110-7.5 3.75 3.75 0 010 7.5z" />
                      </svg>
                    )}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
                )}
              </div>

              {/* 닉네임 입력 */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  닉네임 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                      <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM2.25 19.125A7.125 7.125 0 0119.5 12c0 1.921-.682 3.659-1.818 5.003L17.25 19.5h-3.75l-.023-.047c-1.137-1.303-1.947-2.853-2.227-4.478A6.75 6.75 0 0012 19.125c-1.268 0-2.45-.446-3.386-1.207A6.375 6.375 0 014.5 19.125z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={formData.nickName}
                    onChange={(e) => handleInputChange("nickName", e.target.value)}
                    placeholder="닉네임을 입력하세요 (2-10자, 한글/영문/숫자)"
                    className={`w-full rounded-lg border ${COLOR_PRESETS.LOGIN_PAGE.border} pl-10 pr-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 ${COLOR_PRESETS.LOGIN_PAGE.focus}`}
                  />
                </div>
                {validationErrors.nickName && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.nickName}</p>
                )}
              </div>

              {/* 이름 입력 */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  이름 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                      <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM2.25 19.125A7.125 7.125 0 0119.5 12c0 1.921-.682 3.659-1.818 5.003L17.25 19.5h-3.75l-.023-.047c-1.137-1.303-1.947-2.853-2.227-4.478A6.75 6.75 0 0012 19.125c-1.268 0-2.45-.446-3.386-1.207A6.375 6.375 0 014.5 19.125z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="이름을 입력하세요"
                    className={`w-full rounded-lg border ${COLOR_PRESETS.LOGIN_PAGE.border} pl-10 pr-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 ${COLOR_PRESETS.LOGIN_PAGE.focus}`}
                  />
                </div>
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                )}
              </div>

              {/* 전화번호 입력 */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  전화번호 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                      <path d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.819V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" />
                    </svg>
                  </span>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    placeholder="전화번호를 입력하세요 (010-1234-5678)"
                    className={`w-full rounded-lg border ${COLOR_PRESETS.LOGIN_PAGE.border} pl-10 pr-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 ${COLOR_PRESETS.LOGIN_PAGE.focus}`}
                  />
                </div>
                {validationErrors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.phoneNumber}</p>
                )}
              </div>

              {/* 에러 메시지 */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errorMessage}</p>
                </div>
              )}

              {/* 회원가입 버튼 */}
              <button
                type="submit"
                disabled={isLoading || !emailVerified}
                className={`mt-2 w-full rounded-lg ${COLOR_PRESETS.LOGIN_PAGE.button} py-2.5 text-white font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? "회원가입 중..." : "회원가입"}
              </button>

              {/* 로그인 링크 */}
              <div className="text-center text-sm text-gray-600">
                이미 계정이 있으신가요?{" "}
                <Link href="/login" className={`font-medium ${COLOR_PRESETS.LOGIN_PAGE.accent} hover:underline`}>
                  로그인하기
                </Link>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
