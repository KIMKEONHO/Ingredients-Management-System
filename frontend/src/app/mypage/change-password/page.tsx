"use client";

import { useGlobalLoginMember } from "../../stores/auth/loginMamber";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "../../components/ui/PageHeader";
import SectionCard from "../../components/ui/SectionCard";
import { userService } from "../../../lib/api/services/userService";
import { emailService } from "../../../lib/api/services/emailService";

export default function ChangePassword() {
  const { isLogin, loginMember } = useGlobalLoginMember();
  const router = useRouter();
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isValidating, setIsValidating] = useState(false);
  
  // 이메일 인증 관련 상태
  const [currentStep, setCurrentStep] = useState<'email' | 'verify' | 'password'>('email');
  const [email, setEmail] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // 비밀번호 검증 함수
  const validatePassword = (password: string) => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push("8자 이상");
    }
    if (password.length > 20) {
      errors.push("20자 이하");
    }
    if (!/\d/.test(password)) {
      errors.push("숫자 1개 이상");
    }
    if (!/[!@#$%^&+=]/.test(password)) {
      errors.push("특수문자 1개 이상");
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  };

  // 실시간 비밀번호 검증
  const validatePasswordRealTime = (password: string) => {
    if (!password) return { isValid: false, errors: [] };
    return validatePassword(password);
  };

  // 이메일 인증코드 발송
  const handleSendVerificationCode = async () => {
    if (!email) {
      setMessage("이메일을 입력해주세요.");
      return;
    }

    setIsSendingCode(true);
    setMessage("");

    try {
      const response = await emailService.sendVerificationCode(email);
      
      if (response.success) {
        setMessage("인증코드가 이메일로 발송되었습니다.");
        setCurrentStep('verify');
        // 3분 카운트다운 시작
        setCountdown(180);
        startCountdown();
      } else {
        setMessage(response.message || "인증코드 발송에 실패했습니다.");
      }
    } catch (error: unknown) {
      setMessage("인증코드 발송에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSendingCode(false);
    }
  };

  // 인증코드 검증
  const handleVerifyCode = async () => {
    if (!verifyCode) {
      setMessage("인증코드를 입력해주세요.");
      return;
    }

    setIsVerifyingCode(true);
    setMessage("");

    try {
      const response = await emailService.verifyCode(email, verifyCode);
      
      if (response.success) {
        setMessage("이메일 인증이 완료되었습니다.");
        setIsEmailVerified(true);
        setCurrentStep('password');
      } else {
        setMessage(response.message || "인증코드가 올바르지 않습니다.");
      }
    } catch (error: unknown) {
      setMessage("인증코드 검증에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsVerifyingCode(false);
    }
  };

  // 카운트다운 시작
  const startCountdown = () => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 카운트다운 포맷팅
  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!isLogin) {
      router.push('/login');
      return;
    }
    
    // 로그인된 사용자의 이메일 정보가 있다면 기본값으로 설정
    // Member 타입에 email이 없으므로 임시로 생성
    if (loginMember?.id) {
      setEmail(`user${loginMember.id}@example.com`);
    }
  }, [isLogin, router, loginMember]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 입력 시 에러 메시지 제거
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }

    // 실시간 비밀번호 검증 (새 비밀번호만)
    if (name === 'newPassword') {
      setIsValidating(true);
      
      // 디바운스: 500ms 후 검증 실행
      setTimeout(() => {
        const validation = validatePasswordRealTime(value);
        if (!validation.isValid) {
          setErrors(prev => ({
            ...prev,
            newPassword: validation.errors.join(", ")
          }));
        } else {
          setErrors(prev => ({
            ...prev,
            newPassword: ""
          }));
        }
        setIsValidating(false);
      }, 500);
    }

    // 비밀번호 확인 실시간 검증
    if (name === 'confirmPassword') {
      if (value && value !== passwords.newPassword) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: "새 비밀번호와 일치하지 않습니다."
        }));
      } else if (value && value === passwords.newPassword) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: ""
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!passwords.currentPassword) {
      newErrors.currentPassword = "현재 비밀번호를 입력해주세요.";
    }

    if (!passwords.newPassword) {
      newErrors.newPassword = "새 비밀번호를 입력해주세요.";
    } else {
      const validation = validatePassword(passwords.newPassword);
      if (!validation.isValid) {
        newErrors.newPassword = validation.errors.join(", ");
      }
    }

    if (!passwords.confirmPassword) {
      newErrors.confirmPassword = "비밀번호 확인을 입력해주세요.";
    } else if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = "새 비밀번호와 일치하지 않습니다.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await userService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      
      console.log('비밀번호 변경 응답:', response);
      
      if (response.success) {
        setMessage("비밀번호가 성공적으로 변경되었습니다.");
        setPasswords({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        
        // 3초 후 마이페이지로 이동
        setTimeout(() => {
          router.push('/mypage');
        }, 3000);
      } else {
        setMessage(response.message || "비밀번호 변경에 실패했습니다.");
      }
    } catch (error: unknown) {
      setMessage("비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/mypage');
  };

  if (!isLogin) {
    return null;
  }

  // 단계별 UI 렌더링
  const renderEmailStep = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          이메일 주소
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="인증받을 이메일을 입력하세요"
        />
      </div>
      
      <button
        type="button"
        onClick={handleSendVerificationCode}
        disabled={isSendingCode || !email}
        className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
      >
        {isSendingCode ? "발송 중..." : "인증코드 발송"}
      </button>
    </div>
  );

  const renderVerifyStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">
          <strong>{email}</strong>로 인증코드를 발송했습니다.
        </p>
        {countdown > 0 && (
          <p className="text-sm text-orange-600 mb-4">
            남은 시간: {formatCountdown(countdown)}
          </p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          인증코드
        </label>
        <input
          type="text"
          value={verifyCode}
          onChange={(e) => setVerifyCode(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="6자리 인증코드를 입력하세요"
          maxLength={6}
        />
      </div>
      
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleVerifyCode}
          disabled={isVerifyingCode || !verifyCode}
          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {isVerifyingCode ? "인증 중..." : "인증하기"}
        </button>
        <button
          type="button"
          onClick={() => setCurrentStep('email')}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          뒤로
        </button>
      </div>
    </div>
  );

  const renderPasswordStep = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          현재 비밀번호
        </label>
        <input
          type="password"
          name="currentPassword"
          value={passwords.currentPassword}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
            errors.currentPassword ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="현재 비밀번호를 입력하세요"
        />
        {errors.currentPassword && (
          <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          새 비밀번호
        </label>
        <div className="relative">
          <input
            type="password"
            name="newPassword"
            value={passwords.newPassword}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.newPassword ? 'border-red-500' : 
              passwords.newPassword && !errors.newPassword ? 'border-green-500' : 'border-gray-300'
            }`}
            placeholder="새 비밀번호를 입력하세요"
          />
          {isValidating && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
          {passwords.newPassword && !errors.newPassword && !isValidating && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>
        {errors.newPassword && (
          <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
        )}
        <p className="text-gray-500 text-xs mt-1">
          비밀번호는 8-20자이며, 숫자와 특수문자(!@#$%^&+=)를 각각 최소 1개 포함해야 합니다.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          새 비밀번호 확인
        </label>
        <div className="relative">
          <input
            type="password"
            name="confirmPassword"
            value={passwords.confirmPassword}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.confirmPassword ? 'border-red-500' : 
              passwords.confirmPassword && !errors.confirmPassword && passwords.confirmPassword === passwords.newPassword ? 'border-green-500' : 'border-gray-300'
            }`}
            placeholder="새 비밀번호를 다시 입력하세요"
          />
          {passwords.confirmPassword && !errors.confirmPassword && passwords.confirmPassword === passwords.newPassword && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? "변경 중..." : "비밀번호 변경"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
      </div>
    </form>
  );

  // 메인 렌더링
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title="비밀번호 변경" 
      />
      <p className="text-gray-600 text-center mb-8">
        {currentStep === 'email' && '비밀번호 변경을 위해 이메일 인증을 진행해주세요.'}
        {currentStep === 'verify' && '이메일로 발송된 인증코드를 입력해주세요.'}
        {currentStep === 'password' && '안전한 계정 관리를 위해 주기적으로 비밀번호를 변경하세요.'}
      </p>

      <div className="max-w-md mx-auto">
        <SectionCard title={
          currentStep === 'email' ? '이메일 인증' :
          currentStep === 'verify' ? '인증코드 입력' :
          '비밀번호 변경'
        }>
          {message && (
            <div className={`p-3 rounded-md text-sm mb-4 ${
              message.includes('성공') || message.includes('완료') || message.includes('발송') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}

          {currentStep === 'email' && renderEmailStep()}
          {currentStep === 'verify' && renderVerifyStep()}
          {currentStep === 'password' && renderPasswordStep()}
        </SectionCard>
      </div>
    </div>
  );
}
