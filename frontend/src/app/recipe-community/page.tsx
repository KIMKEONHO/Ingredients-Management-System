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
  const [selectedRecipe, setSelectedRecipe] = useState<AllRecipeResponseDto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // 레시피 데이터 로드
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const recipesData = await recipeService.getAllRecipes();
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
            <SectionCard title="커뮤니티 레시피" variant="statistics">
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
                <div className="space-y-6">
                  {filteredRecipes.map((recipe, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedRecipe(recipe)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium overflow-hidden">
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
                        <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(recipe.difficultyLevel)}`}>
                            {getDifficultyText(recipe.difficultyLevel)}
                          </span>
                          <span className="text-sm text-gray-500">⏱️ {recipe.cookingTime}분</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">{recipe.description}</p>
                      
                      {recipe.recipeIngredientResponseDto && recipe.recipeIngredientResponseDto.length > 0 && (
                        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 mb-4 border border-green-200">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-gray-700">🍽️ 주요 재료</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {recipe.recipeIngredientResponseDto.slice(0, 5).map((ingredient, idx) => (
                              <span key={idx} className="px-2 py-1 bg-white rounded-full text-xs text-gray-700 border">
                                {ingredient.ingredientName} {ingredient.quantity}{ingredient.unit}
                              </span>
                            ))}
                            {recipe.recipeIngredientResponseDto.length > 5 && (
                              <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-500">
                                +{recipe.recipeIngredientResponseDto.length - 5}개 더
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            {/* Recipe Detail Modal */}
            {selectedRecipe && (
              <div className="fixed inset-0 z-50">
                <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedRecipe(null)} />
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium overflow-hidden">
                          {selectedRecipe.userProfile ? (
                            <img 
                              src={selectedRecipe.userProfile} 
                              alt={selectedRecipe.userNickName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            selectedRecipe.userNickName.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">{selectedRecipe.title}</h2>
                          <p className="text-gray-500">
                            {selectedRecipe.userNickName} • {formatDate(selectedRecipe.createdAt)}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedRecipe(null)}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className="mb-6">
                      <p className="text-gray-700 leading-relaxed">{selectedRecipe.description}</p>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${getDifficultyColor(selectedRecipe.difficultyLevel)}`}>
                        {getDifficultyText(selectedRecipe.difficultyLevel)}
                      </span>
                      <span className="text-sm text-gray-500">⏱️ {selectedRecipe.cookingTime}분</span>
                    </div>

                    {selectedRecipe.recipeIngredientResponseDto && selectedRecipe.recipeIngredientResponseDto.length > 0 && (
                      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 mb-6 border border-green-200">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">🍽️ 필요한 재료</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedRecipe.recipeIngredientResponseDto.map((ingredient, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                              <span className="font-medium text-gray-700">{ingredient.ingredientName}</span>
                              <span className="text-gray-600">{ingredient.quantity}{ingredient.unit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-6 border-t">
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                          👍 좋아요
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                          💬 댓글
                        </button>
                      </div>
                      <div className="text-sm text-gray-500">
                        작성일: {formatDate(selectedRecipe.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </UserGuard>
  );
}