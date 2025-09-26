'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UserGuard } from '@/lib/auth/authGuard';
import { COLOR_PRESETS } from '@/lib/constants/colors';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import { recipeService, AllRecipeResponseDto } from '@/lib/api/services/recipeService';

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const recipeId = params.id as string;

  const [recipe, setRecipe] = useState<AllRecipeResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 레시피 상세 정보 로드
  useEffect(() => {
    const fetchRecipeDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 현재는 모든 레시피를 가져온 후 ID로 찾는 방식으로 구현
        // 추후 백엔드에서 개별 레시피 API가 준비되면 교체 예정
        const allRecipes = await recipeService.getAllRecipes();
        const foundRecipe = allRecipes.find((r, index) => index.toString() === recipeId);
        
        if (foundRecipe) {
          setRecipe(foundRecipe);
        } else {
          setError('해당 레시피를 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('레시피 상세 정보 로드 실패:', error);
        setError('레시피 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    if (recipeId) {
      fetchRecipeDetail();
    }
  }, [recipeId]);

  // 난이도 텍스트 변환
  const getDifficultyText = (level: number) => {
    switch (level) {
      case 1: return '쉬움';
      case 2: return '보통';
      case 3: return '어려움';
      default: return '보통';
    }
  };

  // 난이도 색상 변환
  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      case 3: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
    return (
      <UserGuard>
        <div className={`min-h-screen ${COLOR_PRESETS.STATISTICS_PAGE.background} p-6`}>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8">
              <div className="text-center py-12">
                <div className="text-red-500 text-lg mb-4">⚠️ {error}</div>
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
        <div className="max-w-4xl mx-auto">
          {/* Main Card Container */}
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8">
            
            {/* Back Button */}
            <div className="mb-6">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <span>←</span> 목록으로 돌아가기
              </button>
            </div>

            {/* Recipe Header */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium text-xl overflow-hidden">
                    {recipe.userProfile ? (
                      <img 
                        src={recipe.userProfile} 
                        alt={recipe.userNickName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      recipe.userNickName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{recipe.title}</h1>
                    <p className="text-gray-600 mb-2">작성자: {recipe.userNickName}</p>
                    <p className="text-sm text-gray-500">작성일: {formatDate(recipe.createdAt)}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${getDifficultyColor(recipe.difficultyLevel)}`}>
                    난이도: {getDifficultyText(recipe.difficultyLevel)}
                  </span>
                  <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    ⏱️ 조리시간: {recipe.cookingTime}분
                  </span>
                </div>
              </div>

              {/* Recipe Description */}
              <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">📝 레시피 소개</h2>
                <p className="text-gray-700 leading-relaxed">{recipe.description}</p>
              </div>
            </div>

            {/* Ingredients Section */}
            {recipe.recipeIngredientResponseDto && recipe.recipeIngredientResponseDto.length > 0 && (
              <SectionCard title="🛒 필요한 재료" variant="statistics">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recipe.recipeIngredientResponseDto.map((ingredient, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-green-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-gray-800">{ingredient.ingredientName}</span>
                      </div>
                      <span className="text-gray-600 font-semibold">
                        {ingredient.quantity}{ingredient.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Recipe Actions */}
            <div className="mt-8 flex justify-center gap-4">
              <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md">
                👍 좋아요
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md">
                💬 댓글 달기
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md">
                📋 레시피 저장
              </button>
            </div>

            {/* Additional Recipe Info */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200 text-center">
                <div className="text-2xl mb-2">⏱️</div>
                <h3 className="font-semibold text-gray-800 mb-1">조리 시간</h3>
                <p className="text-gray-600">{recipe.cookingTime}분</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200 text-center">
                <div className="text-2xl mb-2">👨‍🍳</div>
                <h3 className="font-semibold text-gray-800 mb-1">난이도</h3>
                <p className="text-gray-600">{getDifficultyText(recipe.difficultyLevel)}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200 text-center">
                <div className="text-2xl mb-2">🧑‍🤝‍🧑</div>
                <h3 className="font-semibold text-gray-800 mb-1">작성자</h3>
                <p className="text-gray-600">{recipe.userNickName}</p>
              </div>
            </div>

            {/* Comments Section Placeholder */}
            <div className="mt-8">
              <SectionCard title="💬 댓글" variant="statistics">
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg mb-2">아직 댓글이 없습니다.</p>
                  <p className="text-sm">첫 번째 댓글을 남겨보세요!</p>
                </div>
              </SectionCard>
            </div>

          </div>
        </div>
      </div>
    </UserGuard>
  );
}
