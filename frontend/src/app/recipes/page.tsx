'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserGuard } from '@/lib/auth/authGuard';
import { COLOR_PRESETS } from '@/lib/constants/colors';
import PageHeader from '../components/ui/PageHeader';
import SectionCard from '../components/ui/SectionCard';
import { recipeService, AllRecipeResponseDto } from '@/lib/api/services/recipeService';

export default function RecipesPage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<AllRecipeResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // 레시피 목록 로드
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const allRecipes = await recipeService.getAllRecipes();
        console.log('API에서 받은 레시피 목록:', allRecipes);
        console.log('첫 번째 레시피의 recipeId:', allRecipes[0]?.recipeId, 'type:', typeof allRecipes[0]?.recipeId);
        setRecipes(allRecipes);
      } catch (error) {
        console.error('레시피 목록 로드 실패:', error);
        setError('레시피 목록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || 
                             (selectedDifficulty === 'easy' && recipe.difficultyLevel === 1) ||
                             (selectedDifficulty === 'medium' && recipe.difficultyLevel === 2) ||
                             (selectedDifficulty === 'hard' && recipe.difficultyLevel === 3);
    
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyText = (level: number) => {
    switch (level) {
      case 1: return '쉬움';
      case 2: return '보통';
      case 3: return '어려움';
      default: return '보통';
    }
  };

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      case 3: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRecipeClick = (recipeId: number) => {
    console.log('레시피 클릭 - recipeId:', recipeId, 'type:', typeof recipeId);
    router.push(`/recipes/${recipeId}`);
  };

  return (
    <UserGuard>
      <div className={`min-h-screen ${COLOR_PRESETS.STATISTICS_PAGE.background} p-6`}>
        <div className="max-w-7xl mx-auto">
          {/* Main Card Container */}
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8">
            
            {/* Header Card */}
            <PageHeader 
              title="레시피 추천"
              description="보유 재고를 활용한 다양한 레시피를 추천해드립니다"
              variant="statistics"
            >
              {/* Search and Filter */}
              <div className="flex justify-end">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-white/30 w-full max-w-2xl">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="레시피 이름이나 설명으로 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-4">
                      <select
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="all">모든 난이도</option>
                        <option value="easy">쉬움</option>
                        <option value="medium">보통</option>
                        <option value="hard">어려움</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </PageHeader>

            {/* Recipes Grid Card */}
            <SectionCard title="추천 레시피" variant="statistics">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                  <p className="ml-4 text-gray-600">레시피를 불러오는 중...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-500 text-lg mb-4">⚠️ {error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    다시 시도
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRecipes.map(recipe => (
                    <div
                      key={recipe.recipeId}
                      className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleRecipeClick(recipe.recipeId)}
                    >
                      <div className="aspect-w-16 aspect-h-9 mb-4">
                        <div className="w-full h-48 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center border border-green-200">
                          <span className="text-gray-500 text-4xl">🍽️</span>
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{recipe.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">{recipe.description}</p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficultyLevel)}`}>
                          {getDifficultyText(recipe.difficultyLevel)}
                        </span>
                        <span className="text-sm text-gray-500">⏱️ {recipe.cookingTime}분</span>
                        <span className="text-sm text-gray-500">👤 {recipe.userNickName}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>재료 {recipe.recipeIngredientResponseDto.length}개</span>
                        <span>{new Date(recipe.createdAt).toLocaleDateString('ko-KR')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {filteredRecipes.length === 0 && !isLoading && !error && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">검색 조건에 맞는 레시피가 없습니다.</p>
                </div>
              )}
            </SectionCard>

          </div>
        </div>
      </div>
    </UserGuard>
  );
}
