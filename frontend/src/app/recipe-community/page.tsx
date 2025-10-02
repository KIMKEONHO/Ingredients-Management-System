'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserGuard } from '@/lib/auth/authGuard';
import { COLOR_PRESETS } from '@/lib/constants/colors';
import PageHeader from '../components/ui/PageHeader';
import SectionCard from '../components/ui/SectionCard';
import { recipeService, AllRecipeResponseDto } from '@/lib/api/services/recipeService';

export default function RecipeCommunityPage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<AllRecipeResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // 레시피 데이터 로드
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const recipesData = await recipeService.getAllRecipes();
        console.log('레시피 공유 페이지 - API에서 받은 레시피 목록:', recipesData);
        console.log('레시피 공유 페이지 - 각 레시피의 ID들:', recipesData.map(recipe => ({ id: recipe.recipeId, title: recipe.title })));
        console.log('레시피 공유 페이지 - 이미지 URL들:', recipesData.map(recipe => ({ id: recipe.recipeId, title: recipe.title, imageUrl: recipe.imageUrl })));
        setRecipes(recipesData);
      } catch (error) {
        console.error('레시피 데이터 로드 실패:', error);
        setError('레시피 데이터를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  // 검색 필터링
  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.userNickName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <UserGuard>
      <div className={`min-h-screen ${COLOR_PRESETS.STATISTICS_PAGE.background} p-6`}>
        <div className="max-w-7xl mx-auto">
          {/* Main Card Container */}
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8">
            
            {/* Header Card */}
            <PageHeader 
              title="레시피 공유 커뮤니티"
              description="맛있는 레시피를 공유하고 다른 사람들의 요리법을 확인해보세요"
              variant="statistics"
            >
              {/* Search and Controls */}
              <div className="flex justify-end">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-white/30 w-full max-w-2xl">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="제목, 설명, 작성자로 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={() => router.push('/recipes/write')}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        레시피 작성
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </PageHeader>

            {/* Recipes List Card */}
            <SectionCard title="커뮤니티 레시피" variant="statistics" className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                  <p className="ml-4 text-gray-600">레시피를 불러오는 중...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="text-red-500 text-lg mb-4">⚠️ {error}</div>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    다시 시도
                  </button>
                </div>
              ) : filteredRecipes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-lg mb-4">
                    {searchTerm ? '검색 조건에 맞는 레시피가 없습니다.' : '아직 등록된 레시피가 없습니다.'}
                  </div>
                  <button
                    onClick={() => router.push('/recipes/write')}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    첫 번째 레시피 작성하기
                  </button>
                </div>
              ) : (
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {filteredRecipes.map((recipe, index) => (
                    <div
                      key={recipe.recipeId}
                      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                      onClick={() => {
                        console.log('레시피 공유 페이지 - 클릭된 레시피 ID:', recipe.recipeId, 'type:', typeof recipe.recipeId);
                        router.push(`/recipes/${recipe.recipeId}`);
                      }}
                    >
                      {/* 이미지 섹션 */}
                      <div className="relative aspect-square overflow-hidden bg-gray-100">
                        {recipe.imageUrl && recipe.imageUrl.trim() !== '' ? (
                          <img 
                            src={recipe.imageUrl} 
                            alt={recipe.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onLoad={() => {
                              console.log('이미지 로드 성공:', recipe.imageUrl);
                            }}
                            onError={(e) => {
                              console.log('이미지 로드 실패:', recipe.imageUrl);
                              // 이미지 로드 실패 시 기본 이미지로 대체
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="w-full h-full bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center">
                                    <div class="text-6xl opacity-30">🍳</div>
                                  </div>
                                `;
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center">
                            <div className="text-6xl opacity-30">🍳</div>
                          </div>
                        )}
                        {/* 난이도 배지 */}
                        <div className="absolute top-3 right-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficultyLevel)} backdrop-blur-sm bg-white/80`}>
                            {getDifficultyText(recipe.difficultyLevel)}
                          </span>
                        </div>
                        {/* 조리시간 배지 */}
                        <div className="absolute top-3 left-3">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-black/50 text-white backdrop-blur-sm">
                            ⏱️ {recipe.cookingTime}분
                          </span>
                        </div>
                      </div>

                      {/* 콘텐츠 섹션 */}
                      <div className="p-4">
                        {/* 사용자 정보 */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium overflow-hidden">
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
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{recipe.userNickName}</p>
                            <p className="text-xs text-gray-500">{formatDate(recipe.createdAt)}</p>
                          </div>
                        </div>

                        {/* 레시피 제목 */}
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {recipe.title}
                        </h3>
                        
                        {/* 레시피 설명 */}
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{recipe.description}</p>
                        
                        {/* 주요 재료 */}
                        {recipe.recipeIngredientResponseDto && recipe.recipeIngredientResponseDto.length > 0 && (
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-1">
                              {recipe.recipeIngredientResponseDto.slice(0, 3).map((ingredient, idx) => (
                                <span key={idx} className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
                                  {ingredient.ingredientName}
                                </span>
                              ))}
                              {recipe.recipeIngredientResponseDto.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-500">
                                  +{recipe.recipeIngredientResponseDto.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* 하단 액션 영역 */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <span>👁️</span>
                              <span>{recipe.viewCount?.toLocaleString() || 0}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="text-red-500">❤️</span>
                              <span>{recipe.likeCount?.toLocaleString() || 0}</span>
                            </span>
                          </div>
                          <div className="text-xs text-blue-600 font-medium group-hover:text-blue-700">
                            자세히 보기 →
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              )}
            </SectionCard>


          </div>
        </div>
      </div>
    </UserGuard>
  );
}