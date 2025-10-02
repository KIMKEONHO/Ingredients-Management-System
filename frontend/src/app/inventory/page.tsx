'use client'

import { useState, useEffect } from 'react'
import { inventoryService, FoodInventory, CreateFoodInventoryRequest, UpdateFoodInventoryRequest, UpdateFoodInventoryQuantityRequest, UpdateFoodInventoryStatusRequest } from '@/lib/api/services/inventoryService'
import { ingredientService, Ingredient } from '@/lib/api/services/ingredientService';
import { categoryService, Category } from '@/lib/api/services/categoryService';

interface StorageLocation {
  id: number
  storageMethod: string
  quantity: number
  originalQuantity: number
  unit: string
  expiryDate: string
  addedDate: string
  status: '보관중' | '유통기한 임박' | '기간만료' | '사용완료'
  isExpired: boolean
}

interface InventoryItem {
  id: string // 식재료명 + 카테고리로 고유 ID 생성
  name: string
  category: string
  totalQuantity: number
  totalOriginalQuantity: number
  unit: string
  image: string
  storageLocations: StorageLocation[]
  // 가장 빠른 만료일과 가장 늦은 만료일
  earliestExpiryDate: string
  latestExpiryDate: string
  // 전체 상태 (가장 우선순위가 높은 상태)
  overallStatus: '보관중' | '유통기한 임박' | '기간만료' | '사용완료'
  // 만료된 항목이 있는지
  hasExpiredItems: boolean
}

import { UserGuard } from '@/lib/auth/authGuard';
import { COLOR_PRESETS } from '@/lib/constants/colors';
import PageHeader from '../components/ui/PageHeader';
import SectionCard from '../components/ui/SectionCard';
import { useGlobalLoginMember } from '../stores/auth/loginMamber';

