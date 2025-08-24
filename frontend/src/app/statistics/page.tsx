'use client';

import { useState } from 'react';

export default function StatisticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('이번 달');

  const timePeriods = ['이번 주', '이번 달', '지난 3개월', '올해'];

  const summaryStats = [
    {
      title: '총 사용 식재료',
      value: '147개',
      trend: '+12% 증가',
      trendColor: 'text-green-600',
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042h1.096a1 1 0 00.01-.042L6.34 3H10a1 1 0 00.01-.042L10.34 1H3zM13 2.5a.5.5 0 00-.5-.5h-1a.5.5 0 00-.5.5v1a.5.5 0 00.5.5h1a.5.5 0 00.5-.5v-1z"/>
          <path d="M9.5 1H2V2h5.5V1zM1 4v10a1 1 0 001 1h12a1 1 0 001-1V4H1zm0 1h12v8H1V5z"/>
        </svg>
      )
    },
    {
      title: '이번 달 총 비용',
      value: '₩456,000',
      trend: '+8% 감소',
      trendColor: 'text-blue-600',
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
        </svg>
      )
    },
    {
      title: '가장 많이 사용',
      value: '양파',
      trend: '+45회 사용',
      trendColor: 'text-purple-600',
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
        </svg>
      )
    },
    {
      title: '일평균 사용량',
      value: '18개',
      trend: '+2% 증가',
      trendColor: 'text-blue-600',
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3-3a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1z" clipRule="evenodd"/>
        </svg>
      )
    }
  ];

  const topIngredients = [
    { name: '양파', category: '채소류', usage: '45회', totalCost: '67,500원', avgPrice: '1,500원', icon: '🧅' },
    { name: '닭고기', category: '육류', usage: '32회', totalCost: '128,000원', avgPrice: '4,000원', icon: '🍗' },
    { name: '우유', category: '유제품', usage: '28회', totalCost: '84,000원', avgPrice: '3,000원', icon: '🥛' },
    { name: '쌀', category: '곡물류', usage: '25회', totalCost: '75,000원', avgPrice: '3,000원', icon: '🍚' },
    { name: '토마토', category: '채소류', usage: '22회', totalCost: '66,000원', avgPrice: '3,000원', icon: '🍅' },
    { name: '계란', category: '유제품', usage: '38회', totalCost: '76,000원', avgPrice: '2,000원', icon: '🥚' }
  ];

  const insights = [
    {
      title: '채소류 소비 증가',
      description: '지난달 대비 채소류 사용량이 15% 증가했습니다. 건강한 식단을 유지하고 계시네요!',
      icon: '🌱',
      color: 'bg-blue-50 border-blue-200'
    },
    {
      title: '비용 효율적 구매',
      description: '평균 가격보다 12% 저렴하게 구매하고 계십니다. 현명한 장보기를 하고 있어요!',
      icon: '🛍️',
      color: 'bg-purple-50 border-purple-200'
    },
    {
      title: '주말 요리 패턴',
      description: '주말에 더 다양한 식재료를 사용하는 경향이 있습니다. 특별한 요리에 도전해보세요!',
      icon: '🍳',
      color: 'bg-blue-50 border-blue-200'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Main Card Container */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-8 text-white">
            <h1 className="text-3xl font-bold text-white mb-2">식재료 사용 통계</h1>
            <p className="text-blue-100 mb-6">자주 사용하는 식재료와 소비 패턴을 분석해보세요</p>
            
            {/* Time Period Selector */}
            <div className="flex justify-end">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1 shadow-sm border border-white/30">
                {timePeriods.map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedPeriod === period
                        ? 'bg-white text-blue-600'
                        : 'text-white hover:text-blue-100'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Summary Statistics Card */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-blue-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">요약 통계</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {summaryStats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    {stat.icon}
                    <span className={`text-sm font-medium ${stat.trendColor}`}>
                      {stat.trend}
                    </span>
                  </div>
                  <h3 className="text-gray-600 text-sm mb-2">{stat.title}</h3>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Charts Row Card */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-blue-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">차트 분석</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Monthly Category Usage */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">월별 카테고리 사용량</h3>
                <div className="flex gap-2 mb-4">
                  {['전체', '채소류', '육류', '유제품', '곡물류'].map((category, index) => (
                    <button
                      key={category}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        index === 0
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                <div className="h-64 bg-gradient-to-b from-blue-50 to-purple-50 rounded-lg flex items-end justify-center p-4 border border-blue-200">
                  <div className="text-blue-600 text-sm">차트 영역 (1월~6월)</div>
                </div>
              </div>

              {/* Category Ratio */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">카테고리별 비율</h3>
                <div className="flex items-center justify-center mb-4">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center border border-blue-200">
                    <div className="text-blue-600 text-sm">도넛 차트</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { label: '채소류', percentage: '35%', color: 'bg-blue-500' },
                    { label: '육류', percentage: '25%', color: 'bg-purple-500' },
                    { label: '유제품', percentage: '20%', color: 'bg-blue-400' },
                    { label: '곡물류', percentage: '15%', color: 'bg-purple-400' },
                    { label: '기타', percentage: '5%', color: 'bg-blue-300' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      <span className="text-sm text-gray-600">{item.label}</span>
                      <span className="text-sm font-medium text-gray-900 ml-auto">{item.percentage}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Usage Card */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-blue-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">주간 사용량</h2>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">주간 사용량</h3>
              <div className="h-48 flex items-end justify-between gap-2">
                {['월', '화', '수', '목', '금', '토', '일'].map((day, index) => (
                  <div key={day} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-sm"
                      style={{ height: `${Math.random() * 20 + 10}px` }}
                    ></div>
                    <span className="text-sm text-gray-600 mt-2">{day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Insights Card */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-blue-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">인사이트</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {insights.map((insight, index) => (
                <div key={index} className={`${insight.color} rounded-xl p-6 border border-blue-200 hover:shadow-md transition-shadow`}>
                  <div className="text-3xl mb-3">{insight.icon}</div>
                  <h4 className="font-semibold text-gray-900 mb-2">{insight.title}</h4>
                  <p className="text-sm text-gray-600">{insight.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Ingredients Card */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">자주 사용하는 식재료</h2>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">TOP 6</h3>
                <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  전체 보기
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topIngredients.map((ingredient, index) => (
                  <div key={index} className="border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white hover:border-blue-300">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{ingredient.icon}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{ingredient.name}</h4>
                        <span className="text-sm text-gray-500">{ingredient.category}</span>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">사용 횟수:</span>
                        <span className="font-medium">{ingredient.usage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">총 비용:</span>
                        <span className="font-medium">{ingredient.totalCost}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">평균 가격:</span>
                        <span className="font-medium">{ingredient.avgPrice}</span>
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
  );
}
