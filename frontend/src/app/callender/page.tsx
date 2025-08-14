'use client'

import { useMemo, useState } from 'react'

type MealType = 'breakfast' | 'lunch' | 'dinner'

interface MealItem {
  id: string
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
  return `${y}-${m}-${d}`
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

export default function CalendarPage() {
  const today = new Date()
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()) // 0-11
  const [mealsByDate, setMealsByDate] = useState<MealsByDate>({})

  const [isDayModalOpen, setIsDayModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)
  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast')

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

  const handleAddItem = (item: Omit<MealItem, 'id'>) => {
    if (!selectedDate) return
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const key = formatDateKey(selectedDate)
    setMealsByDate(prev => {
      const existing = prev[key] ?? { breakfast: [], lunch: [], dinner: [] }
      const updated: DayMeals = {
        ...existing,
        [selectedMealType]: [...existing[selectedMealType], { id, ...item }],
      }
      return { ...prev, [key]: updated }
    })
    closeAddItemModal()
  }

  const totalCaloriesForMeal = (mealItems: MealItem[]) =>
    mealItems.reduce((sum, it) => sum + (Number(it.calories) || 0), 0)

  const totalCaloriesForDate = (key: string) => {
    const meals = mealsByDate[key]
    if (!meals) return 0
    return (
      totalCaloriesForMeal(meals.breakfast) +
      totalCaloriesForMeal(meals.lunch) +
      totalCaloriesForMeal(meals.dinner)
    )
  }

  const goPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(y => y - 1)
      setCurrentMonth(11)
    } else {
      setCurrentMonth(m => m - 1)
    }
  }

  const goNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(y => y + 1)
      setCurrentMonth(0)
    } else {
      setCurrentMonth(m => m + 1)
    }
  }

  const weekdayLabels = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={goPrevMonth} className="px-3 py-2 rounded border hover:bg-gray-50">이전</button>
        <div className="text-xl font-semibold">{monthLabel}</div>
        <button onClick={goNextMonth} className="px-3 py-2 rounded border hover:bg-gray-50">다음</button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-sm text-gray-600 mb-2">
        {weekdayLabels.map(w => (
          <div key={w} className="py-2 font-medium">{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: leadingEmptyCells }).map((_, i) => (
          <div key={`empty-${i}`} className="border rounded h-28 bg-gray-50" />
        ))}

        {days.map(date => {
          const key = formatDateKey(date)
          const meals = mealsByDate[key]
          const total = totalCaloriesForDate(key)
          return (
            <button
              key={key}
              onClick={() => openDayModal(date)}
              className={cx(
                'border rounded h-28 p-2 text-left hover:ring-2 hover:ring-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500',
                formatDateKey(date) === formatDateKey(today) && 'border-indigo-400'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold">{date.getDate()}</span>
                {total > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">{total} kcal</span>
                )}
              </div>
              {meals ? (
                <div className="space-y-1 overflow-hidden">
                  {(['breakfast', 'lunch', 'dinner'] as MealType[]).map(mt => {
                    const count = meals[mt].length
                    if (!count) return null
                    const label = mt === 'breakfast' ? '아침' : mt === 'lunch' ? '점심' : '저녁'
                    return (
                      <div key={mt} className="text-[11px] truncate">
                        <span className="px-1 rounded bg-gray-100 text-gray-700 mr-1">{label}</span>
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

      {isDayModalOpen && selectedDate && (
        <DayModal
          date={selectedDate}
          meals={mealsByDate[formatDateKey(selectedDate)] ?? { breakfast: [], lunch: [], dinner: [] }}
          onClose={closeDayModal}
          onAdd={(mealType) => openAddItemModal(mealType)}
          onRemoveItem={(mealType, id) => {
            const key = formatDateKey(selectedDate)
            setMealsByDate(prev => {
              const existing = prev[key]
              if (!existing) return prev
              const updated: DayMeals = {
                ...existing,
                [mealType]: existing[mealType].filter(it => it.id !== id),
              }
              return { ...prev, [key]: updated }
            })
          }}
        />
      )}

      {isAddItemModalOpen && selectedDate && (
        <AddItemModal
          mealType={selectedMealType}
          onClose={closeAddItemModal}
          onSubmit={(name, calories) => handleAddItem({ name, calories })}
        />
      )}
    </div>
  )
}

function DayModal({
  date,
  meals,
  onClose,
  onAdd,
  onRemoveItem,
}: {
  date: Date
  meals: DayMeals
  onClose: () => void
  onAdd: (mealType: MealType) => void
  onRemoveItem: (mealType: MealType, id: string) => void
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
                <div className="flex items-center justify-between p-3 border-b bg-gray-50">
                  <div className="font-medium">{section.label}</div>
                  <button
                    onClick={() => onAdd(section.key)}
                    className="text-indigo-600 text-sm px-2 py-1 rounded border border-indigo-200 hover:bg-indigo-50"
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
                        <button
                          onClick={() => onRemoveItem(section.key, item.id)}
                          className="text-gray-500 hover:text-red-600"
                          aria-label="삭제"
                        >
                          삭제
                        </button>
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
                className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">칼로리 (kcal)</label>
              <input
                value={calories}
                onChange={e => setCalories(e.target.value)}
                placeholder="예: 350"
                inputMode="numeric"
                className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded border hover:bg-gray-50">취소</button>
            <button
              onClick={() => {
                const parsed = Number(calories)
                if (!name.trim() || Number.isNaN(parsed)) return
                onSubmit(name.trim(), parsed)
              }}
              className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
            >
              추가
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