export default function InventoryPage() {
  const { isLogin } = useGlobalLoginMember();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedLocationForEdit, setSelectedLocationForEdit] = useState<StorageLocation | null>(null); // 수정할 위치 선택
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [ingredientsMap, setIngredientsMap] = useState<Map<number, Ingredient>>(new Map());
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState(''); // 식재료 검색 쿼리
  const [showIngredientDropdown, setShowIngredientDropdown] = useState(false); // 식재료 드롭다운 표시 여부
  const [selectedIngredient, setSelectedIngredient] = useState<{id: number, name: string, categoryName: string} | null>(null); // 선택된 식재료
  
  // 체크박스 상태 관리
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set()); // 선택된 재고 항목 ID들
  const [isBulkActionMode, setIsBulkActionMode] = useState(false); // 일괄 작업 모드 여부

  useEffect(() => {
    // 로그인 상태가 아니면 API 호출하지 않음
    if (!isLogin) {
      return;
    }

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

        // 먼저 기본 데이터를 변환
        interface RawInventoryItem {
          id: number;
          name: string;
          category: string;
          quantity: number;
          originalQuantity: number;
          unit: string;
          storageMethod: string;
          expiryDate: string;
          addedDate: string;
          status: '보관중' | '유통기한 임박' | '기간만료' | '사용완료';
          isExpired: boolean;
          image: string;
        }

        const rawItems: RawInventoryItem[] = inventoryData.map((item: FoodInventory) => {
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

        // 같은 식재료끼리 그룹화하고 통합
        const groupedItems = new Map<string, RawInventoryItem[]>();
        
        rawItems.forEach(item => {
          const key = `${item.name}_${item.category}`;
          if (!groupedItems.has(key)) {
            groupedItems.set(key, []);
          }
          groupedItems.get(key)!.push(item);
        });

        // 통합된 데이터 생성
        const formattedData: InventoryItem[] = Array.from(groupedItems.entries()).map(([key, items]) => {
          const firstItem = items[0];
          const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
          const totalOriginalQuantity = items.reduce((sum, item) => sum + item.originalQuantity, 0);
          
          // 보관 위치들 생성
          const storageLocations: StorageLocation[] = items.map(item => ({
            id: item.id,
            storageMethod: item.storageMethod,
            quantity: item.quantity,
            originalQuantity: item.originalQuantity,
            unit: item.unit,
            expiryDate: item.expiryDate,
            addedDate: item.addedDate,
            status: item.status,
            isExpired: item.isExpired
          }));

          // 만료일 범위 계산
          const expiryDates = items
            .filter(item => item.expiryDate !== 'N/A')
            .map(item => new Date(item.expiryDate))
            .sort((a, b) => a.getTime() - b.getTime());
          
          const earliestExpiryDate = expiryDates.length > 0 ? expiryDates[0].toISOString().split('T')[0] : 'N/A';
          const latestExpiryDate = expiryDates.length > 0 ? expiryDates[expiryDates.length - 1].toISOString().split('T')[0] : 'N/A';

          // 전체 상태 우선순위: 기간만료 > 유통기한 임박 > 사용완료 > 보관중
          const statusPriority: Record<string, number> = { '기간만료': 4, '유통기한 임박': 3, '사용완료': 2, '보관중': 1 };
          const overallStatus = items.reduce((highest, item) => 
            statusPriority[item.status] > statusPriority[highest] ? item.status : highest, 
            '보관중' as '보관중' | '유통기한 임박' | '기간만료' | '사용완료'
          );

          const hasExpiredItems = items.some(item => item.isExpired);

          return {
            id: key,
            name: firstItem.name,
            category: firstItem.category,
            totalQuantity,
            totalOriginalQuantity,
            unit: firstItem.unit,
            image: firstItem.image,
            storageLocations,
            earliestExpiryDate,
            latestExpiryDate,
            overallStatus,
            hasExpiredItems
          };
        });

        setInventoryItems(formattedData);
      } catch (error) {
        console.error('Failed to fetch inventory:', error);
      }
    };

    fetchAndSetInventory();
  }, [isLogin]);

  useEffect(() => {
    // 로그인 상태가 아니면 API 호출하지 않음
    if (!isLogin) {
      return;
    }

    const fetchCategories = async () => {
      try {
        const categoryData = await categoryService.getAllCategories();
        setCategories(categoryData);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, [isLogin]);

  const [categoryFilter, setCategoryFilter] = useState('전체')
  const [statusFilter, setStatusFilter] = useState('전체')
  const [storageFilter, setStorageFilter] = useState('전체')

  // 통계 계산
  const totalItems = inventoryItems.length
  const storedItems = inventoryItems.filter(item => item.overallStatus === '보관중').length
  const expiringItems = inventoryItems.filter(item => item.overallStatus === '유통기한 임박').length
  const expiredItems = inventoryItems.filter(item => item.overallStatus === '기간만료').length

  // 필터링
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === '전체' || item.category === categoryFilter
    const matchesStatus = statusFilter === '전체' || item.overallStatus === statusFilter
    const matchesStorage = storageFilter === '전체' || item.storageLocations.some(location => location.storageMethod === storageFilter)
    
    return matchesSearch && matchesCategory && matchesStatus && matchesStorage
  })

  const updateStatus = async (locationId: number, newStatus: '보관중' | '유통기한 임박' | '기간만료' | '사용완료') => {
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
      await inventoryService.updateFoodInventoryStatus(locationId, { status: backendStatus });
      setInventoryItems(prev => 
        prev.map(item => ({
          ...item,
          storageLocations: item.storageLocations.map(location => 
            location.id === locationId ? { ...location, status: newStatus } : location
          )
        }))
      );
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('상태 변경에 실패했습니다.');
    }
  }

  const handleQuantityChange = (locationId: number, delta: number) => {
    setInventoryItems(prev => 
      prev.map(item => ({
        ...item,
        storageLocations: item.storageLocations.map(location => 
          location.id === locationId ? { ...location, quantity: Math.max(0, location.quantity + delta) } : location
        )
      }))
    );
  }

  const handleSaveQuantity = async (location: StorageLocation) => {
    try {
      await inventoryService.updateFoodInventoryQuantity(location.id, { quantity: location.quantity });
      setInventoryItems(prev => 
        prev.map(item => ({
          ...item,
          storageLocations: item.storageLocations.map(loc => 
            loc.id === location.id ? { ...loc, originalQuantity: loc.quantity } : loc
          )
        }))
      );
      alert('수량이 저장되었습니다.');
    } catch (error) {
      console.error('Failed to save quantity:', error);
      alert('수량 저장에 실패했습니다.');
    }
  }

  const removeItem = async (locationId: number) => {
    try {
      await inventoryService.deleteInventoryItem(locationId);
      setInventoryItems(prev => 
        prev.map(item => ({
          ...item,
          storageLocations: item.storageLocations.filter(location => location.id !== locationId)
        })).filter(item => item.storageLocations.length > 0)
      );
    } catch (error) {
      console.error('Failed to delete inventory item:', error);
      alert('삭제에 실패했습니다. 다시 시도해주세요.');
    }
  }

  // 체크박스 관련 핸들러 함수들
  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(itemId)) {
        newSelected.delete(itemId);
      } else {
        newSelected.add(itemId);
      }
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) {
      alert('삭제할 항목을 선택해주세요.');
      return;
    }

    if (!confirm(`선택된 ${selectedItems.size}개의 재고 항목을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      // 선택된 항목들의 모든 storage location ID를 수집
      const locationIdsToDelete: number[] = [];
      filteredItems.forEach(item => {
        if (selectedItems.has(item.id)) {
          item.storageLocations.forEach(location => {
            locationIdsToDelete.push(location.id);
          });
        }
      });

      // 모든 선택된 location들을 병렬로 삭제
      await Promise.all(
        locationIdsToDelete.map(locationId => 
          inventoryService.deleteInventoryItem(locationId)
        )
      );

      // 로컬 상태에서 삭제된 항목들 제거
      setInventoryItems(prev => 
        prev.filter(item => !selectedItems.has(item.id))
      );

      // 선택 상태 초기화
      setSelectedItems(new Set());
      setIsBulkActionMode(false);

      alert(`${selectedItems.size}개의 재고 항목이 삭제되었습니다.`);
    } catch (error) {
      console.error('일괄 삭제 실패:', error);
      alert('일괄 삭제에 실패했습니다.');
    }
  };

  const handleBulkActionMode = () => {
    setIsBulkActionMode(!isBulkActionMode);
    if (isBulkActionMode) {
      setSelectedItems(new Set());
    }
  };

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
      setSearchQuery('');
      setSelectedIngredient(null);
      setShowIngredientDropdown(false);
      setIsAddItemModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch ingredients for modal:', error);
      alert('식재료 목록을 불러오는 데 실패했습니다. 다시 시도해주세요.');
    }
  }

  const handleUpdateItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem || !selectedLocationForEdit) return;

    const formData = new FormData(e.currentTarget);
    const location = selectedLocationForEdit;
    
    const quantity = parseInt(formData.get('quantity') as string, 10);
    const storageMethodValue = formData.get('storageMethod') as string;
    const boughtDate = formData.get('boughtDate') as string;
    const expirationDate = formData.get('expirationDate') as string;
    
    const storageMethodMap: { [key: string]: "REFRIGERATED" | "FROZEN" | "ROOM" } = {
      '냉장': 'REFRIGERATED',
      '실온': 'ROOM',
      '냉동': 'FROZEN',
    };
    const place = storageMethodMap[storageMethodValue];

    try {
      // API 요청으로 재고 수정
      const updateData: UpdateFoodInventoryRequest = {
        foodInventoryId: location.id,
        quantity: quantity,
        boughtDate: boughtDate ? new Date(boughtDate).toISOString() : undefined,
        expirationDate: expirationDate ? new Date(expirationDate).toISOString() : undefined,
        place: place,
      };
      
      const updatedItem = await inventoryService.updateInventoryItem(updateData);
      
      // 상태 매핑
      const statusMap: { [key: string]: '보관중' | '유통기한 임박' | '기간만료' | '사용완료' } = {
        "NORMAL": '보관중',
        "EXPIRING_SOON": '유통기한 임박',
        "EXPIRED": '기간만료',
        "CONSUMED": '사용완료'
      };
      
      const storageMethodReverseMap: { [key: string]: string } = {
        "REFRIGERATED": "냉장",
        "FROZEN": "냉동",
        "ROOM": "실온"
      };
      
      // 로컬 상태 업데이트
      setInventoryItems(prev => 
        prev.map(item => {
          if (item.id === editingItem.id) {
            const updatedLocation: StorageLocation = {
              id: location.id,
              storageMethod: updatedItem.place ? storageMethodReverseMap[updatedItem.place] : location.storageMethod,
              quantity: updatedItem.quantity || quantity,
              originalQuantity: updatedItem.quantity || quantity,
              unit: 'g',
              expiryDate: updatedItem.expirationDate ? updatedItem.expirationDate.split('T')[0] : location.expiryDate,
              addedDate: updatedItem.boughtDate ? updatedItem.boughtDate.split('T')[0] : location.addedDate,
              status: updatedItem.status ? statusMap[updatedItem.status] : location.status,
              isExpired: updatedItem.expirationDate ? new Date(updatedItem.expirationDate) < new Date() : false,
            };
            
            // 업데이트된 위치 목록 생성
            const updatedStorageLocations = item.storageLocations.map(loc => 
              loc.id === location.id ? updatedLocation : loc
            );
            
            // 전체 수량 재계산
            const newTotalQuantity = updatedStorageLocations.reduce((sum, loc) => sum + loc.quantity, 0);
            
            // 만료일 범위 재계산
            const expiryDates = updatedStorageLocations
              .filter(loc => loc.expiryDate !== 'N/A')
              .map(loc => loc.expiryDate)
              .sort();
            
            // 전체 상태 재계산 (우선순위: 기간만료 > 유통기한 임박 > 사용완료 > 보관중)
            const statusPriority: Record<string, number> = { '기간만료': 4, '유통기한 임박': 3, '사용완료': 2, '보관중': 1 };
            const newOverallStatus = updatedStorageLocations.reduce((highest, loc) => 
              statusPriority[loc.status] > statusPriority[highest] ? loc.status : highest, 
              '보관중' as '보관중' | '유통기한 임박' | '기간만료' | '사용완료'
            );
            
            return {
              ...item,
              totalQuantity: newTotalQuantity,
              totalOriginalQuantity: newTotalQuantity,
              storageLocations: updatedStorageLocations,
              earliestExpiryDate: expiryDates.length > 0 ? expiryDates[0] : 'N/A',
              latestExpiryDate: expiryDates.length > 0 ? expiryDates[expiryDates.length - 1] : 'N/A',
              overallStatus: newOverallStatus,
              hasExpiredItems: updatedStorageLocations.some(loc => loc.isExpired)
            };
          }
          return item;
        })
      );
      
      alert('식재료가 수정되었습니다.');
      closeEditModal();
    } catch (error) {
      console.error('식재료 수정 실패:', error);
      alert('식재료 수정에 실패했습니다. 다시 시도해주세요.');
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
    // 첫 번째 위치를 기본으로 선택
    setSelectedLocationForEdit(item.storageLocations[0] || null);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingItem(null);
    setSelectedLocationForEdit(null);
    setIsEditModalOpen(false);
  };

  const openDetailModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setSelectedItem(null);
    setIsDetailModalOpen(false);
  }

  // 식재료 검색 필터링 함수
  const getFilteredIngredients = () => {
    if (!searchQuery.trim()) {
      return Array.from(ingredientsMap.values())
        .filter(ingredient => ingredient.id && ingredient.name && ingredient.categoryName)
        .slice(0, 10); // 검색어가 없으면 상위 10개만 표시
    }
    
    return Array.from(ingredientsMap.values())
      .filter(ingredient => 
        ingredient.id && 
        ingredient.name && 
        ingredient.categoryName &&
        (ingredient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         ingredient.categoryName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      // 검색어가 있을 때는 모든 결과를 표시 (제한 없음)
  };

  // 식재료 선택 핸들러
  const handleIngredientSelect = (ingredient: Ingredient) => {
    if (ingredient.id && ingredient.name && ingredient.categoryName) {
      setSelectedIngredient({
        id: ingredient.id,
        name: ingredient.name,
        categoryName: ingredient.categoryName
      });
      setSearchQuery(ingredient.name);
      setShowIngredientDropdown(false);
    }
  };

  // 검색어 변경 핸들러
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowIngredientDropdown(true);
    if (!value) {
      setSelectedIngredient(null);
    }
  };

  // 수량을 g/kg으로 변환하는 함수 (단위는 항상 g으로 표시)
  const formatQuantity = (quantity: number, unit: string) => {
    // 단위가 g이 아닌 경우 g으로 변환 (예: 개, ml 등)
    let quantityInG = quantity;
    if (unit !== 'g') {
      // 단위 변환 로직 (필요시 확장 가능)
      // 현재는 단위만 g으로 표시
      quantityInG = quantity;
    }
    
    if (quantityInG >= 1000) {
      const kg = quantityInG / 1000;
      return kg % 1 === 0 ? `${kg}kg` : `${kg.toFixed(1)}kg`;
    }
    return `${quantityInG}g`;
  };

  return (
    <UserGuard>
      <div className={`min-h-screen ${COLOR_PRESETS.STATISTICS_PAGE.background} p-6`}>
        <div className="max-w-7xl mx-auto">
          {/* Header Card */}
          <PageHeader 
            title="식품 재고 관리"
            description="보관 중인 식재료를 효율적으로 관리하고 추적해보세요"
            variant="statistics"
          />

          <div className="flex gap-6 mt-6">
            {/* 필터 사이드바 */}
            <div className="w-80 flex-shrink-0">
              <div className="sticky top-6">
                <SectionCard title="필터" variant="statistics">
                  <div className="space-y-6">
                    {/* 카테고리 필터 */}
                    <div>
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
                              className="mr-2 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{category.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                  {/* 보관방법 필터 */}
                  <div>
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
                            className="mr-2 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{storage}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 상태 필터 */}
                  <div>
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
                            className="mr-2 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{status}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                    {/* 필터 초기화 버튼 */}
                    <div className="pt-4 border-t border-gray-200">
                      <button
                        onClick={resetFilters}
                        className="w-full px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        필터 초기화
                      </button>
                    </div>
                  </div>
                </SectionCard>
              </div>
            </div>

            {/* 메인 콘텐츠 영역 */}
            <div className="flex-1">
              {/* Main Card Container */}
              <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8">
                {/* 요약 통계 섹션 */}
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">요약 통계</h3>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="식품 재고 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-80 px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <SectionCard title="" variant="statistics">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
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

                    <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
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

                    <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
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

                    <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
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
                </SectionCard>

                {/* 식재료 관리 섹션 */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">식품 재고 관리</h3>
                </div>
                <SectionCard title="" variant="statistics">
                  {/* 식재료 추가 버튼 및 일괄 작업 버튼 */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleBulkActionMode}
                        className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                          isBulkActionMode 
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {isBulkActionMode ? '일괄 작업 종료' : '일괄 작업'}
                      </button>
                      {isBulkActionMode && selectedItems.size > 0 && (
                        <button
                          onClick={handleBulkDelete}
                          className="px-4 py-2 text-red-700 bg-red-100 hover:bg-red-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                        >
                          선택 삭제 ({selectedItems.size})
                        </button>
                      )}
                    </div>
                    <button
                      onClick={addNewItem}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                      + 식품 재고 추가
                    </button>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* 메인 콘텐츠 영역 */}
                    <div className="flex-1 w-full">
                      {/* 모바일 필터 버튼 */}
                      <div className="lg:hidden mb-4">
                        <button
                          onClick={openFilterModal}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                          </svg>
                          <span className="text-gray-700">필터</span>
                          {(categoryFilter !== '전체' || statusFilter !== '전체' || storageFilter !== '전체') && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </button>
                      </div>

                      {/* 식재료 목록 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* 일괄 작업 모드일 때 전체 선택 체크박스 */}
                        {isBulkActionMode && filteredItems.length > 0 && (
                          <div className="col-span-full mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between">
                              <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                                  onChange={handleSelectAll}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                  전체 선택 ({selectedItems.size}/{filteredItems.length})
                                </span>
                              </label>
                              <span className="text-sm text-blue-600">
                                {selectedItems.size}개 선택됨
                              </span>
                            </div>
                          </div>
                        )}
                        
                {filteredItems.map((item) => (
                  <div key={item.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow flex flex-col ${
                    isBulkActionMode 
                      ? 'cursor-default' 
                      : 'cursor-pointer'
                  } ${
                    selectedItems.has(item.id) 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-blue-100'
                  }`} onClick={() => {
                    if (isBulkActionMode) {
                      handleSelectItem(item.id);
                    } else {
                      openDetailModal(item);
                    }
                  }}>
                    {/* 이미지 영역 */}
                    <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center relative flex-shrink-0">
                      {/* 일괄 작업 모드일 때 체크박스 표시 */}
                      {isBulkActionMode && (
                        <div className="absolute top-3 left-3">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(item.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSelectItem(item.id);
                            }}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                      )}
                      <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-2xl font-bold text-blue-800">
                          {item.name.charAt(0)}
                        </span>
                      </div>
                    </div>

                    {/* 내용 영역 */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
                      
                      {/* 메타데이터 */}
                      <div className="text-sm text-gray-500 mb-3">
                        <div className="flex items-center justify-between">
                          <span>{item.category}</span>
                          <div className="flex items-center gap-2">
                            {item.storageLocations.length > 1 ? (
                              <>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  {item.storageLocations.length}개 위치
                                </span>
                                {/* 중복된 보관장소가 있는지 확인 */}
                                {(() => {
                                  const uniqueStorageMethods = [...new Set(item.storageLocations.map(loc => loc.storageMethod))];
                                  if (uniqueStorageMethods.length === 1) {
                                    // 모두 같은 보관장소인 경우
                                    return (
                                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                        {uniqueStorageMethods[0]}
                                      </span>
                                    );
                                  }
                                  return null;
                                })()}
                              </>
                            ) : (
                              /* 중복되지 않은 식재료의 경우 보관장소와 재고 상태를 카테고리 오른쪽에 표시 */
                              <>
                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                  {item.storageLocations[0].storageMethod}
                                </span>
                                <span className={`text-xs rounded-full px-2 py-1 ${
                                  item.storageLocations[0].status === '보관중' 
                                    ? 'bg-green-100 text-green-800'
                                    : item.storageLocations[0].status === '유통기한 임박'
                                    ? 'bg-orange-100 text-orange-800'
                                    : item.storageLocations[0].status === '기간만료'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {item.storageLocations[0].status}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="mt-1">
                          <span className="text-red-600 font-medium">{formatQuantity(item.totalQuantity, item.unit)}</span>
                          <span className="text-xs text-gray-400 ml-2">(총 수량)</span>
                        </div>
                      </div>

                      {/* 만료일자 표시 */}
                      <div className="mb-3 flex-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">만료일자:</span>
                          <span className={`font-medium ${
                            item.earliestExpiryDate !== 'N/A' && new Date(item.earliestExpiryDate) < new Date()
                              ? 'text-red-600' 
                              : item.earliestExpiryDate !== 'N/A' && 
                                new Date(item.earliestExpiryDate) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                              ? 'text-orange-600'
                              : 'text-gray-900'
                          }`}>
                            {item.earliestExpiryDate !== 'N/A' 
                              ? new Date(item.earliestExpiryDate).toLocaleDateString('ko-KR')
                              : 'N/A'
                            }
                            {item.storageLocations.length > 1 && item.earliestExpiryDate !== item.latestExpiryDate && item.latestExpiryDate !== 'N/A' && (
                              <span className="text-xs text-gray-400 ml-1">
                                (일부)
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* 하단 액션 버튼들 - 카드 맨 아래 고정 */}
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                        {isBulkActionMode ? (
                          <span className="text-xs text-blue-600 font-medium">
                            {selectedItems.has(item.id) ? '선택됨' : '선택하려면 클릭'}
                          </span>
                        ) : (
                          <>
                            <span className="text-xs text-gray-400">
                              클릭하여 상세보기
                            </span>
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditModal(item);
                                }} 
                                className="text-blue-600 hover:text-blue-900 text-sm"
                                title="수정"
                              >
                                수정
                              </button>
                            </div>
                          </>
                        )}
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
                </SectionCard>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 필터 모달 (모바일) */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-30 pointer-events-auto"></div>
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-hidden border border-blue-100">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">필터</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={resetFilters}
                    className="text-sm text-blue-600 hover:text-blue-700"
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
                           className="mr-2 text-blue-600 focus:ring-blue-500"
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
                           className="mr-2 text-blue-600 focus:ring-blue-500"
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
                           className="mr-2 text-blue-600 focus:ring-blue-500"
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
                     className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
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
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden border border-blue-100">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">새 식재료 추가</h3>
                <button
                  onClick={() => {
                    setIsAddItemModalOpen(false);
                    setSearchQuery('');
                    setSelectedIngredient(null);
                    setShowIngredientDropdown(false);
                  }}
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

                if (!selectedIngredient || !selectedIngredient.id) {
                  alert('유효한 식재료를 선택해주세요.');
                  return;
                }
                const ingredientId = selectedIngredient.id;
                const ingredientName = selectedIngredient.name;

                const storageMethodMap: { [key: string]: "REFRIGERATED" | "FROZEN" | "ROOM" } = {
                  '냉장': 'REFRIGERATED',
                  '실온': 'ROOM',
                  '냉동': 'FROZEN',
                };
                const storageMethodValue = formData.get('storageMethod') as string;
                const place = storageMethodMap[storageMethodValue];

                const quantity = parseInt(formData.get('quantity') as string, 10);
                const unit = 'g'; // 단위를 g로 고정
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
                  // 백엔드에서 반환된 FoodInventoryResponseDto를 StorageLocation 형식으로 변환
                  const storageMethod = createdItem.place ? Object.keys(storageMethodMap).find(key => storageMethodMap[key] === createdItem.place) : 'N/A';
                  const newQuantity = createdItem.quantity || 0;
                  const statusMap: { [key: string]: '보관중' | '유통기한 임박' | '기간만료' | '사용완료' } = {
                    "NORMAL": '보관중',
                    "EXPIRING_SOON": '유통기한 임박',
                    "EXPIRED": '기간만료',
                    "CONSUMED": '사용완료'
                  };
                  
                  const newStorageLocation: StorageLocation = {
                    id: createdItem.foodInventoryId || 0,
                    storageMethod: storageMethod || 'N/A',
                    quantity: newQuantity,
                    originalQuantity: newQuantity,
                    unit: createdItem.unit || '',
                    expiryDate: createdItem.expirationDate ? createdItem.expirationDate.split('T')[0] : 'N/A',
                    addedDate: createdItem.boughtDate ? createdItem.boughtDate.split('T')[0] : 'N/A',
                    status: createdItem.status ? statusMap[createdItem.status] : '보관중',
                    isExpired: createdItem.expirationDate ? new Date(createdItem.expirationDate) < new Date() : false,
                  };

                  const newInventoryItem: InventoryItem = {
                    id: `${ingredientName}_${selectedIngredient.categoryName || '기타'}`,
                    name: ingredientName,
                    category: selectedIngredient.categoryName || '기타',
                    totalQuantity: newQuantity,
                    totalOriginalQuantity: newQuantity,
                    unit: createdItem.unit || '',
                    image: '/images/placeholder.jpg',
                    storageLocations: [newStorageLocation],
                    earliestExpiryDate: newStorageLocation.expiryDate,
                    latestExpiryDate: newStorageLocation.expiryDate,
                    overallStatus: newStorageLocation.status,
                    hasExpiredItems: newStorageLocation.isExpired
                  };

                  // 기존에 같은 식재료가 있는지 확인
                  setInventoryItems(prev => {
                    const existingItemIndex = prev.findIndex(item => item.id === newInventoryItem.id);
                    if (existingItemIndex !== -1) {
                      // 기존 아이템에 새로운 보관 위치 추가
                      const updatedItems = [...prev];
                      const existingItem = updatedItems[existingItemIndex];
                      const updatedStorageLocations = [...existingItem.storageLocations, newStorageLocation];
                      const updatedTotalQuantity = updatedStorageLocations.reduce((sum, loc) => sum + loc.quantity, 0);
                      
                      updatedItems[existingItemIndex] = {
                        ...existingItem,
                        storageLocations: updatedStorageLocations,
                        totalQuantity: updatedTotalQuantity,
                        totalOriginalQuantity: updatedTotalQuantity,
                        earliestExpiryDate: updatedStorageLocations.reduce((earliest, loc) => 
                          loc.expiryDate < earliest ? loc.expiryDate : earliest, updatedStorageLocations[0].expiryDate),
                        latestExpiryDate: updatedStorageLocations.reduce((latest, loc) => 
                          loc.expiryDate > latest ? loc.expiryDate : latest, updatedStorageLocations[0].expiryDate),
                        hasExpiredItems: updatedStorageLocations.some(loc => loc.isExpired)
                      };
                      return updatedItems;
                    } else {
                      // 새로운 아이템 추가
                      return [newInventoryItem, ...prev];
                    }
                  });
                  
                  setIsAddItemModalOpen(false);
                  setSearchQuery('');
                  setSelectedIngredient(null);
                  setShowIngredientDropdown(false);
                } catch (error) {
                  console.error('식재료 추가 실패:', error);
                  alert('식재료 추가에 실패했습니다. 다시 시도해주세요.');
                }
              }}>
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="ingredient-search" className="block text-sm font-medium text-gray-700">식재료명</label>
                      <div className="relative mt-1">
                        <input 
                          type="text" 
                          name="ingredient-search" 
                          id="ingredient-search" 
                          value={searchQuery}
                          onChange={handleSearchChange}
                          onFocus={() => setShowIngredientDropdown(true)}
                          onBlur={() => setTimeout(() => setShowIngredientDropdown(false), 200)}
                          placeholder="식재료명을 검색하세요..."
                          autoComplete="off"
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck="false"
                          required 
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black" 
                        />
                        {showIngredientDropdown && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {getFilteredIngredients().length > 0 ? (
                              getFilteredIngredients().map((ingredient) => (
                                <div
                                  key={ingredient.id}
                                  onClick={() => handleIngredientSelect(ingredient)}
                                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="font-medium text-gray-900">{ingredient.name}</div>
                                  <div className="text-sm text-gray-500">{ingredient.categoryName}</div>
                                </div>
                              ))
                            ) : (
                              <div className="px-3 py-2 text-gray-500 text-sm">
                                {searchQuery ? '검색 결과가 없습니다' : '식재료를 검색해주세요'}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">수량 (단위: g)</label>
                      <input type="text" name="quantity" id="quantity" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black" placeholder="수량을 입력하세요" />
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
                        <label htmlFor="boughtDate" className="block text-sm font-medium text-gray-700">구매일자</label>
                        <input 
                          type="date" 
                          name="boughtDate" 
                          id="boughtDate" 
                          required 
                          max={new Date().toISOString().split('T')[0]}
                          onChange={(e) => {
                            // 구매일자가 선택되면 유통기한의 최소값을 구매일자로 설정
                            const expirationInput = document.getElementById('expirationDate') as HTMLInputElement;
                            if (expirationInput && e.target.value) {
                              expirationInput.min = e.target.value;
                            }
                          }}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black" 
                        />
                        <p className="text-xs text-gray-500 mt-1">오늘 이전의 날짜만 선택 가능합니다</p>
                      </div>
                      <div className="flex-1">
                        <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700">
                          유통기한 <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="date" 
                          name="expirationDate" 
                          id="expirationDate" 
                          required
                          min={new Date().toISOString().split('T')[0]}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black" 
                        />
                        <p className="text-xs text-gray-500 mt-1">구매일자 이후의 날짜만 선택 가능합니다</p>
                      </div>
                    </div>
                    
                  </div>
                </div>
                <div className="flex justify-end gap-4 p-6 border-t">
                  <button type="button" onClick={() => setIsAddItemModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">취소</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">저장</button>
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
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden border border-blue-100">
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
                  {editingItem && (
                    <div className="space-y-4">
                      {/* 여러 위치에 보관된 경우 위치 선택 */}
                      {editingItem.storageLocations.length > 1 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            수정할 보관 위치 선택 <span className="text-red-500">*</span>
                          </label>
                          <div className="space-y-2">
                            {editingItem.storageLocations.map((location) => (
                              <label
                                key={location.id}
                                className={`flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                  selectedLocationForEdit?.id === location.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <input
                                    type="radio"
                                    name="selectedLocation"
                                    value={location.id}
                                    checked={selectedLocationForEdit?.id === location.id}
                                    onChange={() => setSelectedLocationForEdit(location)}
                                    className="text-blue-600 focus:ring-blue-500"
                                  />
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-gray-900">{location.storageMethod}</span>
                                      <span className={`text-xs rounded-full px-2 py-1 ${
                                        location.status === '보관중' 
                                          ? 'bg-green-100 text-green-800'
                                          : location.status === '유통기한 임박'
                                          ? 'bg-orange-100 text-orange-800'
                                          : location.status === '기간만료'
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        {location.status}
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      수량: {formatQuantity(location.quantity, location.unit)} | 유통기한: {location.expiryDate !== 'N/A' ? new Date(location.expiryDate).toLocaleDateString('ko-KR') : 'N/A'}
                                    </div>
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 선택된 위치의 정보 수정 폼 */}
                      {selectedLocationForEdit && (
                        <>
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">식재료명</label>
                            <input 
                              type="text" 
                              name="name" 
                              id="name" 
                              disabled 
                              value={editingItem?.name || ''} 
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-black" 
                            />
                          </div>

                          <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">수량 (단위: g)</label>
                            <input 
                              type="number" 
                              name="quantity" 
                              id="quantity" 
                              required
                              min="0"
                              step="1"
                              key={`qty-${selectedLocationForEdit.id}`}
                              defaultValue={selectedLocationForEdit.quantity || 0} 
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black" 
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="storageMethod" className="block text-sm font-medium text-gray-700">보관방법</label>
                            <select 
                              name="storageMethod" 
                              id="storageMethod" 
                              required
                              key={`storage-${selectedLocationForEdit.id}`}
                              defaultValue={selectedLocationForEdit.storageMethod || '냉장'} 
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                            >
                              {['냉장', '실온', '냉동'].map(sm => (
                                <option key={sm} value={sm}>{sm}</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex gap-4">
                            <div className="flex-1">
                              <label htmlFor="boughtDate" className="block text-sm font-medium text-gray-700">구매일자</label>
                              <input 
                                type="date" 
                                name="boughtDate" 
                                id="boughtDate" 
                                required 
                                max={new Date().toISOString().split('T')[0]}
                                key={`bought-${selectedLocationForEdit.id}`}
                                defaultValue={selectedLocationForEdit.addedDate !== 'N/A' ? selectedLocationForEdit.addedDate : ''}
                                onChange={(e) => {
                                  const expirationInput = document.getElementById('expirationDate-edit') as HTMLInputElement;
                                  if (expirationInput && e.target.value) {
                                    expirationInput.min = e.target.value;
                                  }
                                }}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black" 
                              />
                            </div>
                            <div className="flex-1">
                              <label htmlFor="expirationDate-edit" className="block text-sm font-medium text-gray-700">
                                유통기한 <span className="text-red-500">*</span>
                              </label>
                              <input 
                                type="date" 
                                name="expirationDate" 
                                id="expirationDate-edit" 
                                required
                                key={`expiry-${selectedLocationForEdit.id}`}
                                min={selectedLocationForEdit.addedDate !== 'N/A' ? selectedLocationForEdit.addedDate : new Date().toISOString().split('T')[0]}
                                defaultValue={selectedLocationForEdit.expiryDate !== 'N/A' ? selectedLocationForEdit.expiryDate : ''}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black" 
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
                {editingItem && selectedLocationForEdit && (
                  <div className="flex justify-end gap-4 p-6 border-t">
                    <button type="button" onClick={closeEditModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">취소</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">저장</button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 식재료 상세 모달 */}
      {isDetailModalOpen && selectedItem && (
        <div className="fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black bg-opacity-50"></div>
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-blue-100">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">{selectedItem?.name} 상세 정보</h3>
                <button
                  onClick={closeDetailModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="p-6">
                  {/* 기본 정보 */}
                  <div className="mb-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-xl font-bold text-blue-800">
                          {selectedItem?.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900">{selectedItem?.name}</h4>
                        <p className="text-sm text-gray-500">{selectedItem?.category}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500">총 수량</p>
                        <p className="text-lg font-semibold text-gray-900">{formatQuantity(selectedItem?.totalQuantity || 0, selectedItem?.unit || 'g')}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500">보관 위치</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedItem?.storageLocations.length}개</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500">전체 상태</p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          selectedItem?.overallStatus === '보관중' 
                            ? 'bg-green-100 text-green-800'
                            : selectedItem?.overallStatus === '유통기한 임박'
                            ? 'bg-orange-100 text-orange-800'
                            : selectedItem?.overallStatus === '기간만료'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedItem?.overallStatus}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500">유통기한 범위</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedItem?.earliestExpiryDate !== 'N/A' && selectedItem?.latestExpiryDate !== 'N/A' && selectedItem?.earliestExpiryDate !== selectedItem?.latestExpiryDate
                            ? `${selectedItem?.earliestExpiryDate} ~ ${selectedItem?.latestExpiryDate}`
                            : selectedItem?.earliestExpiryDate !== 'N/A' ? selectedItem?.earliestExpiryDate : selectedItem?.latestExpiryDate
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 보관 위치별 상세 정보 */}
                  <div>
                    <h5 className="text-lg font-semibold text-gray-900 mb-4">보관 위치별 상세 정보</h5>
                    <div className="space-y-4">
                      {selectedItem?.storageLocations.map((location) => (
                        <div key={location.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-gray-700">{location.storageMethod}</span>
                              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                location.status === '보관중' 
                                  ? 'bg-green-100 text-green-800'
                                  : location.status === '유통기한 임박'
                                  ? 'bg-orange-100 text-orange-800'
                                  : location.status === '기간만료'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {location.status}
                              </span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-medium">{formatQuantity(location.quantity, location.unit)}</span>
                              {/* 사용완료 상태이거나 수량이 0이면 섭취 기능 비활성화 */}
                              {location.status === '사용완료' || location.quantity === 0 ? (
                                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md">
                                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                  </svg>
                                  <span className="text-xs text-gray-500">
                                    {location.status === '사용완료' ? '사용 완료됨' : '재고 없음'}
                                  </span>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center space-x-2">
                                    <input 
                                      type="number" 
                                      id={`consumption-${location.id}`}
                                      placeholder="섭취량(g)" 
                                      className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      min="0"
                                      max={location.quantity}
                                      step="1"
                                      onChange={() => {
                                        // 입력값이 변경될 때 저장 버튼 표시/숨김을 위해 상태 업데이트
                                        const input = document.getElementById(`consumption-${location.id}`) as HTMLInputElement;
                                        const saveButton = document.getElementById(`save-${location.id}`) as HTMLButtonElement;
                                        if (input && saveButton) {
                                          if (input.value && parseInt(input.value) > 0) {
                                            saveButton.style.display = 'block';
                                          } else {
                                            saveButton.style.display = 'none';
                                          }
                                        }
                                      }}
                                    />
                                    <div className="flex space-x-1">
                                      <button 
                                        type="button"
                                        onClick={() => {
                                          const input = document.getElementById(`consumption-${location.id}`) as HTMLInputElement;
                                          const saveButton = document.getElementById(`save-${location.id}`) as HTMLButtonElement;
                                          if (input) {
                                            const currentValue = parseInt(input.value) || 0;
                                            input.value = (currentValue + 1000).toString();
                                            if (saveButton) {
                                              saveButton.style.display = 'block';
                                            }
                                          }
                                        }}
                                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                      >
                                        1kg
                                      </button>
                                      <button 
                                        type="button"
                                        onClick={() => {
                                          const input = document.getElementById(`consumption-${location.id}`) as HTMLInputElement;
                                          const saveButton = document.getElementById(`save-${location.id}`) as HTMLButtonElement;
                                          if (input) {
                                            const currentValue = parseInt(input.value) || 0;
                                            input.value = (currentValue + 100).toString();
                                            if (saveButton) {
                                              saveButton.style.display = 'block';
                                            }
                                          }
                                        }}
                                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                      >
                                        100g
                                      </button>
                                      <button 
                                        type="button"
                                        onClick={() => {
                                          const input = document.getElementById(`consumption-${location.id}`) as HTMLInputElement;
                                          const saveButton = document.getElementById(`save-${location.id}`) as HTMLButtonElement;
                                          if (input) {
                                            const currentValue = parseInt(input.value) || 0;
                                            input.value = (currentValue + 10).toString();
                                            if (saveButton) {
                                              saveButton.style.display = 'block';
                                            }
                                          }
                                        }}
                                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                      >
                                        10g
                                      </button>
                                    </div>
                                  </div>
                                  <button 
                                    id={`save-${location.id}`}
                                    onClick={async () => {
                                      const input = document.getElementById(`consumption-${location.id}`) as HTMLInputElement;
                                      if (input && input.value) {
                                        const consumptionAmount = parseInt(input.value);
                                        if (consumptionAmount > 0) {
                                          try {
                                            // 현재 수량에서 섭취량을 뺀 값으로 업데이트
                                            const newQuantity = Math.max(0, location.quantity - consumptionAmount);
                                            
                                            // API 요청으로 수량 업데이트하고 응답 받기
                                            const updatedItem = await inventoryService.updateFoodInventoryQuantity(location.id, { quantity: newQuantity });
                                            
                                            // 백엔드에서 반환된 상태 정보 추출
                                            const statusMap: { [key: string]: '보관중' | '유통기한 임박' | '기간만료' | '사용완료' } = {
                                              "NORMAL": '보관중',
                                              "EXPIRING_SOON": '유통기한 임박',
                                              "EXPIRED": '기간만료',
                                              "CONSUMED": '사용완료'
                                            };
                                            const updatedStatus = updatedItem.status ? statusMap[updatedItem.status] : location.status;
                                            const updatedQuantity = updatedItem.quantity ?? newQuantity;
                                            
                                            // 로컬 상태 업데이트 (수량과 상태 모두 업데이트)
                                            setInventoryItems(prev => 
                                              prev.map(item => ({
                                                ...item,
                                                storageLocations: item.storageLocations.map(loc => 
                                                  loc.id === location.id 
                                                    ? { ...loc, quantity: updatedQuantity, originalQuantity: updatedQuantity, status: updatedStatus }
                                                    : loc
                                                ),
                                                totalQuantity: item.storageLocations.reduce((sum, loc) => 
                                                  loc.id === location.id ? sum + updatedQuantity : sum + loc.quantity, 0
                                                )
                                              }))
                                            );

                                            // 모달창의 selectedItem 상태도 업데이트하여 즉시 반영
                                            if (selectedItem) {
                                              setSelectedItem(prev => {
                                                if (!prev) return prev;
                                                const updatedStorageLocations = prev.storageLocations.map(loc => 
                                                  loc.id === location.id 
                                                    ? { ...loc, quantity: updatedQuantity, originalQuantity: updatedQuantity, status: updatedStatus }
                                                    : loc
                                                );
                                                const updatedTotalQuantity = updatedStorageLocations.reduce((sum, loc) => sum + loc.quantity, 0);
                                                
                                                return {
                                                  ...prev,
                                                  storageLocations: updatedStorageLocations,
                                                  totalQuantity: updatedTotalQuantity
                                                };
                                              });
                                            }
                                            
                                            // 입력란 초기화 및 저장 버튼 숨김
                                            input.value = '';
                                            const saveButton = document.getElementById(`save-${location.id}`) as HTMLButtonElement;
                                            if (saveButton) {
                                              saveButton.style.display = 'none';
                                            }
                                            
                                            alert(`섭취량이 저장되었습니다.${updatedStatus === '사용완료' ? '\n재고가 모두 소진되어 "사용완료" 상태로 변경되었습니다.' : ''}`);
                                          } catch (error) {
                                            console.error('Failed to update quantity:', error);
                                            alert('수량 저장에 실패했습니다.');
                                          }
                                        }
                                      }
                                    }}
                                    className="text-sm px-2 py-1 border rounded bg-blue-500 text-white hover:bg-blue-600"
                                    style={{ display: 'none' }}
                                  >
                                    저장
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">수량</p>
                              <p className="font-medium">{formatQuantity(location.quantity, location.unit)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">유통기한</p>
                              <p className="font-medium">{location.expiryDate}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">구매일</p>
                              <p className="font-medium">{location.addedDate}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">만료 여부</p>
                              <p className={`font-medium ${location.isExpired ? 'text-red-600' : 'text-green-600'}`}>
                                {location.isExpired ? '만료됨' : '유효함'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </UserGuard>
  )
}