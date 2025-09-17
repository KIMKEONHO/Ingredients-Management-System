'use client';

import { useState, useEffect } from 'react';
import { UserGuard } from '@/lib/auth/authGuard';
import { COLOR_PRESETS } from '@/lib/constants/colors';
import PageHeader from '../components/ui/PageHeader';
import SectionCard from '../components/ui/SectionCard';

interface Recipe {
  id: number;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  calories: number;
  imageUrl?: string;
  tags: string[];
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // 더미 데이터 (실제로는 API에서 가져올 데이터)
  const dummyRecipes: Recipe[] = [
    {
      id: 1,
      name: '닭가슴살 샐러드',
      description: '단백질이 풍부하고 칼로리가 낮은 건강한 샐러드',
      ingredients: ['닭가슴살 200g', '양상추 100g', '토마토 1개', '오이 1/2개', '올리브오일 1큰술'],
      instructions: [
        '닭가슴살을 소금, 후추로 간을 맞춘 후 팬에 굽습니다.',
        '양상추를 씻어서 먹기 좋은 크기로 자릅니다.',
        '토마토와 오이를 썰어줍니다.',
        '모든 재료를 접시에 담고 올리브오일 드레싱을 뿌립니다.'
      ],
      cookingTime: 20,
      difficulty: 'easy',
      calories: 280,
      tags: ['건강식', '단백질', '저칼로리']
    },
    {
      id: 2,
      name: '연어 스테이크',
      description: '오메가3가 풍부한 연어를 이용한 고급 요리',
      ingredients: ['연어 300g', '브로콜리 100g', '감자 2개', '버터 2큰술', '레몬 1/2개'],
      instructions: [
        '연어에 소금, 후추를 뿌리고 10분간 재워둡니다.',
        '팬에 버터를 녹이고 연어를 앞뒤로 4분씩 굽습니다.',
        '브로콜리와 감자를 삶아서 곁들입니다.',
        '완성된 연어에 레몬즙을 뿌려서 서빙합니다.'
      ],
      cookingTime: 30,
      difficulty: 'medium',
      calories: 450,
      tags: ['고급요리', '오메가3', '단백질']
    },
    {
      id: 3,
      name: '토마토 파스타',
      description: '신선한 토마토로 만드는 클래식한 이탈리안 파스타',
      ingredients: ['스파게티 200g', '토마토 3개', '마늘 3쪽', '바질 잎 10장', '파마산 치즈'],
      instructions: [
        '토마토를 끓는 물에 넣어 껍질을 벗기고 다진다.',
        '마늘을 다져서 올리브오일에 볶습니다.',
        '토마토를 넣고 끓인 후 소금, 설탕으로 간을 맞춥니다.',
        '삶은 파스타와 소스를 섞고 바질과 파마산 치즈를 올립니다.'
      ],
      cookingTime: 25,
      difficulty: 'easy',
      calories: 380,
      tags: ['이탈리안', '파스타', '채식']
    }
  ];

  useEffect(() => {
    // 로딩 시뮬레이션
    setTimeout(() => {
      setRecipes(dummyRecipes);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || recipe.difficulty === selectedDifficulty;
    const matchesTag = selectedTag === 'all' || recipe.tags.includes(selectedTag);
    
    return matchesSearch && matchesDifficulty && matchesTag;
  });

  const allTags = Array.from(new Set(recipes.flatMap(recipe => recipe.tags)));

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '쉬움';
      case 'medium': return '보통';
      case 'hard': return '어려움';
      default: return difficulty;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
                      <select
                        value={selectedTag}
                        onChange={(e) => setSelectedTag(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="all">모든 태그</option>
                        {allTags.map(tag => (
                          <option key={tag} value={tag}>{tag}</option>
                        ))}
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
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRecipes.map(recipe => (
                    <div
                      key={recipe.id}
                      className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedRecipe(recipe)}
                    >
                      <div className="aspect-w-16 aspect-h-9 mb-4">
                        <div className="w-full h-48 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center border border-green-200">
                          <span className="text-gray-500 text-4xl">🍽️</span>
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{recipe.name}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">{recipe.description}</p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                          {getDifficultyText(recipe.difficulty)}
                        </span>
                        <span className="text-sm text-gray-500">⏱️ {recipe.cookingTime}분</span>
                        <span className="text-sm text-gray-500">🔥 {recipe.calories}kcal</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {recipe.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {filteredRecipes.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">검색 조건에 맞는 레시피가 없습니다.</p>
                </div>
              )}
            </SectionCard>

            {/* Recipe Detail Modal */}
            {selectedRecipe && (
              <div className="fixed inset-0 z-50">
                <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedRecipe(null)} />
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-gray-900">{selectedRecipe.name}</h2>
                      <button 
                        onClick={() => setSelectedRecipe(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className="mb-6">
                      <div className="w-full h-64 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center mb-4 border border-green-200">
                        <span className="text-gray-500 text-4xl">🍽️</span>
                      </div>
                      <p className="text-gray-600 mb-4">{selectedRecipe.description}</p>
                      
                      <div className="flex items-center gap-4 mb-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedRecipe.difficulty)}`}>
                          {getDifficultyText(selectedRecipe.difficulty)}
                        </span>
                        <span className="text-sm text-gray-500">⏱️ {selectedRecipe.cookingTime}분</span>
                        <span className="text-sm text-gray-500">🔥 {selectedRecipe.calories}kcal</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">필요한 재료</h3>
                        <ul className="space-y-2">
                          {selectedRecipe.ingredients.map((ingredient, index) => (
                            <li key={index} className="flex items-center text-gray-700">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                              {ingredient}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">조리 방법</h3>
                        <ol className="space-y-2">
                          {selectedRecipe.instructions.map((instruction, index) => (
                            <li key={index} className="flex text-gray-700">
                              <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 flex-shrink-0">
                                {index + 1}
                              </span>
                              <span>{instruction}</span>
                            </li>
                          ))}
                        </ol>
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
