'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useGlobalLoginMember } from '@/app/stores/auth/loginMamber'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { COLOR_PRESETS } from '@/lib/constants/colors'

interface CartItem {
  id: number
  name: string
  category: string
  price: number
  quantity: number
  unit: string
  image: string
}

export default function CartPage() {
  const { isLogin, isLoginMemberPending } = useGlobalLoginMember()
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: '신선한 토마토',
      category: '채소',
      price: 2500,
      quantity: 2,
      unit: 'kg',
      image: '/vercel.svg'
    },
    {
      id: 2,
      name: '국내산 쌀',
      category: '곡물',
      price: 15000,
      quantity: 1,
      unit: '포',
      image: '/next.svg'
    },
    {
      id: 3,
      name: '신선한 돼지고기',
      category: '육류',
      price: 12000,
      quantity: 3,
      unit: 'kg',
      image: '/file.svg'
    },
    {
      id: 4,
      name: '양파',
      category: '채소',
      price: 800,
      quantity: 5,
      unit: '개',
      image: '/globe.svg'
    }
  ])

  // 로그인 상태 확인
  useEffect(() => {
    if (!isLoginMemberPending && !isLogin) {
      console.log('로그인되지 않음, 로그인 페이지로 이동')
      router.push('/login')
    }
  }, [isLogin, isLoginMemberPending, router])

  // 로딩 중이거나 로그인되지 않은 경우
  if (isLoginMemberPending) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-2xl font-bold">로딩 중...</div>
      </div>
    )
  }

  if (!isLogin) {
    return null
  }

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id))
  }

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return (
    <div className={`min-h-screen ${COLOR_PRESETS.CART_PAGE.background}`}>
      {/* Header */}
      <div className={`${COLOR_PRESETS.CART_PAGE.header} shadow-sm border-b ${COLOR_PRESETS.CART_PAGE.border}`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className={`flex items-center gap-2 ${COLOR_PRESETS.CART_PAGE.accent} hover:text-blue-700`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path d="M11.47 3.84a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.06l-8.69-8.69a.75.75 0 0 0-1.06 0Z"/>
                <path d="m12 15.75-7.304-7.304a.75.75 0 0 0-1.06 1.06L12 18.75l8.364-8.364a.75.75 0 0 0-1.06-1.06L12 15.75Z"/>
              </svg>
              메인으로 돌아가기
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">장바구니</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className={`${COLOR_PRESETS.CART_PAGE.card} rounded-lg shadow-sm ${COLOR_PRESETS.CART_PAGE.border}`}>
              <div className={`px-6 py-4 border-b ${COLOR_PRESETS.CART_PAGE.border}`}>
                <h2 className="text-lg font-semibold text-gray-900">장바구니 상품 ({cartItems.length}개)</h2>
              </div>
              
              {cartItems.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-16 w-16 mx-auto text-gray-300 mb-4">
                    <path d="M2.25 3.75A.75.75 0 0 1 3 3h2.31a1.5 1.5 0 0 1 1.46 1.14l.3 1.21h12.6a.75.75 0 0 1 .73.92l-1.5 6a1.5 1.5 0 0 1-1.45 1.13H8.31l.18.72a.75.75 0 0 0 .73.56h9.03a.75.75 0 0 1 0 1.5H9.22a2.25 2.25 0 0 1-2.18-1.69L4.54 5.86l-.3-1.2H3a.75.75 0 0 1-.75-.9Z"/>
                    <path d="M6.75 21a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm10.5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z"/>
                  </svg>
                  <p className="text-gray-500 text-lg">장바구니가 비어있습니다</p>
                  <Link href="/" className={`inline-flex items-center gap-2 mt-4 px-6 py-2 ${COLOR_PRESETS.CART_PAGE.button} text-white rounded-lg transition`}>
                    쇼핑 계속하기
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-blue-100">
                  {cartItems.map((item) => (
                    <div key={item.id} className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center">
                            <img src={item.image} alt={item.name} className="w-8 h-8" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                              <p className="text-sm text-gray-500">{item.category}</p>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-gray-400 hover:text-red-500 transition"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                                <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z"/>
                              </svg>
                            </button>
                          </div>
                          
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 rounded-full border border-blue-200 flex items-center justify-center hover:bg-blue-50 transition"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                                  <path d="M5 12a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5H5.75A.75.75 0 0 1 5 12Z"/>
                                </svg>
                              </button>
                              <span className="w-12 text-center text-sm font-medium text-gray-900">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 rounded-full border border-blue-200 flex items-center justify-center hover:bg-blue-50 transition"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                                  <path d="M12 4.5a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V5.25A.75.75 0 0 1 12 4.5Z"/>
                                </svg>
                              </button>
                              <span className="text-sm text-gray-500">{item.unit}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">{(item.price * item.quantity).toLocaleString()}원</p>
                              <p className="text-xs text-gray-500">{item.price.toLocaleString()}원/{item.unit}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className={`${COLOR_PRESETS.CART_PAGE.card} rounded-lg shadow-sm ${COLOR_PRESETS.CART_PAGE.border} sticky top-8`}>
              <div className={`px-6 py-4 border-b ${COLOR_PRESETS.CART_PAGE.border}`}>
                <h2 className="text-lg font-semibold text-gray-900">주문 요약</h2>
              </div>
              
              <div className="px-6 py-4 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">상품 수량</span>
                  <span className="font-medium">{cartItems.length}개</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">총 상품 금액</span>
                  <span className="font-medium">{totalPrice.toLocaleString()}원</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">배송비</span>
                  <span className={`font-medium ${COLOR_PRESETS.CART_PAGE.accent}`}>무료</span>
                </div>
                
                <div className={`border-t ${COLOR_PRESETS.CART_PAGE.border} pt-4`}>
                  <div className="flex justify-between text-lg font-semibold">
                    <span>총 결제 금액</span>
                    <span className={COLOR_PRESETS.CART_PAGE.accent}>{totalPrice.toLocaleString()}원</span>
                  </div>
                </div>
              </div>
              
              <div className={`px-6 py-4 border-t ${COLOR_PRESETS.CART_PAGE.border}`}>
                <button className={`w-full ${COLOR_PRESETS.CART_PAGE.button} text-white py-3 px-4 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}>
                  주문하기
                </button>
                
                <div className="mt-3 text-center">
                  <Link href="/" className={`text-sm ${COLOR_PRESETS.CART_PAGE.accent} hover:text-blue-700`}>
                    쇼핑 계속하기
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
