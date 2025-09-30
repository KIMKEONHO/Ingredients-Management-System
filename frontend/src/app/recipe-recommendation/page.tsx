'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserGuard } from '@/lib/auth/authGuard';
import { COLOR_PRESETS } from '@/lib/constants/colors';
import PageHeader from '../components/ui/PageHeader';
import SectionCard from '../components/ui/SectionCard';
import { recipeService, AllRecipeResponseDto } from '@/lib/api/services/recipeService';
import { inventoryService, FoodInventory } from '@/lib/api/services/inventoryService';
import { ingredientService, Ingredient } from '@/lib/api/services/ingredientService';

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
  const [userIngredients, setUserIngredients] = useState<string[]>([]);
  const [ingredientsMap, setIngredientsMap] = useState<Map<number, Ingredient>>(new Map());

  // 사용자 보유 식재료 로드
  useEffect(() => {
    const fetchUserIngredients = async () => {
      try {
        // 식재료 정보 로드
        const ingredientsData = await ingredientService.getAllIngredients();
        const newIngredientsMap = new Map<number, Ingredient>();
        ingredientsData.forEach(ingredient => {
          if (ingredient.id) {
            newIngredientsMap.set(ingredient.id, ingredient);
          }
        });
        setIngredientsMap(newIngredientsMap);

        // 사용자 재고 정보 로드
        const inventoryData = await inventoryService.getInventory();
        
        // 재고에서 식재료명 추출
        const userIngredientNames = inventoryData
          .map(item => {
            const ingredient = item.ingredientId ? newIngredientsMap.get(item.ingredientId) : null;
            return ingredient?.name || item.ingredientName || '';
          })
          .filter(name => name.trim() !== '')
          .map(name => name.toLowerCase());

        // 중복 제거
        const uniqueIngredients = [...new Set(userIngredientNames)];
        setUserIngredients(uniqueIngredients);
        
        console.log('사용자 보유 식재료:', uniqueIngredients);
      } catch (error) {
        console.error('사용자 식재료 로드 실패:', error);
        // 기본값으로 설정
        setUserIngredients([
          '토마토', '양파', '마늘', '올리브오일', '소금', '후추', 
          '닭가슴살', '파스타', '치즈', '바질', '당근', '감자'
        ]);
      }
    };

    fetchUserIngredients();
  }, []);

  // 레시피 추천 데이터 로드
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (userIngredients.length === 0) return; // 사용자 식재료가 로드될 때까지 대기
      
      try {
        setIsLoading(true);
        setError(null);
        
        const allRecipes = await recipeService.getAllRecipes();
        
        // 서버에서 받아온 데이터 검사
        console.log('=== 레시피 데이터 검사 ===');
        console.log('전체 레시피 수:', allRecipes.length);
        
        allRecipes.forEach((recipe, index) => {
          console.log(`레시피 ${index + 1}:`, {
            title: recipe.title,
            imageUrl: recipe.imageUrl,
            imageUrlType: typeof recipe.imageUrl,
            hasImageUrl: !!recipe.imageUrl,
            imageUrlLength: recipe.imageUrl?.length || 0,
            imageUrlValid: recipe.imageUrl && recipe.imageUrl.trim() !== '',
            imageUrlStartsWithHttp: recipe.imageUrl?.startsWith('http'),
            imageUrlStartsWithSlash: recipe.imageUrl?.startsWith('/'),
            전체_레시피_객체: recipe
          });
        });
        
        // 이미지 URL 통계
        const recipesWithImage = allRecipes.filter(recipe => recipe.imageUrl && recipe.imageUrl.trim() !== '');
        const recipesWithAbsoluteUrl = allRecipes.filter(recipe => recipe.imageUrl?.startsWith('http'));
        const recipesWithRelativeUrl = allRecipes.filter(recipe => recipe.imageUrl?.startsWith('/'));
        
        console.log('=== 이미지 URL 통계 ===');
        console.log('이미지가 있는 레시피:', recipesWithImage.length, '/', allRecipes.length);
        console.log('절대 URL 레시피:', recipesWithAbsoluteUrl.length);
        console.log('상대 URL 레시피:', recipesWithRelativeUrl.length);
        console.log('이미지가 없는 레시피:', allRecipes.length - recipesWithImage.length);
        
        // 각 레시피에 대해 매칭률 계산
        const recommendations: RecommendedRecipe[] = allRecipes.map(recipe => {
          const recipeIngredients = recipe.recipeIngredientResponseDto.map(
            ing => ing.ingredientName.toLowerCase()
          );
          
          // 더 정확한 매칭 로직
          const matchingIngredients = recipeIngredients.filter(ingredient =>
            userIngredients.some(userIng => {
              // 정확한 매칭
              if (userIng === ingredient) return true;
              // 부분 매칭 (사용자 식재료가 레시피 식재료에 포함)
              if (ingredient.includes(userIng)) return true;
              // 부분 매칭 (레시피 식재료가 사용자 식재료에 포함)
              if (userIng.includes(ingredient)) return true;
              return false;
            })
          );
          
          const missingIngredients = recipeIngredients.filter(ingredient =>
            !userIngredients.some(userIng => {
              if (userIng === ingredient) return true;
              if (ingredient.includes(userIng)) return true;
              if (userIng.includes(ingredient)) return true;
              return false;
            })
          );
          
          const matchPercentage = recipeIngredients.length > 0 
            ? Math.round((matchingIngredients.length / recipeIngredients.length) * 100)
            : 0;
          
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
  }, [userIngredients]);

  // 카테고리별 필터링
  const filteredRecipes = recommendedRecipes.filter(recipe => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'high-match') return recipe.matchPercentage >= 70;
    if (selectedCategory === 'medium-match') return recipe.matchPercentage >= 40 && recipe.matchPercentage < 70;
    if (selectedCategory === 'quick') return recipe.cookingTime <= 30;
    if (selectedCategory === 'easy') return recipe.difficultyLevel <= 2;
    if (selectedCategory === 'medium') return recipe.difficultyLevel === 3;
    if (selectedCategory === 'hard') return recipe.difficultyLevel >= 4;
    return true;
  });

  // 난이도 텍스트 변환 (1-5 단계)
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

  // 난이도 색상 변환 (1-5 단계)
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

  // 난이도 아이콘 변환
  const getDifficultyIcon = (level: number) => {
    switch (level) {
      case 1: return '🟢';
      case 2: return '🔵';
      case 3: return '🟡';
      case 4: return '🟠';
      case 5: return '🔴';
      default: return '⚪';
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
                    <button
                      onClick={() => setSelectedCategory('easy')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === 'easy' 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-white text-gray-700 hover:bg-orange-50'
                      }`}
                    >
                      🟢 쉬운 요리
                    </button>
                    <button
                      onClick={() => setSelectedCategory('medium')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === 'medium' 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-white text-gray-700 hover:bg-orange-50'
                      }`}
                    >
                      🟡 보통 난이도
                    </button>
                    <button
                      onClick={() => setSelectedCategory('hard')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === 'hard' 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-white text-gray-700 hover:bg-orange-50'
                      }`}
                    >
                      🔴 어려운 요리
                    </button>
                  </div>
                </div>
              </div>
            </PageHeader>

            {/* User Ingredients Section */}
            <SectionCard title="🧺 보유 식재료" variant="statistics">
              {userIngredients.length > 0 ? (
                <>
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
                    💡 총 {userIngredients.length}개의 식재료를 보유하고 있습니다. 이 재료들을 활용한 레시피를 추천해드립니다.
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 text-lg mb-4">보유 중인 식재료가 없습니다</div>
                  <button
                    onClick={() => router.push('/inventory')}
                    className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                  >
                    식재료 추가하러 가기
                  </button>
                </div>
              )}
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
                  <div className="text-gray-500 text-lg mb-4">
                    {userIngredients.length === 0 
                      ? '보유 식재료가 없어 레시피를 추천할 수 없습니다.'
                      : '선택한 조건에 맞는 레시피가 없습니다.'
                    }
                  </div>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                    >
                      전체 레시피 보기
                    </button>
                    {userIngredients.length === 0 && (
                      <button
                        onClick={() => router.push('/inventory')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        식재료 추가하기
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredRecipes.map((recipe, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl shadow-sm border border-orange-100 p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => router.push(`/recipes/${index}`)}
                    >
                      <div className="flex items-start gap-6 mb-4">
                        {/* 레시피 이미지 - 크기 증가 */}
                        <div className="w-48 h-48 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                          {recipe.imageUrl ? (
                            <img 
                              src={recipe.imageUrl} 
                              alt={recipe.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // 이미지 로드 실패 시 기본 이미지로 대체
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-200 to-yellow-200">
                                      <span class="text-6xl">🍽️</span>
                                    </div>
                                  `;
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-200 to-yellow-200">
                              <span className="text-6xl">🍽️</span>
                            </div>
                          )}
                        </div>
                        
                        {/* 레시피 정보 - 오른쪽에 배치 */}
                        <div className="flex-1 min-w-0">
                          {/* 제목과 작성자 정보 */}
                          <div className="mb-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{recipe.title}</h3>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-medium overflow-hidden">
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
                                <p className="text-sm font-medium text-gray-700">{recipe.userNickName}</p>
                                <p className="text-xs text-gray-500">{formatDate(recipe.createdAt)}</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* 매칭률과 난이도 */}
                          <div className="flex items-center gap-3 mb-4">
                            <span className={`px-4 py-2 rounded-full text-sm font-bold ${getMatchColor(recipe.matchPercentage)}`}>
                              매칭률 {recipe.matchPercentage}%
                            </span>
                            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getDifficultyColor(recipe.difficultyLevel)} flex items-center gap-2`}>
                              <span>{getDifficultyIcon(recipe.difficultyLevel)}</span>
                              <span>{getDifficultyText(recipe.difficultyLevel)}</span>
                            </span>
                          </div>
                          
                          {/* 레시피 설명 */}
                          <p className="text-gray-600 line-clamp-3 text-sm leading-relaxed">{recipe.description}</p>
                        </div>
                      </div>
                      
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
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <span className="flex items-center gap-2">
                            <span className="text-lg">⏱️</span>
                            <span className="font-medium">{recipe.cookingTime}분</span>
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="text-lg">👥</span>
                            <span className="font-medium">1인분</span>
                          </span>
                        </div>
                        <button className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium shadow-sm">
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
