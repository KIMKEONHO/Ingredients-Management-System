'use client'

import { useState, useEffect } from 'react'
import { inventoryService, FoodInventory, CreateFoodInventoryRequest, UpdateFoodInventoryRequest, UpdateFoodInventoryQuantityRequest, UpdateFoodInventoryStatusRequest } from '@/lib/api/services/inventoryService'
import { ingredientService, Ingredient } from '@/lib/api/services/ingredientService';
import { categoryService, Category } from '@/lib/api/services/categoryService';

interface InventoryItem {
  id: number
  name: string
  category: string
  quantity: number
  originalQuantity: number
  unit: string
  storageMethod: string
  expiryDate: string
  addedDate: string
  status: '보관중' | '유통기한 임박' | '기간만료' | '사용완료'
  isExpired: boolean
  image: string
}

import { UserGuard } from '@/lib/auth/authGuard';

export default function InventoryPage() {
  return (
      <InventoryContent />
  );
}

function InventoryContent() {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [ingredientsMap, setIngredientsMap] = useState<Map<number, Ingredient>>(new Map());
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchAndSetInventory = async () => {
      try {
        const ingredientsData = await ingredientService.getAllIngredients();
        const newIngredientsMap = new Map<number, Ingredient>();
        ingredientsData.forEach(ingredient => {
          if (ingredient.id) {
            newIngredientsMap.set(ingredient.id, ingredient);
          }
        });
        setIngredientsMap(newIngredientsMap);

        const inventoryData = await inventoryService.getInventory();

        const formattedData: InventoryItem[] = inventoryData.map((item: FoodInventory) => {
          const ingredient = item.ingredientId ? newIngredientsMap.get(item.ingredientId) : undefined;
          const storageMethodMap: { [key: string]: string } = {
            "REFRIGERATED": "냉장",
            "FROZEN": "냉동",
            "ROOM": "실온"
          };
          const storageMethod = item.place ? storageMethodMap[item.place] || item.place : 'N/A';
          const quantity = item.quantity || 0;
          const statusMap: { [key: string]: '보관중' | '유통기한 임박' | '기간만료' | '사용완료' } = {
            "NORMAL": '보관중',
            "EXPIRING_SOON": '유통기한 임박',
            "EXPIRED": '기간만료',
            "CONSUMED": '사용완료'
          };
          return {
            id: item.foodInventoryId || 0,
            name: item.ingredientName || 'N/A',
            category: ingredient?.categoryName || '기타',
            quantity: quantity,
            originalQuantity: quantity,
            unit: item.unit || '',
            storageMethod: storageMethod,
            expiryDate: item.expirationDate ? item.expirationDate.split('T')[0] : 'N/A',
            addedDate: item.boughtDate ? item.boughtDate.split('T')[0] : 'N/A',
            status: item.status ? statusMap[item.status] : '보관중',
            isExpired: item.expirationDate ? new Date(item.expirationDate) < new Date() : false,
            image: '/images/placeholder.jpg',
          };
        });

        setInventoryItems(formattedData);
      } catch (error) {
        console.error('Failed to fetch inventory:', error);
      }
    };

    fetchAndSetInventory();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryData = await categoryService.getAllCategories();
        setCategories(categoryData);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('전체')
  const [statusFilter, setStatusFilter] = useState('전체')
  const [storageFilter, setStorageFilter] = useState('전체')

  // 통계 계산
  const totalItems = inventoryItems.length
  const storedItems = inventoryItems.filter(item => item.status === '보관중').length
  const expiringItems = inventoryItems.filter(item => item.isExpired && item.status === '보관중').length
  const expiredItems = inventoryItems.filter(item => item.status === '기간만료').length

  // 필터링
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === '전체' || item.category === categoryFilter
    const matchesStatus = statusFilter === '전체' || item.status === statusFilter
    const matchesStorage = storageFilter === '전체' || item.storageMethod === storageFilter
    
    return matchesSearch && matchesCategory && matchesStatus && matchesStorage
  })

  const updateStatus = async (id: number, newStatus: InventoryItem['status']) => {
    const statusMap: { [key: string]: "NORMAL" | "EXPIRING_SOON" | "EXPIRED" | "CONSUMED" } = {
      '보관중': 'NORMAL',
      '유통기한 임박': 'EXPIRING_SOON',
      '기간만료': 'EXPIRED',
      '사용완료': 'CONSUMED'
    };

    const backendStatus = statusMap[newStatus];

    if (!backendStatus) {
      console.error('Invalid status:', newStatus);
      return;
    }

    try {
      await inventoryService.updateFoodInventoryStatus(id, { status: backendStatus });
      setInventoryItems(prev => 
        prev.map(item => 
          item.id === id ? { ...item, status: newStatus } : item
        )
      )
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('상태 변경에 실패했습니다.');
    }
  }

  const handleQuantityChange = (id: number, delta: number) => {
    setInventoryItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
      )
    )
  }

  const handleSaveQuantity = async (item: InventoryItem) => {
    try {
      await inventoryService.updateFoodInventoryQuantity(item.id, { quantity: item.quantity });
      setInventoryItems(prev => 
        prev.map(i => 
          i.id === item.id ? { ...i, originalQuantity: i.quantity } : i
        )
      );
      alert('수량이 저장되었습니다.');
    } catch (error) {
      console.error('Failed to save quantity:', error);
      alert('수량 저장에 실패했습니다.');
    }
  }

  const removeItem = async (id: number) => {
    try {
      await inventoryService.deleteInventoryItem(id);
      setInventoryItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Failed to delete inventory item:', error);
      alert('삭제에 실패했습니다. 다시 시도해주세요.');
    }
  }

  const addNewItem = async () => {
    try {
      const ingredientsData = await ingredientService.getAllIngredients();
      const newIngredientsMap = new Map<number, Ingredient>();
      ingredientsData.forEach(ingredient => {
        if (ingredient.id) {
          newIngredientsMap.set(ingredient.id, ingredient);
        }
      });
      setIngredientsMap(newIngredientsMap);
      setIsAddItemModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch ingredients for modal:', error);
      alert('식재료 목록을 불러오는 데 실패했습니다. 다시 시도해주세요.');
    }
  }

  const handleUpdateItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem) return;

    const formData = new FormData(e.currentTarget);
    const storageMethodValue = formData.get('storageMethod') as string;
    const boughtDate = formData.get('boughtDate') as string;
    const expirationDate = formData.get('expirationDate') as string;
    const quantity = parseInt(formData.get('quantity') as string, 10);
    const unit = formData.get('unit') as string;

    const storageMethodMap: { [key: string]: "REFRIGERATED" | "FROZEN" | "ROOM" } = {
      '냉장': 'REFRIGERATED',
      '실온': 'ROOM',
      '냉동': 'FROZEN',
    };
    const place = storageMethodMap[storageMethodValue];

    const updateData: UpdateFoodInventoryRequest = {
      foodInventoryId: editingItem.id,
      quantity: quantity,
      unit: unit,
      place: place,
      boughtDate: boughtDate ? new Date(boughtDate).toISOString() : undefined,
      expirationDate: expirationDate ? new Date(expirationDate).toISOString() : undefined,
    };

    try {
      const updatedItem = await inventoryService.updateInventoryItem(updateData);
      const storageMethod = updatedItem.place ? Object.keys(storageMethodMap).find(key => storageMethodMap[key] === updatedItem.place) : storageMethodValue;
      const statusMap: { [key: string]: '보관중' | '유통기한 임박' | '기간만료' | '사용완료' } = {
        "NORMAL": '보관중',
        "EXPIRING_SOON": '유통기한 임박',
        "EXPIRED": '기간만료',
        "CONSUMED": '사용완료'
      };
      setInventoryItems(prev => prev.map(item => item.id === editingItem.id ? {
        ...item,
        quantity: updatedItem.quantity || 0,
        originalQuantity: updatedItem.quantity || 0,
        unit: updatedItem.unit || '',
        storageMethod: storageMethod || 'N/A',
        addedDate: updatedItem.boughtDate ? updatedItem.boughtDate.split('T')[0] : 'N/A',
        expiryDate: updatedItem.expirationDate ? updatedItem.expirationDate.split('T')[0] : 'N/A',
        status: updatedItem.status ? statusMap[updatedItem.status] : '보관중',
        isExpired: updatedItem.expirationDate ? new Date(updatedItem.expirationDate) < new Date() : false,
      } : item));
      closeEditModal();
    } catch (error) {
      console.error('Failed to update inventory item:', error);
      alert('수정에 실패했습니다. 다시 시도해주세요.');
    }
  };

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

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingItem(null);
    setIsEditModalOpen(false);
  };

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

          
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* 페이지 제목 */}
        <div className="mb-6">
                      <nav className="text-sm text-gray-500 mb-2">
              홈 &gt; 식품 재고 관리
            </nav>
                     <h1 className="text-2xl font-bold text-gray-900">
             식품 재고 관리
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
                   {[ { name: '전체' }, ...categories].map((category) => (
                     <label key={category.name} className="flex items-center">
                       <input
                         type="radio"
                         name="category"
                         value={category.name}
                         checked={categoryFilter === category.name}
                         onChange={(e) => setCategoryFilter(e.target.value)}
                         className="mr-2 text-green-600 focus:ring-green-500"
                       />
                       <span className="text-sm text-gray-700">{category.name}</span>
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
                   {['전체', '보관중', '유통기한 임박', '기간만료', '사용완료'].map((status) => (
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
                    <p className="text-xs text-gray-600">기간만료</p>
                    <p className="text-lg font-bold text-gray-900">{expiredItems}개</p>
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
                    
                    {/* 메타데이터 */}
                    <div className="text-sm text-gray-500 mb-3">
                      <div className="flex items-center justify-between">
                        <span>{item.category}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                          {item.storageMethod}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-red-600 font-medium">{item.quantity} {item.unit}</span>
                        <button onClick={() => handleQuantityChange(item.id, -1)} className="text-sm px-2 py-0.5 border rounded">-</button>
                        <button onClick={() => handleQuantityChange(item.id, 1)} className="text-sm px-2 py-0.5 border rounded">+</button>
                        {item.quantity !== item.originalQuantity && (
                            <button onClick={() => handleSaveQuantity(item)} className="text-sm px-2 py-0.5 border rounded bg-green-500 text-white">저장</button>
                        )}
                      </div>
                    </div>

                    {/* 상태 및 작업 버튼 */}
                    <div className="flex items-center justify-between">
                      <select
                        value={item.status}
                        onChange={async (e) => await updateStatus(item.id, e.target.value as InventoryItem['status'])}
                        className={`text-xs rounded-full px-3 py-1 border-0 focus:ring-2 focus:ring-offset-2 ${
                          item.status === '보관중' 
                            ? 'bg-green-100 text-green-800 focus:ring-green-500'
                            : item.status === '유통기한 임박'
                            ? 'bg-orange-100 text-orange-800 focus:ring-orange-500'
                            : item.status === '기간만료'
                            ? 'bg-red-100 text-red-800 focus:ring-red-500'
                            : 'bg-gray-100 text-gray-800 focus:ring-gray-500'
                        }`}
                      >
                        <option value="보관중">보관중</option>
                        <option value="유통기한 임박">유통기한 임박</option>
                        <option value="기간만료">기간만료</option>
                        <option value="사용완료">사용완료</option>
                      </select>

                      <div className="flex items-center space-x-2">
                        <button onClick={() => openEditModal(item)} className="text-blue-600 hover:text-blue-900 p-1">
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
                     {[ { name: '전체' }, ...categories].map((category) => (
                       <label key={category.name} className="flex items-center">
                         <input
                           type="radio"
                           name="category-mobile"
                           value={category.name}
                           checked={categoryFilter === category.name}
                           onChange={(e) => setCategoryFilter(e.target.value)}
                           className="mr-2 text-green-600 focus:ring-green-500"
                         />
                         <span className="text-sm text-gray-700">{category.name}</span>
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
                     {['전체', '보관중', '유통기한 임박', '기간만료', '사용완료'].map((status) => (
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
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);

                const ingredientName = formData.get('name') as string;
                const selectedIngredient = Array.from(ingredientsMap.values()).find(
                  (ing) => ing.name === ingredientName
                );

                if (!selectedIngredient || !selectedIngredient.id) {
                  alert('유효한 식재료를 선택해주세요.');
                  return;
                }
                const ingredientId = selectedIngredient.id;

                const storageMethodMap: { [key: string]: "REFRIGERATED" | "FROZEN" | "ROOM" } = {
                  '냉장': 'REFRIGERATED',
                  '실온': 'ROOM',
                  '냉동': 'FROZEN',
                };
                const storageMethodValue = formData.get('storageMethod') as string;
                const place = storageMethodMap[storageMethodValue];

                const quantity = parseInt(formData.get('quantity') as string, 10);
                const unit = formData.get('unit') as string;
                const boughtDate = formData.get('boughtDate') as string;
                const expirationDate = formData.get('expirationDate') as string;

                const newItemData: CreateFoodInventoryRequest = {
                  ingredientId: ingredientId,
                  quantity: quantity,
                  unit: unit,
                  boughtDate: boughtDate ? new Date(boughtDate).toISOString() : undefined,
                  expirationDate: expirationDate ? new Date(expirationDate).toISOString() : undefined,
                  place: place,
                };

                try {
                  const createdItem = await inventoryService.createInventoryItem(newItemData);
                  // 백엔드에서 반환된 FoodInventoryResponseDto를 InventoryItem 형식으로 변환
                  const storageMethod = createdItem.place ? Object.keys(storageMethodMap).find(key => storageMethodMap[key] === createdItem.place) : 'N/A';
                  const newQuantity = createdItem.quantity || 0;
                  const statusMap: { [key: string]: '보관중' | '유통기한 임박' | '기간만료' | '사용완료' } = {
                    "NORMAL": '보관중',
                    "EXPIRING_SOON": '유통기한 임박',
                    "EXPIRED": '기간만료',
                    "CONSUMED": '사용완료'
                  };
                  const formattedCreatedItem: InventoryItem = {
                    id: createdItem.foodInventoryId || 0,
                    name: createdItem.ingredientName || ingredientName,
                    category: selectedIngredient.categoryName || '기타',
                    quantity: newQuantity,
                    originalQuantity: newQuantity,
                    unit: createdItem.unit || '',
                    storageMethod: storageMethod || 'N/A',
                    expiryDate: createdItem.expirationDate ? createdItem.expirationDate.split('T')[0] : 'N/A',
                    addedDate: createdItem.boughtDate ? createdItem.boughtDate.split('T')[0] : 'N/A',
                    status: createdItem.status ? statusMap[createdItem.status] : '보관중',
                    isExpired: createdItem.expirationDate ? new Date(createdItem.expirationDate) < new Date() : false,
                    image: '/images/placeholder.jpg',
                  };
                  setInventoryItems(prev => [formattedCreatedItem, ...prev]);
                  setIsAddItemModalOpen(false);
                } catch (error) {
                  console.error('식재료 추가 실패:', error);
                  alert('식재료 추가에 실패했습니다. 다시 시도해주세요.');
                }
              }}>
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">식재료명</label>
                      <input type="text" name="name" id="name" list="ingredient-suggestions" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-black" />
                      <datalist id="ingredient-suggestions">
                        {Array.from(ingredientsMap.values()).map((ingredient) => (
                          <option key={ingredient.id} value={ingredient.name} />
                        ))}
                      </datalist>
                    </div>
                    
                    <div>
                      <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">수량</label>
                      <div className="flex gap-2 mt-1">
                        <input type="text" name="quantity" id="quantity" required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black" />
                        <select name="unit" id="unit" required className="block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black">
                          <option value="개">개</option>
                          <option value="g">g</option>
                          <option value="ml">ml</option>
                          <option value="팩">팩</option>
                          <option value="봉">봉</option>
                          <option value="줄">줄</option>
                          <option value="컵">컵</option>
                          <option value="리터">리터</option>
                          <option value="kg">kg</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="storageMethod" className="block text-sm font-medium text-gray-700">보관방법</label>
                      <select name="storageMethod" id="storageMethod" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-black">
                        {['냉장', '실온', '냉동'].map(sm => (
                          <option key={sm} value={sm}>{sm}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label htmlFor="boughtDate" className="block text-sm font-medium text-gray-700">구매기한</label>
                        <input type="date" name="boughtDate" id="boughtDate" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black" />
                      </div>
                      <div className="flex-1">
                        <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700">유통기한</label>
                        <input type="date" name="expirationDate" id="expirationDate" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black" />
                      </div>
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

      {/* 식재료 수정 모달 */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black bg-opacity-10"></div>
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden border border-gray-200">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">식재료 수정</h3>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleUpdateItem}>
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">식재료명</label>
                      <input type="text" name="name" id="name" disabled value={editingItem.name} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-black" />
                    </div>

                    <div>
                      <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">수량</label>
                      <div className="flex gap-2 mt-1">
                        <input type="number" name="quantity" id="quantity" defaultValue={editingItem.quantity} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black" />
                        <select name="unit" id="unit" defaultValue={editingItem.unit} required className="block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black">
                          <option value="개">개</option>
                          <option value="g">g</option>
                          <option value="ml">ml</option>
                          <option value="팩">팩</option>
                          <option value="봉">봉</option>
                          <option value="줄">줄</option>
                          <option value="컵">컵</option>
                          <option value="리터">리터</option>
                          <option value="kg">kg</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="storageMethod" className="block text-sm font-medium text-gray-700">보관방법</label>
                      <select name="storageMethod" id="storageMethod" defaultValue={editingItem.storageMethod} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-black">
                        {['냉장', '실온', '냉동'].map(sm => (
                          <option key={sm} value={sm}>{sm}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label htmlFor="boughtDate" className="block text-sm font-medium text-gray-700">구매일</label>
                        <input type="date" name="boughtDate" id="boughtDate" defaultValue={editingItem.addedDate} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black" />
                      </div>
                      <div className="flex-1">
                        <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700">유통기한</label>
                        <input type="date" name="expirationDate" id="expirationDate" defaultValue={editingItem.expiryDate} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black" />
                      </div>
                    </div>
                    
                  </div>
                </div>
                <div className="flex justify-end gap-4 p-6 border-t">
                  <button type="button" onClick={closeEditModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">취소</button>
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