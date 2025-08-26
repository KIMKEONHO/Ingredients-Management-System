'use client'

import { useMemo, useState, useEffect } from 'react'
import { COLOR_PRESETS } from '@/lib/constants/colors'
import { DietService, MonthlyDiet, DietItem } from '@/lib/api/services/dietService'

type MealType = 'breakfast' | 'lunch' | 'dinner'

interface MealItem {
  id: number
  name: string
  calories: number
}

interface DayMeals {
  breakfast: MealItem[]
  lunch: MealItem[]
  dinner: MealItem[]
}

type MealsByDate = Record<string, DayMeals>

function formatDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const dateKey = `${y}-${m}-${d}`
  console.log(`[DEBUG] formatDateKey: ${date.toISOString()} -> ${dateKey}`)
  return dateKey
}

function getDaysInMonth(year: number, monthIndexZeroBased: number) {
  const firstDay = new Date(year, monthIndexZeroBased, 1)
  const lastDay = new Date(year, monthIndexZeroBased + 1, 0)
  const days: Date[] = []
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, monthIndexZeroBased, d))
  }
  return { firstDay, lastDay, days }
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

// 백엔드 데이터를 프론트엔드 형식으로 변환하는 함수 (DietService에서 이미 변환됨)
function transformBackendData(backendData: MonthlyDiet): MealsByDate {
  console.log('[DEBUG] transformBackendData 호출됨, 입력 데이터:', backendData)
  
  // DietService에서 이미 변환된 데이터이므로 그대로 반환
  // 단, 날짜 키가 올바른지 확인
  const transformedData: MealsByDate = {}
  
  Object.keys(backendData).forEach(dateKey => {
    // 날짜 키가 올바른 형식인지 확인하고 변환
    const dateObj = new Date(dateKey + 'T00:00:00')
    const normalizedDateKey = dateObj.toLocaleDateString('en-CA') // YYYY-MM-DD 형식
    
    transformedData[normalizedDateKey] = backendData[dateKey]
  })
  
  console.log('[DEBUG] 정규화된 날짜 키:', Object.keys(transformedData))
  return transformedData
}

