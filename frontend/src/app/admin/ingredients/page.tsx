'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from '../components/sidebar'
import AdminGuard from '@/lib/auth/adminGuard'
import { ingredientService, Ingredient, CreateIngredientRequest, UpdateIngredientRequest } from '@/lib/api/services/ingredientService'
import { categoryService, Category } from '@/lib/api/services/categoryService'

interface NewIngredient {
  name: string
  categoryId: number
}

function AdminIngredientsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 페이징 상태
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10) // 페이지당 아이템 수
  
  // 체크박스 상태
  const [selectedIngredients, setSelectedIngredients] = useState<Set<number>>(new Set())

  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('전체')
  const [sortBy, setSortBy] = useState('이름순')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null)
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null)
  const [newIngredient, setNewIngredient] = useState<NewIngredient>({
    name: '',
    categoryId: 0
  })

  // 알림 함수
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

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
        showNotification('success', '데이터를 성공적으로 로딩했습니다.')
      } catch (err) {
        setError('데이터 로딩에 실패했습니다')
        showNotification('error', '데이터 로딩에 실패했습니다.')
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

  // 페이징 계산
  const totalItems = sortedIngredients.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedIngredients = sortedIngredients.slice(startIndex, endIndex)

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setSelectedIngredients(new Set())
  }

  // 검색/필터 변경 시 첫 페이지로 이동하고 선택 해제
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
    setSelectedIngredients(new Set())
  }

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value)
    setCurrentPage(1)
    setSelectedIngredients(new Set())
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    setCurrentPage(1)
    setSelectedIngredients(new Set())
  }

  // 체크박스 관련 함수들
  const handleSelectAll = () => {
    if (selectedIngredients.size === paginatedIngredients.length) {
      setSelectedIngredients(new Set())
    } else {
      setSelectedIngredients(new Set(paginatedIngredients.map(ingredient => ingredient.id || 0)))
    }
  }

  const handleSelectIngredient = (ingredientId: number) => {
    const newSelected = new Set(selectedIngredients)
    if (newSelected.has(ingredientId)) {
      newSelected.delete(ingredientId)
    } else {
      newSelected.add(ingredientId)
    }
    setSelectedIngredients(newSelected)
  }

  const handleBulkAction = async (action: string) => {
    if (selectedIngredients.size === 0) {
      showNotification('info', '선택된 식재료가 없습니다.')
      return
    }

    if (action === '일괄 삭제') {
      if (confirm(`정말로 선택된 ${selectedIngredients.size}개의 식재료를 삭제하시겠습니까?`)) {
        try {
          // 모든 선택된 식재료를 병렬로 삭제
          await Promise.all(
            Array.from(selectedIngredients).map(id => ingredientService.deleteIngredient(id))
          )
          
          // 로컬 상태에서 삭제된 식재료들 제거
          setIngredients(prev => prev.filter(ingredient => !selectedIngredients.has(ingredient.id || 0)))
          
          // 선택 상태 초기화
          setSelectedIngredients(new Set())
          
          showNotification('success', `${selectedIngredients.size}개의 식재료가 삭제되었습니다.`)
        } catch (error) {
          console.error('일괄 삭제 실패:', error)
          showNotification('error', '일괄 삭제에 실패했습니다.')
        }
      }
    } else {
      // 다른 일괄 작업들 (카테고리 변경, 내보내기 등)
      console.log(`${action} for ingredients:`, Array.from(selectedIngredients))
      showNotification('info', `${action} 처리: ${selectedIngredients.size}개의 식재료`)
    }
  }

  const deleteIngredient = async (id: number) => {
    if (confirm('정말로 이 식재료를 삭제하시겠습니까?')) {
      try {
        await ingredientService.deleteIngredient(id)
        setIngredients(prev => prev.filter(ingredient => ingredient.id !== id))
        showNotification('success', '식재료가 삭제되었습니다.')
      } catch (error) {
        console.error('삭제 실패:', error)
        showNotification('error', '삭제에 실패했습니다.')
      }
    }
  }

  const openEditModal = (ingredient: Ingredient) => {
    // ID 유효성 검증
    if (!ingredient.id) {
      showNotification('error', '유효하지 않은 식재료입니다.')
      return
    }

    setEditingIngredient(ingredient)
    setNewIngredient({
      name: ingredient.name || '',
      categoryId: categories.find(cat => cat.name === ingredient.categoryName)?.id || 0
    })
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setEditingIngredient(null)
    setNewIngredient({
      name: '',
      categoryId: 0
    })
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newIngredient.name || !newIngredient.categoryId || !editingIngredient?.id) {
      showNotification('error', '필수 항목을 모두 입력해주세요.')
      return
    }

    try {
      setIsSubmitting(true)
      
      // 백엔드 API 호출
      const ingredientData: UpdateIngredientRequest = {
        name: newIngredient.name,
        categoryId: newIngredient.categoryId
      }
      
      const updatedIngredient = await ingredientService.updateIngredient(editingIngredient.id, ingredientData)
      
      // 성공 시 로컬 상태 업데이트
      setIngredients(prev => prev.map(ingredient => 
        ingredient.id === editingIngredient.id ? { ...ingredient, ...updatedIngredient } : ingredient
      ))
      
      showNotification('success', '식재료가 수정되었습니다.')
      closeEditModal()
    } catch (error) {
      console.error('수정 실패:', error)
      showNotification('error', '수정에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openModal = () => {
    setIsModalOpen(true)
    setNewIngredient({
      name: '',
      categoryId: 0
    })
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewIngredient(prev => ({
      ...prev,
      [name]: name === 'categoryId' ? Number(value) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newIngredient.name || !newIngredient.categoryId) {
      showNotification('error', '필수 항목을 모두 입력해주세요.')
      return
    }

    try {
      setIsSubmitting(true)
      
      // 백엔드 API 호출
      const ingredientData: CreateIngredientRequest = {
        name: newIngredient.name,
        categoryId: newIngredient.categoryId
      }
      
      const createdIngredient = await ingredientService.createIngredient(ingredientData)
      
      // 성공 시 로컬 상태 업데이트
      setIngredients(prev => [...prev, createdIngredient])
      closeModal()
      showNotification('success', '식재료가 성공적으로 추가되었습니다.')
    } catch (error) {
      console.error('식재료 추가 실패:', error)
      showNotification('error', '식재료 추가에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
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
        
        {/* 토스트 알림 */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg max-w-sm ${
            notification.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
            notification.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
            'bg-blue-100 text-blue-800 border border-blue-200'
          }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {notification.type === 'success' && (
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.type === 'error' && (
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.type === 'info' && (
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setNotification(null)}
                  className="inline-flex text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Main Card Container */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">식재료 관리</h1>
            <p className="text-gray-600 mt-1">식재료 목록을 관리하고 새로운 식재료를 추가할 수 있습니다.</p>
          </div>

          {/* Ingredient List Card */}
          <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-white rounded-t-lg">
              <h2 className="text-lg font-semibold text-gray-900">식재료 목록</h2>
            </div>

            {/* Search and Filter */}
            <div className="px-6 py-4 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="식재료명 또는 카테고리 검색..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => handleCategoryFilterChange(e.target.value)}
                  className="block w-32 px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="전체">전체</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>{category.name}</option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="block w-32 px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="이름순">이름순</option>
                  <option value="카테고리순">카테고리순</option>
                  <option value="최신순">최신순</option>
                </select>
                <button
                  onClick={openModal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
                >
                  + 식재료 추가
                </button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedIngredients.size > 0 && (
              <div className="px-6 py-3 border-b border-gray-200 bg-blue-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700 font-medium">
                    {selectedIngredients.size}개의 식재료가 선택되었습니다
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleBulkAction('일괄 삭제')}
                      className="px-3 py-1 text-sm text-red-700 bg-red-100 hover:bg-red-200 rounded-md"
                    >
                      일괄 삭제
                    </button>
                    <button
                      onClick={() => handleBulkAction('카테고리 변경')}
                      className="px-3 py-1 text-sm text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md"
                    >
                      카테고리 변경
                    </button>
                    <button
                      onClick={() => handleBulkAction('내보내기')}
                      className="px-3 py-1 text-sm text-green-700 bg-green-100 hover:bg-green-200 rounded-md"
                    >
                      내보내기
                    </button>
                  </div>
                </div>
              </div>
            )}

        {/* Ingredient Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedIngredients.size === paginatedIngredients.length && paginatedIngredients.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">식재료명</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">생성일</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedIngredients.map((ingredient) => (
                  <tr key={ingredient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedIngredients.has(ingredient.id || 0)}
                        onChange={() => handleSelectIngredient(ingredient.id || 0)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
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
                          onClick={() => openEditModal(ingredient)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="편집"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            if (!ingredient.id) {
                              showNotification('error', '유효하지 않은 식재료입니다.')
                              return
                            }
                            deleteIngredient(ingredient.id)
                          }}
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
          {paginatedIngredients.length === 0 && (
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

        {/* 페이징 컨트롤 */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{startIndex + 1}</span>
                  {'-'}
                  <span className="font-medium">{Math.min(endIndex, totalItems)}</span>
                  {' of '}
                  <span className="font-medium">{totalItems}</span>
                  {' results'}
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">이전</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* 페이지 번호들 */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? 'z-10 bg-blue-600 border-blue-600 text-white'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">다음</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
          </div>
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
                <div className="space-y-4">
                  {/* 식재료명 */}
                  <div>
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

                  {/* 카테고리 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      카테고리 <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="categoryId"
                      value={newIngredient.categoryId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      required
                    >
                      <option value={0}>카테고리를 선택하세요</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        추가 중...
                      </>
                    ) : (
                      '추가'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 수정 모달 */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <form onSubmit={handleEditSubmit}>
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-900">식재료 수정</h3>
                  <button
                    onClick={closeEditModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  {/* 식재료명 */}
                  <div>
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

                  {/* 카테고리 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      카테고리 <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="categoryId"
                      value={newIngredient.categoryId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      required
                    >
                      <option value={0}>카테고리를 선택하세요</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        수정 중...
                      </>
                    ) : (
                      '수정'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
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
