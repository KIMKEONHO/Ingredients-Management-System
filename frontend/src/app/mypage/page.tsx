"use client";

import { useGlobalLoginMember } from "../stores/auth/loginMamber";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "../components/ui/PageHeader";
import SectionCard from "../components/ui/SectionCard";
import { userService, UserProfile } from "../../lib/api/services/userService";



export default function MyPage() {
  const { isLogin, loginMember, logoutAndHome } = useGlobalLoginMember();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>({
    nickName: "",
    email: "",
    profile: "",
    phoneNum: "",
    userStatus: "",
    createdAt: ""
  });
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    console.log('마이페이지 useEffect 실행:', { isLogin, loginMember });
    
    // 세션 상태 디버깅
    console.log('브라우저 쿠키:', document.cookie);
    console.log('로컬 스토리지:', localStorage);
    console.log('세션 스토리지:', sessionStorage);
    
    if (!isLogin || !loginMember) {
      console.log('로그인 상태가 아니므로 로그인 페이지로 이동');
      router.push('/login');
      return;
    }

    // API에서 사용자 프로필 정보 가져오기
    const fetchUserProfile = async () => {
      try {
        console.log('프로필 정보 요청 시작...');
        const response = await userService.getUserProfile();
        console.log('프로필 응답:', response);
        
        console.log('응답 구조 상세 분석:', {
          success: response.success,
          data: response.data,
          message: response.message,
          fullResponse: response
        });
        
        // 백엔드 응답 구조에 따라 데이터 처리
        if (response.data) {
          // data가 직접 UserProfile 객체인 경우
          setProfile(response.data);
          setHasLoadedProfile(true);
          setMessage('프로필 정보를 성공적으로 불러왔습니다.');
        } else if (response.success && response.data) {
          // success와 data가 모두 있는 경우
          setProfile(response.data);
          setHasLoadedProfile(true);
          setMessage('프로필 정보를 성공적으로 불러왔습니다.');
        } else {
          setMessage(response.message || '프로필 정보를 불러올 수 없습니다.');
        }
      } catch (error: unknown) {
        console.error('프로필 정보 로딩 실패:', error);
        
        // HTTP 상태 코드 확인
        if (error && typeof error === 'object' && 'response' in error) {
          const errorResponse = error as { 
            response?: { 
              status?: number; 
              statusText?: string; 
              data?: unknown; 
              headers?: unknown; 
            } 
          };
          if (errorResponse.response?.status === 403) {
            setMessage('접근 권한이 없습니다. 로그인 상태를 확인해주세요.');
            console.log('403 에러 상세 정보:', {
              status: errorResponse.response.status,
              statusText: errorResponse.response.statusText,
              data: errorResponse.response.data,
              headers: errorResponse.response.headers
            });
            return;
          }
          if (errorResponse.response?.status === 500) {
            setMessage('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            // 백엔드 세션 문제로 인한 임시 조치: 로컬 사용자 정보 사용
            if (loginMember) {
              setProfile({
                nickName: loginMember.nickname || '사용자',
                email: `user${loginMember.id}@example.com`, // 임시 이메일 생성
                profile: '',
                phoneNum: '',
                userStatus: '활성',
                createdAt: loginMember.createDate || new Date().toISOString()
              });
              setMessage('백엔드 연결 문제로 로컬 정보를 표시합니다. 잠시 후 다시 시도해주세요.');
            }
            return;
          }
        }
        
        // 세션 오류인 경우 자동 로그아웃 후 로그인 페이지로 리다이렉트
        if (error instanceof Error && (error.message.includes('세션') || 
            error.message.includes('인증') || error.message.includes('만료') ||
            error.message.includes('Session was invalidated'))) {
          setMessage('세션이 만료되었습니다. 다시 로그인해주세요.');
          // 2초 후 자동 로그아웃
          setTimeout(() => {
            logoutAndHome();
          }, 2000);
          return;
        }
        
        // 기타 오류 메시지 표시
        setMessage('프로필 정보를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.');
      }
    };

    // 약간의 지연 후 API 호출 (인증 상태 안정화를 위해)
    setTimeout(() => {
      fetchUserProfile();
    }, 100);
  }, [isLogin, loginMember, router, logoutAndHome]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      const response = await userService.updateUserProfile(profile);
      
      if (response.success) {
        setMessage("프로필이 성공적으로 업데이트되었습니다.");
        setIsEditing(false);
      } else {
        setMessage(response.message || "프로필 업데이트에 실패했습니다.");
      }
    } catch (error: unknown) {
      setMessage("프로필 업데이트에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // API에서 다시 정보를 가져와서 복원
    const fetchUserProfile = async () => {
      try {
        const response = await userService.getUserProfile();
        if (response.success && response.data) {
          setProfile(response.data);
        }
      } catch (error: unknown) {
        console.error('프로필 정보 복원 실패:', error);
        // 세션 오류인 경우 자동 로그아웃
        if (error instanceof Error && (error.message.includes('세션') || 
            error.message.includes('인증') || error.message.includes('만료') ||
            error.message.includes('Session was invalidated'))) {
          setMessage('세션이 만료되었습니다. 다시 로그인해주세요.');
          setTimeout(() => {
            logoutAndHome();
          }, 2000);
          return;
        }
      }
    };

    fetchUserProfile();
    setIsEditing(false);
    setMessage("");
  };


  if (!isLogin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title="마이 페이지" 
      />
             <p className="text-gray-600 text-center mb-8">
         {hasLoadedProfile ? '내 정보를 확인하고 수정할 수 있습니다.' : '프로필 정보를 불러오는 중...'}
       </p>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 프로필 정보 */}
        <SectionCard title="프로필 정보">
          <div className="space-y-4">
                         <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 닉네임
               </label>
               <input
                 type="text"
                 name="nickName"
                 value={profile.nickName || ''}
                 onChange={handleInputChange}
                 disabled={!isEditing}
                 placeholder={hasLoadedProfile ? '' : '닉네임을 불러오는 중...'}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
               />
             </div>

                                             <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        이메일
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={profile.email || ''}
                        disabled={true}
                        placeholder="이메일을 불러오는 중..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">이메일은 변경할 수 없습니다.</p>
                    </div>

                                             <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        전화번호
                      </label>
                      <input
                        type="tel"
                        name="phoneNum"
                        value={profile.phoneNum || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder={hasLoadedProfile ? '010-0000-0000' : '전화번호를 불러오는 중...'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        전화번호를 변경할 수 있습니다. 010-1234-5678 형식으로 입력해주세요.
                      </p>
                    </div>

                                             {/* 프로필 이미지 필드는 백엔드에서 아직 제공하지 않음 */}
                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        프로필 이미지
                      </label>
                      <input
                        type="text"
                        name="profile"
                        value={profile.profile || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder={hasLoadedProfile ? '프로필 이미지 URL을 입력하세요' : '프로필 이미지를 불러오는 중...'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                      />
                    </div> */}

            {message && (
              <div className={`p-3 rounded-md text-sm ${
                message.includes('성공') ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
              }`}>
                {message}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    수정하기
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? "저장 중..." : "저장"}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                  >
                    취소
                  </button>
                </>
              )}
            </div>
          </div>
        </SectionCard>

                 {/* 계정 정보 */}
         <SectionCard title="계정 정보">
           <div className="space-y-4">
             <div className="flex justify-between items-center py-2 border-b">
               <span className="text-gray-600">가입일</span>
               <span className="text-gray-900">
                 {hasLoadedProfile && profile.createdAt 
                   ? new Date(profile.createdAt).toLocaleDateString('ko-KR') 
                   : hasLoadedProfile ? '정보 없음' : '불러오는 중...'}
               </span>
             </div>
             <div className="flex justify-between items-center py-2 border-b">
               <span className="text-gray-600">계정 상태</span>
               <span className={`font-medium ${
                 hasLoadedProfile && profile.userStatus 
                   ? profile.userStatus === '활성' ? 'text-green-600' : 'text-orange-600'
                   : 'text-gray-400'
               }`}>
                 {hasLoadedProfile && profile.userStatus ? profile.userStatus : '불러오는 중...'}
               </span>
             </div>
           </div>
         </SectionCard>
      </div>
    </div>
  );
}