export default function CalendarPage() {
  const today = new Date()
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()) // 0-11
  const [mealsByDate, setMealsByDate] = useState<MealsByDate>({})
  
  // 로딩 상태 추가
  const [isLoading, setIsLoading] = useState(false)

  const [isDayModalOpen, setIsDayModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)
  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast')

  // 수정 모달 상태 추가
  const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<{ mealType: MealType; item: MealItem } | null>(null)

  const { days, firstDay } = useMemo(
    () => getDaysInMonth(currentYear, currentMonth),
    [currentYear, currentMonth]
  )

  const leadingEmptyCells = useMemo(() => {
    // Sunday=0 ... Saturday=6
    return firstDay.getDay()
  }, [firstDay])

  const monthLabel = useMemo(() => {
    return new Date(currentYear, currentMonth).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
    })
  }, [currentYear, currentMonth])

  // 월이 변경될 때마다 해당 월의 식단 데이터를 가져오는 함수
  const loadMonthlyDiet = async (year: number, month: number) => {
    setIsLoading(true)
    try {
      // month는 0-11이므로 1-12로 변환
      const monthNumber = month + 1
      console.log(`[DEBUG] ${year}년 ${monthNumber}월 식단 데이터 요청 중...`)
      
      const backendData = await DietService.getMonthlyDiet(year, monthNumber)
      console.log('[DEBUG] DietService에서 받은 데이터:', backendData)
      console.log('[DEBUG] 데이터 키들:', Object.keys(backendData))
      
      const transformedData = transformBackendData(backendData)
      console.log('[DEBUG] 최종 변환된 데이터:', transformedData)
      console.log('[DEBUG] 변환된 데이터의 날짜 키들:', Object.keys(transformedData))
      
      setMealsByDate(transformedData)
      
    } catch (error) {
      console.error('월별 식단 로드 실패:', error)
      setMealsByDate({})
    } finally {
      setIsLoading(false)
    }
  }

  // 월이 변경될 때마다 데이터 로드
  useEffect(() => {
    loadMonthlyDiet(currentYear, currentMonth)
  }, [currentYear, currentMonth])

  const openDayModal = (date: Date) => {
    setSelectedDate(date)
    setIsDayModalOpen(true)
  }

  const closeDayModal = () => {
    setIsDayModalOpen(false)
    setSelectedDate(null)
  }

  const openAddItemModal = (mealType: MealType) => {
    setSelectedMealType(mealType)
    setIsAddItemModalOpen(true)
  }

  const closeAddItemModal = () => {
    setIsAddItemModalOpen(false)
  }

  // 수정 모달 열기 함수 추가
  const openEditItemModal = (mealType: MealType, item: MealItem) => {
    setEditingItem({ mealType, item })
    setIsEditItemModalOpen(true)
  }

  // 수정 모달 닫기 함수 추가
  const closeEditItemModal = () => {
    setIsEditItemModalOpen(false)
    setEditingItem(null)
  }

  const handleAddItem = async ({ name, calories }: { name: string; calories: number }) => {
    if (!selectedDate) return
    
    console.log('[DEBUG] handleAddItem 시작:', { name, calories, selectedDate, selectedMealType })
    
    try {
      const dateKey = formatDateKey(selectedDate)
      const monthNumber = selectedDate.getMonth() + 1
      
      console.log('[DEBUG] 요청할 데이터:', { dateKey, monthNumber, selectedMealType })
      
      // 백엔드에 식단 항목 추가
      const newItem = await DietService.addDietItem(
        dateKey,
        selectedMealType,
        name,
        calories
      )
      
      console.log('[DEBUG] 백엔드 응답:', newItem)
      
      if (newItem) {
        console.log('[DEBUG] 식단 추가 성공, 모달 닫기 시작')
        
        // 성공적으로 추가된 경우 모달 닫고 데이터 새로고침
        setIsAddItemModalOpen(false)
        setIsDayModalOpen(false)
        setSelectedDate(null)
        
        console.log('[DEBUG] 모달 상태 초기화 완료, 데이터 새로고침 시작')
        
        // 데이터 새로고침
        await loadMonthlyDiet(currentYear, currentMonth)
        
        console.log('[DEBUG] 데이터 새로고침 완료')
      } else {
        console.log('[DEBUG] 식단 추가 실패: newItem이 null')
        // 사용자에게 에러 메시지 표시 (선택사항)
        alert('식단 추가에 실패했습니다. 다시 시도해주세요.')
      }
    } catch (error) {
      console.error('식단 항목 추가 실패:', error)
      // 에러 처리 (사용자에게 알림 등)
    }
  }

  // 수정 처리 함수 추가
  const handleEditItem = async ({ name, calories }: { name: string; calories: number }) => {
    if (!editingItem) return
    
    try {
      // 백엔드에 식단 항목 수정 (기존 mealType과 date 유지)
      const updatedItem = await DietService.updateDietItem(
        editingItem.item.id,
        name,
        calories,
        editingItem.mealType,
        selectedDate ? formatDateKey(selectedDate) : undefined
      )
      
      if (updatedItem) {
        // 성공적으로 수정된 경우 모달 닫고 데이터 새로고침
        closeEditItemModal()
        await loadMonthlyDiet(currentYear, currentMonth)
        // 성공 메시지 표시
        alert('식단이 성공적으로 수정되었습니다.')
      } else {
        // 실패 메시지 표시
        alert('식단 수정에 실패했습니다. 다시 시도해주세요.')
      }
    } catch (error) {
      console.error('식단 항목 수정 실패:', error)
      // 에러 처리 (사용자에게 알림 등)
    }
  }

  // 삭제 처리 함수 수정
  const handleRemoveItem = async (mealType: MealType, id: number) => {
    try {
      // 백엔드에 식단 항목 삭제
      const success = await DietService.deleteDietItem(id)
      
      if (success) {
        // 성공적으로 삭제된 경우 데이터 새로고침
        await loadMonthlyDiet(currentYear, currentMonth)
        // 성공 메시지 표시
        alert('식단이 성공적으로 삭제되었습니다.')
      } else {
        // 실패 메시지 표시
        alert('식단 삭제에 실패했습니다. 다시 시도해주세요.')
      }
    } catch (error) {
      console.error('식단 항목 삭제 실패:', error)
      // 에러 처리 (사용자에게 알림 등)
    }
  }

  return (
    <div className={`min-h-screen ${COLOR_PRESETS.CALENDAR_PAGE.background} p-6`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className={`${COLOR_PRESETS.CALENDAR_PAGE.header} rounded-xl shadow-sm ${COLOR_PRESETS.CALENDAR_PAGE.border} p-6 mb-6`}>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">식단 캘린더</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (currentMonth === 0) {
                    setCurrentYear(prev => prev - 1)
                    setCurrentMonth(11)
                  } else {
                    setCurrentMonth(prev => prev - 1)
                  }
                }}
                className={`p-2 rounded-lg ${COLOR_PRESETS.CALENDAR_PAGE.hover} transition-colors`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-xl font-semibold text-gray-700 min-w-[120px] text-center">{monthLabel}</h2>
              <button
                onClick={() => {
                  if (currentMonth === 11) {
                    setCurrentYear(prev => prev + 1)
                    setCurrentMonth(0)
                  } else {
                    setCurrentMonth(prev => prev + 1)
                  }
                }}
                className={`p-2 rounded-lg ${COLOR_PRESETS.CALENDAR_PAGE.hover} transition-colors`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className={`${COLOR_PRESETS.CALENDAR_PAGE.card} rounded-xl shadow-sm ${COLOR_PRESETS.CALENDAR_PAGE.border} p-6`}>
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['일', '월', '화', '수', '목', '금', '토'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {/* Leading empty cells */}
            {Array.from({ length: leadingEmptyCells }, (_, i) => (
              <div key={`empty-${i}`} className="h-28" />
            ))}

            {/* Actual days */}
            {days.map(date => {
              const dateKey = formatDateKey(date)
              const meals = mealsByDate[dateKey]
              
              // 디버깅을 위한 로그 추가
              if (meals) {
                console.log(`[DEBUG] ${dateKey} 날짜의 meals:`, meals)
              }
              
              const total = meals ? Object.values(meals).reduce((sum: number, meal: MealItem[]) => {
                const mealTotal = meal.reduce((s: number, item: MealItem) => s + item.calories, 0)
                console.log(`[DEBUG] ${dateKey} 식사별 칼로리 합계:`, mealTotal)
                return sum + mealTotal
              }, 0) : 0

              console.log(`[DEBUG] ${dateKey} 총 칼로리:`, total)

              return (
                <button
                  key={date.getTime()}
                  onClick={() => openDayModal(date)}
                  className={cx(
                    'border rounded h-28 p-2 text-left hover:ring-2 hover:ring-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all',
                    formatDateKey(date) === formatDateKey(today) && `${COLOR_PRESETS.CALENDAR_PAGE.today} border-blue-400`
                  )}
                  disabled={isLoading}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold">{date.getDate()}</span>
                    {total > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{total} kcal</span>
                    )}
                  </div>
                  {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  ) : meals ? (
                    <div className="space-y-1 overflow-hidden">
                      {(['breakfast', 'lunch', 'dinner'] as MealType[]).map(mt => {
                        const count = meals[mt].length
                        console.log(`[DEBUG] ${dateKey} ${mt} 개수:`, count)
                        if (!count) return null
                        const label = mt === 'breakfast' ? '아침' : mt === 'lunch' ? '점심' : '저녁'
                        return (
                          <div key={mt} className="text-[11px] truncate">
                            <span className="px-1 rounded bg-blue-100 text-blue-700 mr-1">{label}</span>
                            <span className="text-gray-600">{count}개</span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-gray-400">클릭하여 추가</div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {isDayModalOpen && selectedDate && (
          <DayModal
            date={selectedDate}
            meals={mealsByDate[formatDateKey(selectedDate)] ?? { breakfast: [], lunch: [], dinner: [] }}
            onClose={closeDayModal}
            onAdd={(mealType) => openAddItemModal(mealType)}
            onEdit={(mealType, item) => openEditItemModal(mealType, item)}
            onRemoveItem={handleRemoveItem}
          />
        )}

        {isAddItemModalOpen && selectedDate && (
          <AddItemModal
            mealType={selectedMealType}
            onClose={closeAddItemModal}
            onSubmit={(name, calories) => handleAddItem({ name, calories })}
          />
        )}

        {isEditItemModalOpen && editingItem && (
          <EditItemModal
            mealType={editingItem.mealType}
            item={editingItem.item}
            onClose={closeEditItemModal}
            onSubmit={(name, calories) => handleEditItem({ name, calories })}
          />
        )}
      </div>
    </div>
  )
}

function DayModal({
  date,
  meals,
  onClose,
  onAdd,
  onEdit,
  onRemoveItem,
}: {
  date: Date
  meals: DayMeals
  onClose: () => void
  onAdd: (mealType: MealType) => void
  onEdit: (mealType: MealType, item: MealItem) => void
  onRemoveItem: (mealType: MealType, id: number) => void
}) {
  const title = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`
  const sections: Array<{ key: MealType; label: string; items: MealItem[] }> = [
    { key: 'breakfast', label: '아침', items: meals.breakfast },
    { key: 'lunch', label: '점심', items: meals.lunch },
    { key: 'dinner', label: '저녁', items: meals.dinner },
  ]

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button onClick={onClose} className="rounded px-2 py-1 text-gray-500 hover:bg-gray-100">닫기</button>
          </div>

          <div className="space-y-4">
            {sections.map(section => (
              <div key={section.key} className="border rounded">
                <div className="flex items-center justify-between p-3 border-b bg-blue-50">
                  <div className="font-medium">{section.label}</div>
                  <button
                    onClick={() => onAdd(section.key)}
                    className="text-blue-600 text-sm px-2 py-1 rounded border border-blue-200 hover:bg-blue-50"
                  >
                    + 추가
                  </button>
                </div>
                <div className="p-3 space-y-2">
                  {section.items.length === 0 ? (
                    <div className="text-sm text-gray-400">항목이 없습니다. 추가해주세요.</div>
                  ) : (
                    section.items.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="truncate mr-2">
                          <span className="font-medium mr-2">{item.name}</span>
                          <span className="text-gray-500">{item.calories} kcal</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => onEdit(section.key, item)}
                            className="text-gray-500 hover:text-blue-600"
                            aria-label="수정"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => onRemoveItem(section.key, item.id)}
                            className="text-gray-500 hover:text-red-600"
                            aria-label="삭제"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function AddItemModal({
  mealType,
  onClose,
  onSubmit,
}: {
  mealType: MealType
  onClose: () => void
  onSubmit: (name: string, calories: number) => void
}) {
  const [name, setName] = useState('')
  const [calories, setCalories] = useState<string>('')

  const label = mealType === 'breakfast' ? '아침' : mealType === 'lunch' ? '점심' : '저녁'

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{label} 항목 추가</h3>
            <button onClick={onClose} className="rounded px-2 py-1 text-gray-500 hover:bg-gray-100">닫기</button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">메뉴</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="예: 닭가슴살 샐러드"
                className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">칼로리 (kcal)</label>
              <input
                value={calories}
                onChange={e => setCalories(e.target.value)}
                placeholder="예: 350"
                inputMode="numeric"
                className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={() => {
                const caloriesNum = parseInt(calories)
                if (name.trim() && !isNaN(caloriesNum) && caloriesNum > 0) {
                  onSubmit(name.trim(), caloriesNum)
                } else {
                  alert('올바른 값을 입력해주세요.')
                }
              }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              추가
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function EditItemModal({
  mealType,
  item,
  onClose,
  onSubmit,
}: {
  mealType: MealType
  item: MealItem
  onClose: () => void
  onSubmit: (name: string, calories: number) => void
}) {
  const [name, setName] = useState(item.name)
  const [calories, setCalories] = useState<string>(item.calories.toString())

  const label = mealType === 'breakfast' ? '아침' : mealType === 'lunch' ? '점심' : '저녁'
  
  // 수정 시 유효성 검사 추가
  const handleSubmit = () => {
    const caloriesNum = parseInt(calories)
    if (name.trim() && !isNaN(caloriesNum) && caloriesNum > 0) {
      onSubmit(name.trim(), caloriesNum)
    } else {
      alert('올바른 값을 입력해주세요.')
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{label} 항목 수정</h3>
            <button onClick={onClose} className="rounded px-2 py-1 text-gray-500 hover:bg-gray-100">닫기</button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">메뉴</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="예: 닭가슴살 샐러드"
                className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">칼로리 (kcal)</label>
              <input
                value={calories}
                onChange={e => setCalories(e.target.value)}
                placeholder="예: 350"
                inputMode="numeric"
                className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              수정
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


