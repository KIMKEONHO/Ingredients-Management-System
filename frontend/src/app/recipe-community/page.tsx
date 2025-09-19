'use client';

import { useState, useEffect } from 'react';
import { UserGuard } from '@/lib/auth/authGuard';
import { COLOR_PRESETS } from '@/lib/constants/colors';
import PageHeader from '../components/ui/PageHeader';
import SectionCard from '../components/ui/SectionCard';

interface CommunityPost {
  id: number;
  title: string;
  content: string;
  author: string;
  authorAvatar?: string;
  createdAt: string;
  likes: number;
  comments: number;
  tags: string[];
  recipe?: {
    name: string;
    ingredients: string[];
    instructions: string[];
    cookingTime: number;
    difficulty: 'easy' | 'medium' | 'hard';
    calories: number;
  };
  images?: string[];
}

export default function RecipeCommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [isWritingPost, setIsWritingPost] = useState(false);

  // 더미 데이터
  const dummyPosts: CommunityPost[] = [
    {
      id: 1,
      title: '집에서 만드는 완벽한 파스타 레시피 공유해요!',
      content: '오늘은 집에서 쉽게 만들 수 있는 토마토 파스타 레시피를 공유하려고 해요. 정말 간단한데 맛있어서 자주 만들어 먹고 있습니다.',
      author: '요리초보',
      createdAt: '2024-01-15',
      likes: 24,
      comments: 8,
      tags: ['파스타', '이탈리안', '간단요리'],
      recipe: {
        name: '토마토 파스타',
        ingredients: ['스파게티 200g', '토마토 3개', '마늘 3쪽', '바질 잎 10장', '파마산 치즈'],
        instructions: [
          '토마토를 끓는 물에 넣어 껍질을 벗기고 다진다.',
          '마늘을 다져서 올리브오일에 볶습니다.',
          '토마토를 넣고 끓인 후 소금, 설탕으로 간을 맞춥니다.',
          '삶은 파스타와 소스를 섞고 바질과 파마산 치즈를 올립니다.'
        ],
        cookingTime: 25,
        difficulty: 'easy',
        calories: 380
      }
    },
    {
      id: 2,
      title: '건강한 닭가슴살 샐러드 조합 추천',
      content: '다이어트 중인데 닭가슴살 샐러드가 너무 질려서 다양한 조합을 시도해봤어요. 이번에 만든 조합이 정말 맛있었습니다!',
      author: '건강러버',
      createdAt: '2024-01-14',
      likes: 18,
      comments: 12,
      tags: ['샐러드', '건강식', '다이어트'],
      recipe: {
        name: '닭가슴살 샐러드',
        ingredients: ['닭가슴살 200g', '양상추 100g', '토마토 1개', '오이 1/2개', '올리브오일 1큰술'],
        instructions: [
          '닭가슴살을 소금, 후추로 간을 맞춘 후 팬에 굽습니다.',
          '양상추를 씻어서 먹기 좋은 크기로 자릅니다.',
          '토마토와 오이를 썰어줍니다.',
          '모든 재료를 접시에 담고 올리브오일 드레싱을 뿌립니다.'
        ],
        cookingTime: 20,
        difficulty: 'easy',
        calories: 280
      }
    },
    {
      id: 3,
      title: '연어 스테이크 완벽 구우기 팁',
      content: '연어 스테이크를 완벽하게 굽는 방법을 연구해봤는데, 온도와 시간이 정말 중요하더라고요. 여러분도 시도해보세요!',
      author: '고급요리사',
      createdAt: '2024-01-13',
      likes: 31,
      comments: 15,
      tags: ['연어', '스테이크', '고급요리'],
      recipe: {
        name: '연어 스테이크',
        ingredients: ['연어 300g', '브로콜리 100g', '감자 2개', '버터 2큰술', '레몬 1/2개'],
        instructions: [
          '연어에 소금, 후추를 뿌리고 10분간 재워둡니다.',
          '팬에 버터를 녹이고 연어를 앞뒤로 4분씩 굽습니다.',
          '브로콜리와 감자를 삶아서 곁들입니다.',
          '완성된 연어에 레몬즙을 뿌려서 서빙합니다.'
        ],
        cookingTime: 30,
        difficulty: 'medium',
        calories: 450
      }
    }
  ];

  useEffect(() => {
    setTimeout(() => {
      setPosts(dummyPosts);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === 'all' || post.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  const allTags = Array.from(new Set(posts.flatMap(post => post.tags)));

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
              title="레시피 공유 커뮤니티"
              description="맛있는 레시피를 공유하고 다른 사람들의 요리법을 확인해보세요"
              variant="statistics"
            >
              {/* Search and Filter */}
              <div className="flex justify-end">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-white/30 w-full max-w-2xl">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="제목이나 내용으로 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-4">
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
                      <button
                        onClick={() => setIsWritingPost(true)}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        글쓰기
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </PageHeader>

            {/* Posts List Card */}
            <SectionCard title="커뮤니티 게시글" variant="statistics">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredPosts.map(post => (
                    <div
                      key={post.id}
                      className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedPost(post)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                            {post.author.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                            <p className="text-sm text-gray-500">{post.author} • {post.createdAt}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>👍 {post.likes}</span>
                          <span>💬 {post.comments}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">{post.content}</p>
                      
                      {post.recipe && (
                        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 mb-4 border border-green-200">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-gray-700">🍽️ {post.recipe.name}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(post.recipe.difficulty)}`}>
                              {getDifficultyText(post.recipe.difficulty)}
                            </span>
                            <span className="text-xs text-gray-500">⏱️ {post.recipe.cookingTime}분</span>
                            <span className="text-xs text-gray-500">🔥 {post.recipe.calories}kcal</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            재료: {post.recipe.ingredients.slice(0, 3).join(', ')}
                            {post.recipe.ingredients.length > 3 && ` 외 ${post.recipe.ingredients.length - 3}개`}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-1">
                        {post.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {filteredPosts.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">검색 조건에 맞는 게시글이 없습니다.</p>
                </div>
              )}
            </SectionCard>

            {/* Post Detail Modal */}
            {selectedPost && (
              <div className="fixed inset-0 z-50">
                <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedPost(null)} />
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                          {selectedPost.author.charAt(0)}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">{selectedPost.title}</h2>
                          <p className="text-gray-500">{selectedPost.author} • {selectedPost.createdAt}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedPost(null)}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className="mb-6">
                      <p className="text-gray-700 leading-relaxed">{selectedPost.content}</p>
                    </div>

                    {selectedPost.recipe && (
                      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 mb-6 border border-green-200">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">🍽️ {selectedPost.recipe.name}</h3>
                        
                        <div className="flex items-center gap-4 mb-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedPost.recipe.difficulty)}`}>
                            {getDifficultyText(selectedPost.recipe.difficulty)}
                          </span>
                          <span className="text-sm text-gray-500">⏱️ {selectedPost.recipe.cookingTime}분</span>
                          <span className="text-sm text-gray-500">🔥 {selectedPost.recipe.calories}kcal</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-3">필요한 재료</h4>
                            <ul className="space-y-2">
                              {selectedPost.recipe.ingredients.map((ingredient, index) => (
                                <li key={index} className="flex items-center text-gray-700">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                                  {ingredient}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-3">조리 방법</h4>
                            <ol className="space-y-2">
                              {selectedPost.recipe.instructions.map((instruction, index) => (
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
                    )}

                    <div className="flex items-center justify-between pt-6 border-t">
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                          👍 좋아요 {selectedPost.likes}
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                          💬 댓글 {selectedPost.comments}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedPost.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Write Post Modal */}
            {isWritingPost && (
              <div className="fixed inset-0 z-50">
                <div className="absolute inset-0 bg-black/40" onClick={() => setIsWritingPost(false)} />
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">새 게시글 작성</h2>
                      <button 
                        onClick={() => setIsWritingPost(false)}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
                        <input
                          type="text"
                          placeholder="게시글 제목을 입력하세요"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
                        <textarea
                          rows={6}
                          placeholder="레시피나 요리 경험을 공유해주세요"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">태그</label>
                        <input
                          type="text"
                          placeholder="태그를 쉼표로 구분하여 입력하세요 (예: 파스타, 이탈리안, 간단요리)"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => setIsWritingPost(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        취소
                      </button>
                      <button
                        onClick={() => {
                          alert('게시글이 성공적으로 작성되었습니다!');
                          setIsWritingPost(false);
                        }}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        게시하기
                      </button>
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
