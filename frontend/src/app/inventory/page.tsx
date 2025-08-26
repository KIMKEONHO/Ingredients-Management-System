'use client'

import { useState } from 'react'

interface InventoryItem {
  id: number
  name: string
  category: string
  quantity: string
  storageMethod: string
  expiryDate: string
  addedDate: string
  status: '보관중' | '폐기' | '사용완료'
  isExpired: boolean
  description: string
  image: string
}

export default function InventoryPage() {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    {
      id: 1,
      name: '토마토',
      category: '채소',
      quantity: '400g',
      storageMethod: '냉장',
      expiryDate: '2024-01-25',
      addedDate: '2024-01-20',
      status: '폐기',
      isExpired: true,
      description: '신선한 유기농 토마토, 샐러드와 요리에 활용',
      image: '/images/tomato.jpg'
    },
    {
      id: 2,
      name: '브로콜리',
      category: '채소',
      quantity: '300g',
      storageMethod: '냉장',
      expiryDate: '2024-01-26',
      addedDate: '2024-01-23',
      status: '보관중',
      isExpired: true,
      description: '영양이 풍부한 브로콜리, 찜이나 볶음 요리에',
      image: '/images/broccoli.jpg'
    },
    {
      id: 3,
      name: '바나나',
      category: '과일',
      quantity: '6개',
      storageMethod: '실온',
      expiryDate: '2024-01-27',
      addedDate: '2024-01-24',
      status: '보관중',
      isExpired: true,
      description: '달콤한 바나나, 간식이나 스무디에 활용',
      image: '/images/banana.jpg'
    },
    {
      id: 4,
      name: '우유',
      category: '유제품',
      quantity: '1L',
      storageMethod: '냉장',
      expiryDate: '2024-01-28',
      addedDate: '2024-01-22',
      status: '보관중',
      isExpired: true,
      description: '신선한 우유, 커피나 베이킹에 활용',
      image: '/images/milk.jpg'
    },
    {
      id: 5,
      name: '닭가슴살',
      category: '육류',
      quantity: '500g',
      storageMethod: '냉장',
      expiryDate: '2024-01-30',
      addedDate: '2024-01-20',
      status: '보관중',
      isExpired: true,
      description: '저지방 닭가슴살, 다이어트 식단에 적합',
      image: '/images/chicken.jpg'
    },
    {
      id: 6,
      name: '달걀',
      category: '축산물',
      quantity: '12개',
      storageMethod: '냉장',
      expiryDate: '2024-02-10',
      addedDate: '2024-01-18',
      status: '보관중',
      isExpired: false,
      description: '신선한 달걀, 다양한 요리에 활용 가능',
      image: '/images/eggs.jpg'
    },
    {
      id: 7,
      name: '양파',
      category: '채소',
      quantity: '1kg',
      storageMethod: '실온',
      expiryDate: '2024-02-15',
      addedDate: '2024-01-25',
      status: '보관중',
      isExpired: false,
      description: '기본 양념용 양파, 다양한 요리의 기본 재료',
      image: '/images/onion.jpg'
    },
    {
      id: 8,
      name: '감자',
      category: '채소',
      quantity: '2kg',
      storageMethod: '실온',
      expiryDate: '2024-02-20',
      addedDate: '2024-01-26',
      status: '보관중',
      isExpired: false,
      description: '다양한 요리에 활용 가능한 감자',
      image: '/images/potato.jpg'
    }
  ])

  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('전체')
  const [statusFilter, setStatusFilter] = useState('전체')
  const [storageFilter, setStorageFilter] = useState('전체')

  // 통계 계산
  const totalItems = inventoryItems.length
  const storedItems = inventoryItems.filter(item => item.status === '보관중').length
  const expiringItems = inventoryItems.filter(item => item.isExpired && item.status === '보관중').length
  const disposedItems = inventoryItems.filter(item => item.status === '폐기').length

  // 필터링
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === '전체' || item.category === categoryFilter
    const matchesStatus = statusFilter === '전체' || item.status === statusFilter
    const matchesStorage = storageFilter === '전체' || item.storageMethod === storageFilter
    
    return matchesSearch && matchesCategory && matchesStatus && matchesStorage
  })

  const updateStatus = (id: number, newStatus: InventoryItem['status']) => {
    setInventoryItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, status: newStatus } : item
      )
    )
  }

  const removeItem = (id: number) => {
    setInventoryItems(prev => prev.filter(item => item.id !== id))
  }

  const addNewItem = () => {
    setIsAddItemModalOpen(true)
  }

  const resetFilters = () => {
    setSearchQuery('')
    setCategoryFilter('전체')
    setStatusFilter('전체')
    setStorageFilter('전체')
  }

  const openFilterModal = () => {
    setIsFilterModalOpen(true)
  }

  const closeFilterModal = () => {
    setIsFilterModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 헤더 */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
                         <div className="flex items-center gap-4">
               <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                 <option>전체</option>
                 <option>식재료</option>
                 <option>레시피</option>
                 <option>도구</option>
               </select>
             </div>
            
            <div className="flex-1 relative max-w-md">
              <input
                type="text"
                placeholder="검색어를 입력해주세요"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* 인기 검색어 */}
          <div className="mt-4">
            <div className="text-sm text-gray-600 mb-2">인기 검색어</div>
            <div className="flex flex-wrap gap-2">
              {['채소', '과일', '육류', '유제품', '냉장', '실온', '신선', '유기농', '프리미엄', '할인', '만료임박', '신상품', '계절식재료', '수입식재료', '국내산', '친환경'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* 페이지 제목 */}
        <div className="mb-6">
                      <nav className="text-sm text-gray-500 mb-2">
              홈 &gt; 식재료 관리
            </nav>
                     <h1 className="text-2xl font-bold text-gray-900">
             식재료 관리
           </h1>
        </div>

                 <div className="flex flex-col lg:flex-row gap-8">
           {/* 왼쪽 사이드바 - 필터 (데스크톱) */}
           <div className="hidden lg:block lg:w-64 flex-shrink-0">
             <div className="bg-white rounded-lg shadow-sm border p-6">
               <div className="flex items-center justify-between mb-4">
                 <h3 className="text-lg font-semibold text-gray-900">필터</h3>
                 <button
                   onClick={resetFilters}
                   className="text-sm text-green-600 hover:text-green-700"
                 >
                   초기화
                 </button>
               </div>

               {/* 카테고리 필터 */}
               <div className="mb-6">
                 <h4 className="font-medium text-gray-900 mb-3">카테고리</h4>
                 <div className="space-y-2">
                   {['전체', '채소', '과일', '육류', '유제품', '축산물', '수산물', '곡물', '조미료'].map((category) => (
                     <label key={category} className="flex items-center">
                       <input
                         type="radio"
                         name="category"
                         value={category}
                         checked={categoryFilter === category}
                         onChange={(e) => setCategoryFilter(e.target.value)}
                         className="mr-2 text-green-600 focus:ring-green-500"
                       />
                       <span className="text-sm text-gray-700">{category}</span>
                     </label>
                   ))}
                 </div>
               </div>

               {/* 보관방법 필터 */}
               <div className="mb-6">
                 <h4 className="font-medium text-gray-900 mb-3">보관방법</h4>
                 <div className="space-y-2">
                   {['전체', '냉장', '실온', '냉동'].map((storage) => (
                     <label key={storage} className="flex items-center">
                       <input
                         type="radio"
                         name="storage"
                         value={storage}
                         checked={storageFilter === storage}
                         onChange={(e) => setStorageFilter(e.target.value)}
                         className="mr-2 text-green-600 focus:ring-green-500"
                     />
                       <span className="text-sm text-gray-700">{storage}</span>
                     </label>
                   ))}
                 </div>
               </div>

               {/* 상태 필터 */}
               <div className="mb-6">
                 <h4 className="font-medium text-gray-900 mb-3">상태</h4>
                 <div className="space-y-2">
                   {['전체', '보관중', '폐기', '사용완료'].map((status) => (
                     <label key={status} className="flex items-center">
                       <input
                         type="radio"
                         name="status"
                         value={status}
                         checked={statusFilter === status}
                         onChange={(e) => setStatusFilter(e.target.value)}
                         className="mr-2 text-green-600 focus:ring-green-500"
                       />
                       <span className="text-sm text-gray-700">{status}</span>
                     </label>
                   ))}
                 </div>
               </div>
             </div>
           </div>

                     {/* 메인 콘텐츠 영역 */}
           <div className="flex-1">
             {/* 모바일 필터 버튼 */}
             <div className="lg:hidden mb-4">
               <button
                 onClick={openFilterModal}
                 className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
               >
                 <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                 </svg>
                 <span className="text-gray-700">필터</span>
                 {(categoryFilter !== '전체' || statusFilter !== '전체' || storageFilter !== '전체') && (
                   <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                   )}
               </button>
             </div>
            {/* 요약 카드 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-600">전체 식재료</p>
                    <p className="text-lg font-bold text-gray-900">{totalItems}개</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-600">보관 중</p>
                    <p className="text-lg font-bold text-gray-900">{storedItems}개</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.5 19.5a2.5 2.5 0 01-2.5-2.5v-15a2.5 2.5 0 012.5-2.5h15a2.5 2.5 0 012.5 2.5v15a2.5 2.5 0 01-2.5 2.5h-15z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-600">곧 만료</p>
                    <p className="text-lg font-bold text-gray-900">{expiringItems}개</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-600">폐기됨</p>
                    <p className="text-lg font-bold text-gray-900">{disposedItems}개</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 식재료 추가 버튼 */}
            <div className="flex justify-end mb-6">
              <button
                onClick={addNewItem}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                + 식재료 추가
              </button>
            </div>

            {/* 식재료 목록 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                  {/* 이미지 영역 */}
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-2xl font-bold text-green-800">
                        {item.name.charAt(0)}
                      </span>
                    </div>
                  </div>

                  {/* 내용 영역 */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                    
                    {/* 메타데이터 */}
                    <div className="text-sm text-gray-500 mb-3">
                      <div className="flex items-center justify-between">
                        <span>{item.category}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                          {item.storageMethod}
                        </span>
                      </div>
                      <div className="mt-1">
                        <span className="text-red-600 font-medium">{item.quantity}</span>
                      </div>
                    </div>

                    {/* 상태 및 작업 버튼 */}
                    <div className="flex items-center justify-between">
                      <select
                        value={item.status}
                        onChange={(e) => updateStatus(item.id, e.target.value as InventoryItem['status'])}
                        className={`text-xs rounded-full px-3 py-1 border-0 focus:ring-2 focus:ring-offset-2 ${
                          item.status === '보관중' 
                            ? 'bg-green-100 text-green-800 focus:ring-green-500'
                            : item.status === '폐기'
                            ? 'bg-red-100 text-red-800 focus:ring-red-500'
                            : 'bg-gray-100 text-gray-800 focus:ring-gray-500'
                        }`}
                      >
                        <option value="보관중">보관중</option>
                        <option value="폐기">폐기</option>
                        <option value="사용완료">사용완료</option>
                      </select>

                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 p-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* 유통기한 정보 */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>유통기한: {item.expiryDate}</span>
                        {item.isExpired && (
                          <span className="text-red-600 font-medium">만료됨</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        추가일: {item.addedDate}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 결과가 없을 때 */}
            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-gray-500">검색 결과가 없습니다.</p>
                <p className="text-sm text-gray-400">다른 검색어나 필터를 시도해보세요.</p>
              </div>
            )}
                     </div>
         </div>
       </div>

          {/* 필터 모달 (모바일) */}
          {isFilterModalOpen && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <div className="fixed inset-0 bg-black bg-opacity-30 pointer-events-auto"></div>
              <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-auto">
                <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm max-h-[90vh] overflow-hidden border border-gray-200">
               <div className="flex items-center justify-between p-6 border-b">
                 <h3 className="text-lg font-semibold text-gray-900">필터</h3>
                 <div className="flex items-center gap-2">
                   <button
                     onClick={resetFilters}
                     className="text-sm text-green-600 hover:text-green-700"
                   >
                     초기화
                   </button>
                   <button
                     onClick={closeFilterModal}
                     className="text-gray-400 hover:text-gray-600"
                   >
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                   </button>
                 </div>
               </div>
               
               <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                 {/* 카테고리 필터 */}
                 <div className="mb-6">
                   <h4 className="font-medium text-gray-900 mb-3">카테고리</h4>
                   <div className="space-y-2">
                     {['전체', '채소', '과일', '육류', '유제품', '축산물', '수산물', '곡물', '조미료'].map((category) => (
                       <label key={category} className="flex items-center">
                         <input
                           type="radio"
                           name="category-mobile"
                           value={category}
                           checked={categoryFilter === category}
                           onChange={(e) => setCategoryFilter(e.target.value)}
                           className="mr-2 text-green-600 focus:ring-green-500"
                         />
                         <span className="text-sm text-gray-700">{category}</span>
                       </label>
                     ))}
                   </div>
                 </div>

                 {/* 보관방법 필터 */}
                 <div className="mb-6">
                   <h4 className="font-medium text-gray-900 mb-3">보관방법</h4>
                   <div className="space-y-2">
                     {['전체', '냉장', '실온', '냉동'].map((storage) => (
                       <label key={storage} className="flex items-center">
                         <input
                           type="radio"
                           name="storage-mobile"
                           value={storage}
                           checked={storageFilter === storage}
                           onChange={(e) => setStorageFilter(e.target.value)}
                           className="mr-2 text-green-600 focus:ring-green-500"
                         />
                         <span className="text-sm text-gray-700">{storage}</span>
                       </label>
                     ))}
                   </div>
                 </div>

                 {/* 상태 필터 */}
                 <div className="mb-6">
                   <h4 className="font-medium text-gray-900 mb-3">상태</h4>
                   <div className="space-y-2">
                     {['전체', '보관중', '폐기', '사용완료'].map((status) => (
                       <label key={status} className="flex items-center">
                         <input
                           type="radio"
                           name="status-mobile"
                           value={status}
                           checked={statusFilter === status}
                           onChange={(e) => setStatusFilter(e.target.value)}
                           className="mr-2 text-green-600 focus:ring-green-500"
                         />
                         <span className="text-sm text-gray-700">{status}</span>
                       </label>
                     ))}
                   </div>
                 </div>

                 {/* 적용 버튼 */}
                 <div className="pt-4 border-t">
                   <button
                     onClick={closeFilterModal}
                     className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                   >
                     필터 적용
                   </button>
                 </div>
               </div>
             </div>
           </div>
         </div>
       )}

      {/* 식재료 추가 모달 */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black bg-opacity-10"></div>
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden border border-gray-200">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">새 식재료 추가</h3>
                <button
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const newItem: InventoryItem = {
                  id: Date.now(),
                  name: formData.get('name') as string,
                  category: formData.get('category') as string,
                  quantity: formData.get('quantity') as string,
                  storageMethod: formData.get('storageMethod') as string,
                  expiryDate: formData.get('expiryDate') as string,
                  addedDate: new Date().toISOString().split('T')[0],
                  status: '보관중',
                  isExpired: new Date(formData.get('expiryDate') as string) < new Date(),
                  description: formData.get('description') as string,
                  image: '/images/placeholder.jpg',
                };
                setInventoryItems(prev => [newItem, ...prev]);
                setIsAddItemModalOpen(false);
              }}>
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">식재료명</label>
                      <input type="text" name="name" id="name" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-black" />
                    </div>
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700">카테고리</label>
                      <select name="category" id="category" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-black">
                        {['채소', '과일', '육류', '유제품', '축산물', '수산물', '곡물', '조미료'].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">수량</label>
                      <input type="text" name="quantity" id="quantity" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-black" />
                    </div>
                    <div>
                      <label htmlFor="storageMethod" className="block text-sm font-medium text-gray-700">보관방법</label>
                      <select name="storageMethod" id="storageMethod" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-black">
                        {['냉장', '실온', '냉동'].map(sm => (
                          <option key={sm} value={sm}>{sm}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">유통기한</label>
                      <input type="date" name="expiryDate" id="expiryDate" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-black" />
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">설명</label>
                      <textarea name="description" id="description" rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-black"></textarea>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-4 p-6 border-t">
                  <button type="button" onClick={() => setIsAddItemModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">취소</button>
                  <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">저장</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
     </div>
   )
 }
