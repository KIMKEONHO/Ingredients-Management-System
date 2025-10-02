'use client'

import { useState, useEffect } from 'react'
import { categoryService, Category } from '@/lib/api/services/categoryService'
import AdminSidebar from '../components/sidebar'
import AdminGuard from '@/lib/auth/adminGuard'

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        const data = await categoryService.getAllCategories()
        setCategories(data)
      } catch (err) {
        setError('카테고리 조회에 실패했습니다')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  // 검색 필터링
  const filteredCategories = categories.filter(category =>
    category.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // 페이지네이션
  const itemsPerPage = 5
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentCategories = filteredCategories.slice(startIndex, endIndex)

  const deleteCategory = async (id: number) => {
    if (confirm('정말로 이 카테고리를 삭제하시겠습니까?')) {
      try {
        await categoryService.deleteCategory(id)
        setCategories(prev => prev.filter(category => category.id !== id))
      } catch (error) {
        console.error('카테고리 삭제 실패:', error)
        alert('카테고리 삭제에 실패했습니다.')
      }
    }
  }

  const editCategory = async (id: number, newName: string) => {
    try {
      await categoryService.updateCategory(id, { name: newName })
      setCategories(prev =>
        prev.map(category =>
          category.id === id ? { ...category, name: newName } : category
        )
      )
    } catch (error) {
      console.error('카테고리 수정 실패:', error)
      alert('카테고리 수정에 실패했습니다.')
    }
  }

  const addCategory = async () => {
    if (newCategoryName.trim()) {
      try {
        await categoryService.createCategory({ name: newCategoryName.trim() })
        // 성공 시 목록 새로고침
        const data = await categoryService.getAllCategories()
        setCategories(data)
        setIsAddModalOpen(false);
        setNewCategoryName('');
      } catch (error) {
        console.error('카테고리 추가 실패:', error)
        alert('카테고리 추가에 실패했습니다.')
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-6">
        
        {/* Main Card Container */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">카테고리 관리</h1>
            <p className="text-gray-600 mt-1">카테고리 목록을 관리하고 새로운 카테고리를 추가할 수 있습니다.</p>
          </div>

          {/* Category List Card */}
          <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-white rounded-t-lg">
              <h2 className="text-lg font-semibold text-gray-900">카테고리 목록</h2>
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
                      placeholder="카테고리명 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
                >
                  + 카테고리 추가
                </button>
              </div>
            </div>

        {/* Category Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리명</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{category.name || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">ID: {category.id || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            const newName = prompt('새 카테고리 이름을 입력하세요:', category.name || '')
                            if (newName && newName.trim() && category.id) {
                              editCategory(category.id, newName.trim())
                            }
                          }}
                          className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 px-3 py-1 rounded-md transition-colors"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => category.id && deleteCategory(category.id)}
                          className="text-red-600 hover:text-red-900 hover:bg-red-50 px-3 py-1 rounded-md transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* No results message */}
          {currentCategories.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-gray-500">검색 결과가 없습니다.</p>
              <p className="text-sm text-gray-400">다른 검색어를 시도해보세요.</p>
            </div>
          )}
        </div>

        {/* 페이징 컨트롤 */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
                  <span className="font-medium">{Math.min(endIndex, filteredCategories.length)}</span>
                  {' of '}
                  <span className="font-medium">{filteredCategories.length}</span>
                  {' results'}
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                        onClick={() => setCurrentPage(pageNum)}
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
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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

      </div>

      {/* 새 카테고리 추가 모달 */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">새 카테고리 추가</h3>
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setNewCategoryName('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="space-y-4">
                {/* 카테고리명 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    카테고리명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="카테고리 이름을 입력하세요"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setNewCategoryName('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={addCategory}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  추가
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CategoriesPageWithGuard() {
  return (
    <AdminGuard>
      <CategoriesPage />
    </AdminGuard>
  );
}
