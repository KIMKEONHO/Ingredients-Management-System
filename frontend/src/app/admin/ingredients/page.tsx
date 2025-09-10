'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from '../components/sidebar'
import AdminGuard from '@/lib/auth/adminGuard'
import { ingredientService, Ingredient } from '@/lib/api/services/ingredientService'
import { categoryService, Category } from '@/lib/api/services/categoryService'

interface NewIngredient {
  name: string
  description: string
  category: string
  price: number
  unit: string
  supplier: string
  storagePeriod: number
}

function AdminIngredientsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('전체')
  const [sortBy, setSortBy] = useState('이름순')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newIngredient, setNewIngredient] = useState<NewIngredient>({
    name: '',
    description: '',
    category: '',
    price: 0,
    unit: '',
    supplier: '',
    storagePeriod: 0
  })

  // 데이터 로딩
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [ingredientsData, categoriesData] = await Promise.all([
          ingredientService.getAllIngredients(),
          categoryService.getAllCategories()
        ])
        setIngredients(ingredientsData)
        setCategories(categoriesData)
      } catch (err) {
        setError('데이터 로딩에 실패했습니다')
        console.error('Failed to fetch data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // 검색 및 필터링
  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesSearch = ingredient.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ingredient.categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === '전체' || ingredient.categoryName === categoryFilter
    return matchesSearch && matchesCategory
  })

  // 정렬
  const sortedIngredients = [...filteredIngredients].sort((a, b) => {
    switch (sortBy) {
      case '이름순':
        return (a.name || '').localeCompare(b.name || '')
      case '카테고리순':
        return (a.categoryName || '').localeCompare(b.categoryName || '')
      case '최신순':
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      default:
        return 0
    }
  })

  const deleteIngredient = async (id: number) => {
    if (confirm('정말로 이 식재료를 삭제하시겠습니까?')) {
      try {
        // API 호출 (ingredientService에 deleteIngredient 함수가 있다고 가정)
        // await ingredientService.deleteIngredient(id)
        setIngredients(prev => prev.filter(ingredient => ingredient.id !== id))
        alert('식재료가 삭제되었습니다.')
      } catch (error) {
        console.error('삭제 실패:', error)
        alert('삭제에 실패했습니다.')
      }
    }
  }

  const editIngredient = async (id: number) => {
    const ingredient = ingredients.find(i => i.id === id)
    if (ingredient) {
      const newName = prompt('새 식재료 이름을 입력하세요:', ingredient.name || '')
      if (newName && newName.trim()) {
        try {
          // API 호출 (ingredientService에 updateIngredient 함수가 있다고 가정)
          // await ingredientService.updateIngredient(id, { name: newName.trim() })
          setIngredients(prev =>
            prev.map(i =>
              i.id === id ? { ...i, name: newName.trim() } : i
            )
          )
          alert('식재료가 수정되었습니다.')
        } catch (error) {
          console.error('수정 실패:', error)
          alert('수정에 실패했습니다.')
        }
      }
    }
  }

  const openModal = () => {
    setIsModalOpen(true)
    setNewIngredient({
      name: '',
      description: '',
      category: '',
      price: 0,
      unit: '',
      supplier: '',
      storagePeriod: 0
    })
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewIngredient(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'storagePeriod' ? Number(value) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newIngredient.name || !newIngredient.category || !newIngredient.unit || !newIngredient.supplier) {
      alert('필수 항목을 모두 입력해주세요.')
      return
    }

    try {
      // API 호출 (ingredientService에 createIngredient 함수가 있다고 가정)
      // const createdIngredient = await ingredientService.createIngredient(newIngredient)
      
      const newId = Math.max(...ingredients.map(i => i.id || 0), 0) + 1
      const today = new Date().toISOString().split('T')[0]
      
      const ingredientToAdd: Ingredient = {
        id: newId,
        name: newIngredient.name,
        categoryName: newIngredient.category,
        createdAt: today
      }

      setIngredients(prev => [...prev, ingredientToAdd])
      closeModal()
      alert('식재료가 추가되었습니다.')
    } catch (error) {
      console.error('추가 실패:', error)
      alert('추가에 실패했습니다.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">데이터를 불러오는 중...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="text-center text-red-600">
              <p className="text-lg font-medium">오류가 발생했습니다</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Q 식재료 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="전체">전체</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="이름순">이름순</option>
                <option value="카테고리순">카테고리순</option>
                <option value="최신순">최신순</option>
              </select>
            </div>

            <button
              onClick={openModal}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
            >
              + 식재료 추가
            </button>
          </div>
        </div>

        {/* Ingredient List Summary */}
        <div className="mb-4">
          <p className="text-gray-600">총 {sortedIngredients.length}개의 식재료</p>
        </div>

        {/* Ingredient Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">식재료명</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">생성일</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedIngredients.map((ingredient) => (
                  <tr key={ingredient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{ingredient.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">ID: {ingredient.id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {ingredient.categoryName || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ingredient.createdAt ? new Date(ingredient.createdAt).toLocaleDateString('ko-KR') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => editIngredient(ingredient.id || 0)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="편집"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteIngredient(ingredient.id || 0)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="삭제"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* No results message */}
          {sortedIngredients.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-gray-500">검색 결과가 없습니다.</p>
              <p className="text-sm text-gray-400">다른 검색어나 필터를 시도해보세요.</p>
            </div>
          )}
        </div>

        {/* 식재료 추가 모달 */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">새 식재료 추가</h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 식재료명 */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      식재료명 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newIngredient.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="식재료명을 입력하세요"
                      required
                    />
                  </div>

                  {/* 설명 */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      설명
                    </label>
                    <textarea
                      name="description"
                      value={newIngredient.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="식재료에 대한 설명을 입력하세요"
                    />
                  </div>

                  {/* 카테고리 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      카테고리 <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={newIngredient.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      required
                    >
                      <option value="">카테고리를 선택하세요</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.name}>{category.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* 가격 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      가격 (원)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={newIngredient.price}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="0"
                    />
                  </div>

                  {/* 단위 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      단위 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="unit"
                      value={newIngredient.unit}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="kg, 개, L 등"
                      required
                    />
                  </div>

                  {/* 공급업체 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      공급업체 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="supplier"
                      value={newIngredient.supplier}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="공급업체명을 입력하세요"
                      required
                    />
                  </div>

                  {/* 보관기간 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      보관기간 (일)
                    </label>
                    <input
                      type="number"
                      name="storagePeriod"
                      value={newIngredient.storagePeriod}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    추가
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}

export default function AdminIngredientsPageWithGuard() {
  return (
    <AdminGuard>
      <AdminIngredientsPage />
    </AdminGuard>
  );
}
