'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserGuard } from '@/lib/auth/authGuard';
import { COLOR_PRESETS } from '@/lib/constants/colors';
import PageHeader from '../components/ui/PageHeader';
import SectionCard from '../components/ui/SectionCard';
import { recipeService, AllRecipeResponseDto } from '@/lib/api/services/recipeService';

interface RecommendedRecipe extends AllRecipeResponseDto {
  matchPercentage: number;
  matchingIngredients: string[];
  missingIngredients: string[];
}

export default function RecipeRecommendationPage() {
  const router = useRouter();
  const [recommendedRecipes, setRecommendedRecipes] = useState<RecommendedRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // 사용자 보유 재료 (실제로는 API에서 가져와야 함)
  const userIngredients = [
    '토마토', '양파', '마늘', '올리브오일', '소금', '후추', 
    '닭가슴살', '파스타', '치즈', '바질', '당근', '감자'
  ];

  // 레시피 추천 데이터 로드
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const allRecipes = await recipeService.getAllRecipes();
        
        // 각 레시피에 대해 매칭률 계산
        const recommendations: RecommendedRecipe[] = allRecipes.map(recipe => {
          const recipeIngredients = recipe.recipeIngredientResponseDto.map(
            ing => ing.ingredientName.toLowerCase()
          );
          
          const matchingIngredients = recipeIngredients.filter(ingredient =>
            userIngredients.some(userIng => 
              userIng.toLowerCase().includes(ingredient) || 
              ingredient.includes(userIng.toLowerCase())
            )
          );
          
          const missingIngredients = recipeIngredients.filter(ingredient =>
            !userIngredients.some(userIng => 
              userIng.toLowerCase().includes(ingredient) || 
              ingredient.includes(userIng.toLowerCase())
            )
          );
          
          const matchPercentage = Math.round(
            (matchingIngredients.length / recipeIngredients.length) * 100
          );
          
          return {
            ...recipe,
            matchPercentage,
            matchingIngredients,
            missingIngredients
          };
        });
        
        // 매칭률 높은 순으로 정렬
        recommendations.sort((a, b) => b.matchPercentage - a.matchPercentage);
        
        setRecommendedRecipes(recommendations);
      } catch (error) {
        console.error('레시피 추천 데이터 로드 실패:', error);
        setError('레시피 추천 데이터를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  // 카테고리별 필터링
  const filteredRecipes = recommendedRecipes.filter(recipe => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'high-match') return recipe.matchPercentage >= 70;
    if (selectedCategory === 'medium-match') return recipe.matchPercentage >= 40 && recipe.matchPercentage < 70;
    if (selectedCategory === 'quick') return recipe.cookingTime <= 30;
    return true;
  });

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

  // 매칭률 색상 변환
  const getMatchColor = (percentage: number) => {
    if (percentage >= 70) return 'bg-green-100 text-green-800';
    if (percentage >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR');
    } catch {
      return dateString;
    }
  };

  return (
    <UserGuard>
      <div className={`min-h-screen ${COLOR_PRESETS.STATISTICS_PAGE.background} p-6`}>
        <div className="max-w-7xl mx-auto">
          {/* Main Card Container */}
          <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-8">
            
            {/* Header Card */}
            <PageHeader 
              title="레시피 추천"
              description="보유하고 있는 식재료를 기반으로 맞춤 레시피를 추천해드립니다"
              variant="statistics"
            >
              {/* Filter Controls */}
              <div className="flex justify-end">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-white/30 w-full max-w-xl">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === 'all' 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-white text-gray-700 hover:bg-orange-50'
                      }`}
                    >
                      전체
                    </button>
                    <button
                      onClick={() => setSelectedCategory('high-match')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === 'high-match' 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-white text-gray-700 hover:bg-orange-50'
                      }`}
                    >
                      높은 매칭률 (70%+)
                    </button>
                    <button
                      onClick={() => setSelectedCategory('medium-match')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === 'medium-match' 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-white text-gray-700 hover:bg-orange-50'
                      }`}
                    >
                      중간 매칭률 (40-69%)
                    </button>
                    <button
                      onClick={() => setSelectedCategory('quick')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === 'quick' 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-white text-gray-700 hover:bg-orange-50'
                      }`}
                    >
                      빠른 요리 (30분 이하)
                    </button>
                  </div>
                </div>
              </div>
            </PageHeader>

            {/* User Ingredients Section */}
            <SectionCard title="🧺 보유 식재료" variant="statistics">
              <div className="flex flex-wrap gap-2">
                {userIngredients.map((ingredient, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 rounded-full text-sm font-medium border border-orange-200"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
              <div className="mt-4 text-sm text-gray-600">
                💡 팁: 실제로는 재고 관리 시스템과 연동하여 현재 보유 중인 식재료를 자동으로 불러옵니다.
              </div>
            </SectionCard>

            {/* Recommended Recipes */}
            <SectionCard title="🍽️ 추천 레시피" variant="statistics">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                  <p className="ml-4 text-gray-600">레시피를 분석하는 중...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="text-red-500 text-lg mb-4">⚠️ {error}</div>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    다시 시도
                  </button>
                </div>
              ) : filteredRecipes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-lg mb-4">선택한 조건에 맞는 레시피가 없습니다.</div>
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                  >
                    전체 레시피 보기
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredRecipes.map((recipe, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl shadow-sm border border-orange-100 p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => router.push(`/recipes/${index}`)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-medium overflow-hidden">
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
                            <h3 className="text-lg font-semibold text-gray-900">{recipe.title}</h3>
                            <p className="text-sm text-gray-500">
                              {recipe.userNickName} • {formatDate(recipe.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${getMatchColor(recipe.matchPercentage)}`}>
                            매칭률 {recipe.matchPercentage}%
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(recipe.difficultyLevel)}`}>
                            {getDifficultyText(recipe.difficultyLevel)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">{recipe.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* 보유 재료 */}
                        {recipe.matchingIngredients.length > 0 && (
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                            <h4 className="text-sm font-semibold text-green-800 mb-2">
                              ✅ 보유 재료 ({recipe.matchingIngredients.length}개)
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {recipe.matchingIngredients.slice(0, 3).map((ingredient, idx) => (
                                <span key={idx} className="px-2 py-1 bg-green-100 rounded-full text-xs text-green-700">
                                  {ingredient}
                                </span>
                              ))}
                              {recipe.matchingIngredients.length > 3 && (
                                <span className="px-2 py-1 bg-green-100 rounded-full text-xs text-green-700">
                                  +{recipe.matchingIngredients.length - 3}개 더
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* 필요한 재료 */}
                        {recipe.missingIngredients.length > 0 && (
                          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-4 border border-red-200">
                            <h4 className="text-sm font-semibold text-red-800 mb-2">
                              🛒 구매 필요 ({recipe.missingIngredients.length}개)
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {recipe.missingIngredients.slice(0, 3).map((ingredient, idx) => (
                                <span key={idx} className="px-2 py-1 bg-red-100 rounded-full text-xs text-red-700">
                                  {ingredient}
                                </span>
                              ))}
                              {recipe.missingIngredients.length > 3 && (
                                <span className="px-2 py-1 bg-red-100 rounded-full text-xs text-red-700">
                                  +{recipe.missingIngredients.length - 3}개 더
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>⏱️ {recipe.cookingTime}분</span>
                          <span>👨‍🍳 {getDifficultyText(recipe.difficultyLevel)}</span>
                        </div>
                        <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium">
                          레시피 보기
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

          </div>
        </div>
      </div>
    </UserGuard>
  );
}
