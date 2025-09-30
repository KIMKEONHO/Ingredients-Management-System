"use client";

import { useGlobalLoginMember } from "../stores/auth/loginMamber";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "../components/ui/PageHeader";
import SectionCard from "../components/ui/SectionCard";
import { userService, UserProfile } from "../../lib/api/services/userService";



export default function MyPage() {
  const { isLogin, loginMember, logoutAndHome, setLoginMember } = useGlobalLoginMember();
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 검증 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      setMessage('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // 백엔드 프로필 이미지 변경 API 호출
      const response = await userService.updateProfileImage(file);
      
      if (response.success) {
        // 성공 시 프로필 정보 다시 불러오기
        const profileResponse = await userService.getUserProfile();
        if (profileResponse.success && profileResponse.data) {
          setProfile(profileResponse.data);
          
          // 전역 상태도 업데이트 (헤더에 즉시 반영)
          setLoginMember({
            ...loginMember,
            profile: profileResponse.data.profile,
            nickname: profileResponse.data.nickName
          });
        }
        setMessage('프로필 사진이 성공적으로 변경되었습니다.');
      } else {
        setMessage(response.message || '프로필 사진 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('프로필 이미지 변경 오류:', error);
      setMessage('프로필 이미지 변경 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      const response = await userService.updateUserProfile(profile);
      
      if (response.success) {
        // 전역 상태도 업데이트 (헤더에 즉시 반영)
        setLoginMember({
          ...loginMember,
          nickname: profile.nickName
        });
        
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

      <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2">
        {/* 프로필 사진 영역 */}
        <SectionCard title="프로필 사진">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                {profile.profile ? (
                  <img
                    src={profile.profile}
                    alt="프로필 사진"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 text-4xl">
                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              {isEditing && (
                <button
                  onClick={() => document.getElementById('profile-image-input')?.click()}
                  className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  title="프로필 사진 변경"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              )}
            </div>
            <input
              id="profile-image-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                {profile.profile ? '프로필 사진이 설정되어 있습니다.' : '프로필 사진을 설정해보세요.'}
              </p>
              {isEditing && (
                <button
                  onClick={() => document.getElementById('profile-image-input')?.click()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  {profile.profile ? '사진 변경' : '사진 추가'}
                </button>
              )}
            </div>
          </div>
        </SectionCard>

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
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    수정하기
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 font-medium shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none"
                  >
                    {isLoading ? "저장 중..." : "저장"}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-2 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
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
             <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
               <div className="flex items-center space-x-2">
                 <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                 </svg>
                 <span className="text-gray-700 font-medium">가입일</span>
               </div>
               <span className="text-gray-900 font-semibold">
                 {hasLoadedProfile && profile.createdAt 
                   ? new Date(profile.createdAt).toLocaleDateString('ko-KR') 
                   : hasLoadedProfile ? '정보 없음' : '불러오는 중...'}
               </span>
             </div>
             <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-100">
               <div className="flex items-center space-x-2">
                 <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
                 <span className="text-gray-700 font-medium">계정 상태</span>
               </div>
               <span className={`font-semibold px-3 py-1 rounded-full text-sm ${
                 hasLoadedProfile && profile.userStatus 
                   ? profile.userStatus === '활성' 
                     ? 'bg-green-100 text-green-800 border border-green-200' 
                     : 'bg-orange-100 text-orange-800 border border-orange-200'
                   : 'bg-gray-100 text-gray-600 border border-gray-200'
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
