'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserGuard } from '@/lib/auth/authGuard';
import { COLOR_PRESETS } from '@/lib/constants/colors';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import ImageUpload from '../../components/ui/ImageUpload';
import IngredientInput from '../../components/ui/IngredientInput';
import { Ingredient } from '@/lib/api/services/ingredientService';

// 타입 정의
interface RecipeIngredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
  ingredientId?: number; // API에서 가져온 식재료 ID
}

interface RecipeStep {
  id: string;
  stepNumber: number;
  description: string;
  imageUrl?: string;
  cookingTime?: number;
}

interface RecipeFormData {
  title: string;
  description: string;
  cookingTime: number;
  difficultyLevel: number;
  servings: number;
  imageUrl: string;
  recipeType: string;
  isPublic: boolean;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
}

export default function RecipeWritePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RecipeFormData>({
    title: '',
    description: '',
    cookingTime: 0,
    difficultyLevel: 1,
    servings: 1,
    imageUrl: '',
    recipeType: 'MAIN',
    isPublic: true,
    ingredients: [],
    steps: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 재료 추가
  const addIngredient = () => {
    const newIngredient: RecipeIngredient = {
      id: Date.now().toString(),
      name: '',
      quantity: 0,
      unit: 'g',
      notes: ''
    };
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, newIngredient]
    }));
  };

  // 재료명 변경 시 식재료 정보 업데이트
  const handleIngredientNameChange = (id: string, name: string, ingredient?: Ingredient) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(item =>
        item.id === id 
          ? { 
              ...item, 
              name, 
              ingredientId: ingredient?.id || undefined 
            } 
          : item
      )
    }));
  };

  // 재료 삭제
  const removeIngredient = (id: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(ingredient => ingredient.id !== id)
    }));
  };

  // 재료 업데이트
  const updateIngredient = (id: string, field: keyof RecipeIngredient, value: any) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(ingredient =>
        ingredient.id === id ? { ...ingredient, [field]: value } : ingredient
      )
    }));
  };

  // 단계 추가
  const addStep = () => {
    const newStep: RecipeStep = {
      id: Date.now().toString(),
      stepNumber: formData.steps.length + 1,
      description: '',
      imageUrl: '',
      cookingTime: 0
    };
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  // 단계 삭제
  const removeStep = (id: string) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps
        .filter(step => step.id !== id)
        .map((step, index) => ({ ...step, stepNumber: index + 1 }))
    }));
  };

  // 단계 업데이트
  const updateStep = (id: string, field: keyof RecipeStep, value: any) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map(step =>
        step.id === id ? { ...step, [field]: value } : step
      )
    }));
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 여기에 API 호출 로직 추가
      console.log('레시피 데이터:', formData);
      
      // 임시로 성공 처리
      setTimeout(() => {
        alert('레시피가 성공적으로 작성되었습니다!');
        router.push('/recipe-community');
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      console.error('레시피 작성 실패:', error);
      alert('레시피 작성에 실패했습니다. 다시 시도해주세요.');
      setIsSubmitting(false);
    }
  };

  return (
    <UserGuard>
      <div className={`min-h-screen ${COLOR_PRESETS.STATISTICS_PAGE.background} p-6`}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8">
            
            {/* Header */}
            <PageHeader 
              title="레시피 작성"
              description="맛있는 레시피를 공유해보세요"
              variant="statistics"
            />

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* 기본 정보 */}
              <SectionCard title="레시피 기본 정보" variant="statistics">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      레시피 제목 *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="예: 집에서 만드는 완벽한 파스타"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      레시피 설명
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="레시피에 대한 간단한 설명을 작성해주세요"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      조리 시간 (분) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.cookingTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, cookingTime: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      어려움 단계 *
                    </label>
                    <select
                      required
                      value={formData.difficultyLevel}
                      onChange={(e) => setFormData(prev => ({ ...prev, difficultyLevel: parseInt(e.target.value) }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value={1}>1단계 - 매우 쉬움</option>
                      <option value={2}>2단계 - 쉬움</option>
                      <option value={3}>3단계 - 보통</option>
                      <option value={4}>4단계 - 어려움</option>
                      <option value={5}>5단계 - 매우 어려움</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      인분 *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.servings}
                      onChange={(e) => setFormData(prev => ({ ...prev, servings: parseInt(e.target.value) || 1 }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      음식 종류
                    </label>
                    <select
                      value={formData.recipeType}
                      onChange={(e) => setFormData(prev => ({ ...prev, recipeType: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="MAIN">메인 요리</option>
                      <option value="SIDE">사이드 요리</option>
                      <option value="DESSERT">디저트</option>
                      <option value="BEVERAGE">음료</option>
                      <option value="SNACK">간식</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      음식 이미지
                    </label>
                    <ImageUpload
                      value={formData.imageUrl}
                      onChange={(imageUrl) => setFormData(prev => ({ ...prev, imageUrl }))}
                      placeholder="레시피 대표 이미지를 업로드하세요"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.isPublic}
                        onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm font-medium text-gray-700">공개 레시피로 설정</span>
                    </label>
                  </div>
                </div>
              </SectionCard>

              {/* 재료 정보 */}
              <SectionCard title="필요한 재료" variant="statistics">
                <div className="space-y-4">
                  {formData.ingredients.map((ingredient, index) => (
                    <div key={ingredient.id} className="flex gap-4 items-end p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          재료명
                        </label>
                        <div className="flex items-center gap-2">
                          <IngredientInput
                            value={ingredient.name}
                            onChange={(name) => handleIngredientNameChange(ingredient.id, name)}
                            onSelectIngredient={(selectedIngredient) => 
                              handleIngredientNameChange(ingredient.id, selectedIngredient.name || '', selectedIngredient)
                            }
                            placeholder="예: 토마토"
                            className="flex-1"
                          />
                          {ingredient.ingredientId && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              검색됨
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-24">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          양
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={ingredient.quantity}
                          onChange={(e) => updateIngredient(ingredient.id, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div className="w-20">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          단위
                        </label>
                        <select
                          value={ingredient.unit}
                          onChange={(e) => updateIngredient(ingredient.id, 'unit', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="g">g</option>
                          <option value="kg">kg</option>
                          <option value="ml">ml</option>
                          <option value="L">L</option>
                          <option value="개">개</option>
                          <option value="큰술">큰술</option>
                          <option value="작은술">작은술</option>
                          <option value="컵">컵</option>
                          <option value="조금">조금</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          비고
                        </label>
                        <input
                          type="text"
                          value={ingredient.notes || ''}
                          onChange={(e) => updateIngredient(ingredient.id, 'notes', e.target.value)}
                          placeholder="선택사항, 대체 가능 등"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeIngredient(ingredient.id)}
                        className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
                  >
                    + 재료 추가
                  </button>
                </div>
              </SectionCard>

              {/* 조리 단계 */}
              <SectionCard title="조리 순서" variant="statistics">
                <div className="space-y-4">
                  {formData.steps.map((step, index) => (
                    <div key={step.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-semibold text-gray-900">
                          단계 {step.stepNumber}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeStep(step.id)}
                          className="px-3 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            조리 설명 *
                          </label>
                          <textarea
                            rows={3}
                            required
                            value={step.description}
                            onChange={(e) => updateStep(step.id, 'description', e.target.value)}
                            placeholder="이 단계에서 해야 할 일을 자세히 설명해주세요"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              소요 시간 (분)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={step.cookingTime || ''}
                              onChange={(e) => updateStep(step.id, 'cookingTime', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              단계 이미지
                            </label>
                            <ImageUpload
                              value={step.imageUrl || ''}
                              onChange={(imageUrl) => updateStep(step.id, 'imageUrl', imageUrl)}
                              placeholder="단계별 이미지를 업로드하세요"
                              className="h-32"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addStep}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
                  >
                    + 단계 추가
                  </button>
                </div>
              </SectionCard>

              {/* 제출 버튼 */}
              <div className="flex gap-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? '작성 중...' : '레시피 작성하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </UserGuard>
  );
}
