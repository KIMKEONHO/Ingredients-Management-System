'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UserGuard } from '@/lib/auth/authGuard';
import { COLOR_PRESETS } from '@/lib/constants/colors';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import { recipeService, RecipeDetailResponseDto } from '@/lib/api/services/recipeService';
import { useGlobalLoginMember } from '@/app/stores/auth/loginMamber';

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const recipeId = params.id as string;
  const { loginMember } = useGlobalLoginMember();

  const [recipe, setRecipe] = useState<RecipeDetailResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // 중복 요청 방지를 위한 ref
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFetchedRecipeIdRef = useRef<string | null>(null);

  // 레시피 상세 정보 로드 (중복 요청 방지)
  const fetchRecipeDetail = useCallback(async (id: string) => {
    // 이미 같은 recipeId로 요청 중인 경우 중복 요청 방지
    if (lastFetchedRecipeIdRef.current === id) {
      console.log('이미 요청 중인 레시피입니다:', id);
      return;
    }

    // 이전 요청이 있다면 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 새로운 AbortController 생성
    abortControllerRef.current = new AbortController();

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('레시피 상세 조회 요청 시작 - recipeId:', id, 'type:', typeof id, 'timestamp:', new Date().toISOString());
      const recipeDetail = await recipeService.getRecipeDetail(id);
      console.log('레시피 상세 조회 요청 완료 - recipeId:', id, 'timestamp:', new Date().toISOString());
      
      // 요청이 취소되지 않았을 때만 상태 업데이트
      if (!abortControllerRef.current.signal.aborted) {
        console.log('레시피 데이터 설정:', recipeDetail);
        setRecipe(recipeDetail);
        setIsLoading(false); // 성공 시 로딩 상태 해제
        lastFetchedRecipeIdRef.current = id; // 성공 시에만 ref 업데이트
      }
    } catch (error) {
      // AbortError는 무시 (요청 취소)
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('레시피 상세 조회 요청이 취소되었습니다:', id);
        return;
      }
      
      console.error('레시피 상세 정보 로드 실패:', error);
      if (!abortControllerRef.current?.signal.aborted) {
        setError('레시피 정보를 불러오는데 실패했습니다.');
        setIsLoading(false); // 에러 시 로딩 상태 해제
        lastFetchedRecipeIdRef.current = null; // 에러 시 ref 초기화
      }
    }
  }, []); // 의존성 배열에서 recipe 제거

  useEffect(() => {
    if (recipeId) {
      // 새로운 recipeId로 변경될 때 로딩 상태 초기화
      setIsLoading(true);
      setError(null);
      setRecipe(null);
      fetchRecipeDetail(recipeId);
    }

    // 컴포넌트 언마운트 시 요청 취소
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [recipeId, fetchRecipeDetail]);

  // 난이도 텍스트 변환
  const getDifficultyText = (level: number) => {
    switch (level) {
      case 1: return '매우 쉬움';
      case 2: return '쉬움';
      case 3: return '보통';
      case 4: return '어려움';
      case 5: return '매우 어려움';
      default: return '보통';
    }
  };

  // 난이도 색상 변환
  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-blue-100 text-blue-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      case 4: return 'bg-orange-100 text-orange-800';
      case 5: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 난이도별 별점 렌더링
  const renderDifficultyStars = (level: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg 
          key={i} 
          className={`w-4 h-4 ${i <= level ? 'text-yellow-400' : 'text-gray-300'}`} 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    return stars;
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // 내 게시글인지 확인 - ID로 비교 (더 정확함)
  const currentUser = loginMember;
  const isMyRecipe = recipe && (
    (recipe.userId && currentUser.userId && recipe.userId === currentUser.userId) || // ID로 비교 (우선)
    currentUser.email === recipe.userNickName // 이메일로 비교 (백업)
  );

  // 레시피 삭제 처리
  const handleDeleteRecipe = async () => {
    if (!recipe) return;
    
    setIsDeleting(true);
    try {
      await recipeService.deleteRecipe(recipeId);
      alert('레시피가 성공적으로 삭제되었습니다.');
      router.push('/recipe-community');
    } catch (error) {
      console.error('레시피 삭제 실패:', error);
      alert('레시피 삭제에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <UserGuard>
        <div className={`min-h-screen ${COLOR_PRESETS.STATISTICS_PAGE.background} p-6`}>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8">
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                <p className="ml-4 text-gray-600">레시피를 불러오는 중...</p>
              </div>
            </div>
          </div>
        </div>
      </UserGuard>
    );
  }

  if (error || !recipe) {
    console.log('오류 또는 레시피 없음:', { error, recipe, isLoading });
    return (
      <UserGuard>
        <div className={`min-h-screen ${COLOR_PRESETS.STATISTICS_PAGE.background} p-6`}>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8">
              <div className="text-center py-12">
                <div className="text-red-500 text-lg mb-4">⚠️ {error || '레시피를 찾을 수 없습니다.'}</div>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    뒤로 가기
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    다시 시도
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </UserGuard>
    );
  }

  return (
    <UserGuard>
      <div className={`min-h-screen ${COLOR_PRESETS.STATISTICS_PAGE.background} p-6`}>
        <div className="max-w-6xl mx-auto">
          {/* Main Card Container */}
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8">
          
          {/* Back Button and Action Buttons */}
          <div className="pt-6 pb-4 flex justify-between items-center">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <span>←</span> 목록으로 돌아가기
            </button>
            
            {/* 내 게시글인 경우 삭제 버튼 표시 */}
            {isMyRecipe && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    삭제 중...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    삭제
                  </>
                )}
              </button>
            )}
          </div>

          {/* Recipe Header Section */}
          <div className="mb-8">
            {/* Recipe Image */}
            <div className="relative mb-6">
              {recipe.imageUrl && (
                <div className="relative">
                  <img 
                    src={recipe.imageUrl} 
                    alt={recipe.title}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                  <div className="absolute bottom-4 right-4">
                    <div className="bg-gray-800 bg-opacity-70 rounded-full px-3 py-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="text-white text-sm">{recipe.viewCount?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Platform Icon */}
              <div className="flex justify-center mt-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Recipe Title and Description */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{recipe.title}</h1>
              <p className="text-gray-700 leading-relaxed max-w-4xl mx-auto mb-6">{recipe.description}</p>
              
              {/* Recipe Metadata */}
              <div className="flex justify-center gap-8 text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>{recipe.servings}인분</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{recipe.cookingTime}분 이내</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {renderDifficultyStars(recipe.difficultyLevel)}
                  </div>
                  <span>{getDifficultyText(recipe.difficultyLevel)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ingredients Section */}
          {recipe.recipeIngredientResponseDtos && recipe.recipeIngredientResponseDtos.length > 0 && (
            <div className="mb-12">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">재료</h2>
              </div>
              
              <div className="space-y-3">
                {recipe.recipeIngredientResponseDtos.map((ingredient, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-800">{ingredient.ingredientName}</span>
                    <span className="text-gray-600">{ingredient.quantity}{ingredient.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recipe Steps Section */}
          {recipe.recipeStepResponseDtos && recipe.recipeStepResponseDtos.length > 0 && (
            <div className="mb-12">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">조리순서</h2>
              </div>
              
              <div className="space-y-8">
                {recipe.recipeStepResponseDtos.map((step, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {step.stepNumber}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 leading-relaxed mb-3">{step.description}</p>
                        {step.cookingTime && step.cookingTime > 0 && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>약 {step.cookingTime}분 소요 예정</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Step Image - Full width below content */}
                    {step.imageUrl && (
                      <div className="mt-4">
                        <img 
                          src={step.imageUrl} 
                          alt={`${step.stepNumber}단계 이미지`}
                          className="w-full max-h-64 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          </div>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">레시피 삭제</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              정말로 이 레시피를 삭제하시겠습니까?<br />
              삭제된 레시피는 복구할 수 없습니다.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleDeleteRecipe}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </UserGuard>
  );
}
