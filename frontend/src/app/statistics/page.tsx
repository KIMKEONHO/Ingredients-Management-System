'use client';

import { useState, useEffect } from 'react';
import { COLOR_PRESETS } from '@/lib/constants/colors';
import PageHeader from '../components/ui/PageHeader';
import SectionCard from '../components/ui/SectionCard';
import { DietService, MonthStatisticsResponseDto, WeekStatisticsResponseDto } from '@/lib/api/services/dietService';
import { inventoryService, CategoryUsageStats, ConsumedLogResponseDto } from '@/lib/api/services/inventoryService';
import { UserGuard } from '@/lib/auth/authGuard';

export default function StatisticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('이번 달');
  const [monthStats, setMonthStats] = useState<MonthStatisticsResponseDto | null>(null);
  const [weekStats, setWeekStats] = useState<WeekStatisticsResponseDto[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryUsageStats[]>([]);
  const [consumedLogStats, setConsumedLogStats] = useState<ConsumedLogResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false); // 중복 로드 방지
  const [retryCount, setRetryCount] = useState(0); // 재시도 횟수

  const timePeriods = ['이번 주', '이번 달', '지난 3개월', '올해'];

  // 식단 통계 데이터 로드
  useEffect(() => {
    // 이미 로드된 경우 중복 실행 방지
    if (hasLoaded) return;

    const loadDietStatistics = async () => {
      try {
        setIsLoading(true);
        
        // API 요청 전에 약간의 지연을 두어 인증 토큰이 준비되도록 함
        await new Promise(resolve => setTimeout(resolve, 200));
        
        console.log('[DEBUG] 식단 통계 로드 시작, 재시도 횟수:', retryCount);
        
        const [monthData, weekData, categoryData, consumedLogData] = await Promise.all([
          DietService.getMonthStatistics(),
          DietService.getWeekStatistics(),
          inventoryService.getCategoryUsageStats(),
          inventoryService.getConsumedLogStatistics()
        ]);
        
        console.log('[DEBUG] 식단 통계 로드 성공:', { monthData, weekData, categoryData, consumedLogData });
        
        setMonthStats(monthData);
        setWeekStats(weekData);
        setCategoryStats(categoryData);
        setConsumedLogStats(consumedLogData);
        setHasLoaded(true); // 로드 완료 표시
      } catch (error) {
        console.error('식단 통계 로드 실패:', error);
        
        // 재시도 횟수가 2회 미만일 때만 재시도
        if (retryCount < 2) {
          console.log('[DEBUG] 재시도 시작, 1초 후 실행...');
          setRetryCount(prev => prev + 1);
          
          setTimeout(async () => {
            try {
              console.log('[DEBUG] 재시도 실행 중...');
              const [monthData, weekData, categoryData, consumedLogData] = await Promise.all([
                DietService.getMonthStatistics(),
                DietService.getWeekStatistics(),
                inventoryService.getCategoryUsageStats(),
                inventoryService.getConsumedLogStatistics()
              ]);
              
              console.log('[DEBUG] 재시도 성공:', { monthData, weekData, categoryData, consumedLogData });
              
              setMonthStats(monthData);
              setWeekStats(weekData);
              setCategoryStats(categoryData);
              setConsumedLogStats(consumedLogData);
              setHasLoaded(true);
            } catch (retryError) {
              console.error('재시도 실패:', retryError);
            } finally {
              setIsLoading(false);
            }
          }, 1000);
          
          return; // 첫 번째 시도 실패 시 여기서 종료
        } else {
          console.log('[DEBUG] 최대 재시도 횟수 도달, 로딩 종료');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadDietStatistics();
  }, [hasLoaded, retryCount]); // hasLoaded와 retryCount를 의존성으로 추가

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
      title: '이번 달 평균 칼로리',
      value: monthStats ? `${Math.round(monthStats.averageKcal)}kcal` : '로딩 중...',
      trend: monthStats && monthStats.diffRate 
        ? `${monthStats.diffRate > 0 ? '+' : ''}${Math.round(monthStats.diffRate)}% ${monthStats.diffRate > 0 ? '증가' : '감소'}`
        : '변화 없음',
      trendColor: monthStats && monthStats.diffRate 
        ? monthStats.diffRate > 0 ? 'text-red-600' : 'text-green-600'
        : 'text-gray-600',
      icon: (
        <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
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

  // 자주 사용하는 식재료 데이터 (ConsumedLogResponseDto 기반)
  const topIngredients = consumedLogStats.slice(0, 6).map((item, index) => {
    // 카테고리명으로 아이콘 결정
    const getCategoryIcon = (categoryName: string) => {
      const lowerName = categoryName.toLowerCase();
      if (lowerName.includes('채소') || lowerName.includes('야채')) return '🥬';
      if (lowerName.includes('육류') || lowerName.includes('고기')) return '🥩';
      if (lowerName.includes('유제품') || lowerName.includes('우유') || lowerName.includes('치즈')) return '🥛';
      if (lowerName.includes('곡물') || lowerName.includes('쌀') || lowerName.includes('빵')) return '🍞';
      if (lowerName.includes('해산물') || lowerName.includes('생선') || lowerName.includes('새우')) return '🐟';
      if (lowerName.includes('과일')) return '🍎';
      if (lowerName.includes('견과') || lowerName.includes('씨앗')) return '🥜';
      if (lowerName.includes('조미료') || lowerName.includes('양념')) return '🧂';
      return '🥘'; // 기본 아이콘
    };

    return {
      name: item.categoryName || '알 수 없음',
      category: item.categoryName || '알 수 없음',
      usage: `${item.totalConsumedQuantity || 0}개`,
      quantity: item.totalConsumedQuantity || 0,
      rank: index + 1,
      icon: getCategoryIcon(item.categoryName || '')
    };
  });

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
    },
    // 식단 관련 인사이트 추가
    ...(monthStats && monthStats.diffRate !== null ? [{
      title: monthStats.diffRate > 0 ? '칼로리 섭취 증가' : '칼로리 섭취 감소',
      description: monthStats.diffRate > 0 
        ? `지난달 대비 ${Math.round(monthStats.diffRate)}% 칼로리 섭취가 증가했습니다. 균형 잡힌 식단을 유지해보세요!`
        : `지난달 대비 ${Math.round(Math.abs(monthStats.diffRate))}% 칼로리 섭취가 감소했습니다. 건강한 다이어트를 하고 계시네요!`,
      icon: monthStats.diffRate > 0 ? '📈' : '📉',
      color: monthStats.diffRate > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
    }] : []),
    ...(weekStats.length > 0 ? [{
      title: '주간 칼로리 패턴',
      description: `최근 7일간 평균 ${Math.round(weekStats.reduce((sum, stat) => sum + stat.averageKcal, 0) / weekStats.length)}kcal를 섭취하고 있습니다.`,
      icon: '📊',
      color: 'bg-indigo-50 border-indigo-200'
    }] : [])
  ];

  return (
    <UserGuard>
      <div className={`min-h-screen ${COLOR_PRESETS.STATISTICS_PAGE.background} p-6`}>
        <div className="max-w-7xl mx-auto">
          {/* Main Card Container */}
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8">
            
            {/* Header Card */}
            <PageHeader 
              title="식재료 사용 통계"
              description="자주 사용하는 식재료와 소비 패턴을 분석해보세요"
              variant="statistics"
            >
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
            </PageHeader>

            {/* Summary Statistics Card */}
            <SectionCard title="요약 통계" variant="statistics">
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
            </SectionCard>

            {/* Charts Row Card */}
            <SectionCard title="차트 분석" variant="statistics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Monthly Category Usage */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">월별 카테고리 사용량</h3>
                  <div className="flex gap-2 mb-4 flex-wrap">
                    <button className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      전체
                    </button>
                    {categoryStats.map((category, index) => (
                      <button
                        key={category.categoryId}
                        className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                      >
                        {category.categoryName}
                      </button>
                    ))}
                  </div>
                  {isLoading ? (
                    <div className="h-64 flex items-center justify-center">
                      <div className="text-gray-500">로딩 중...</div>
                    </div>
                  ) : categoryStats.length > 0 ? (
                    <div className="h-64 bg-gradient-to-b from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                      <div className="h-full flex items-end justify-between gap-2">
                        {categoryStats.map((category, index) => {
                          const maxUsage = Math.max(...categoryStats.map(stat => stat.totalUsage));
                          const height = maxUsage > 0 ? (category.totalUsage / maxUsage) * 200 : 20;
                          
                          return (
                            <div key={category.categoryId} className="flex-1 flex flex-col items-center group">
                              <div className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-sm relative">
                                <div 
                                  className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-sm transition-all duration-300"
                                  style={{ height: `${Math.max(height, 20)}px` }}
                                ></div>
                                {/* 툴팁 */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  {category.categoryName}: {category.totalUsage}회
                                </div>
                              </div>
                              <span className="text-xs text-gray-600 mt-2 text-center">{category.categoryName}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center">
                      <div className="text-gray-500">카테고리 사용량 데이터가 없습니다</div>
                    </div>
                  )}
                </div>

                {/* Category Ratio */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">카테고리별 사용량 비율</h3>
                  {isLoading ? (
                    <div className="h-48 flex items-center justify-center">
                      <div className="text-gray-500">로딩 중...</div>
                    </div>
                  ) : categoryStats.length > 0 ? (
                    <>
                      <div className="flex items-center justify-center mb-4">
                        <div className="w-40 h-40 relative">
                          {/* 도넛 차트 시각화 */}
                          <svg className="w-40 h-40" viewBox="0 0 100 100">
                            {(() => {
                              let cumulativePercentage = 0;
                              const radius = 35;
                              const strokeWidth = 8;
                              const centerX = 50;
                              const centerY = 50;
                              
                              return categoryStats.map((item, index) => {
                                const percentage = item.percentage;
                                const startAngle = (cumulativePercentage / 100) * 360 - 90; // -90도부터 시작
                                const endAngle = ((cumulativePercentage + percentage) / 100) * 360 - 90;
                                
                                const startAngleRad = (startAngle * Math.PI) / 180;
                                const endAngleRad = (endAngle * Math.PI) / 180;
                                
                                const x1 = centerX + radius * Math.cos(startAngleRad);
                                const y1 = centerY + radius * Math.sin(startAngleRad);
                                const x2 = centerX + radius * Math.cos(endAngleRad);
                                const y2 = centerY + radius * Math.sin(endAngleRad);
                                
                                const largeArcFlag = percentage > 50 ? 1 : 0;
                                
                                const pathData = [
                                  `M ${centerX} ${centerY}`,
                                  `L ${x1} ${y1}`,
                                  `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                                  'Z'
                                ].join(' ');
                                
                                cumulativePercentage += percentage;
                                
                                // 색상 매핑
                                const colorMap: { [key: string]: string } = {
                                  'bg-blue-500': '#3B82F6',
                                  'bg-purple-500': '#8B5CF6',
                                  'bg-blue-400': '#60A5FA',
                                  'bg-purple-400': '#A78BFA',
                                  'bg-blue-300': '#93C5FD',
                                  'bg-green-500': '#10B981',
                                  'bg-orange-500': '#F59E0B',
                                  'bg-red-500': '#EF4444'
                                };
                                
                                const fillColor = colorMap[item.color] || '#6B7280';
                                
                                return (
                                  <path
                                    key={index}
                                    d={pathData}
                                    fill={fillColor}
                                    className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                                  />
                                );
                              });
                            })()}
                            
                            {/* 중앙 원 (도넛 효과) */}
                            <circle
                              cx="50"
                              cy="50"
                              r="25"
                              fill="white"
                              stroke="#E5E7EB"
                              strokeWidth="1"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-900">
                                {Math.round(categoryStats.reduce((sum, stat) => sum + stat.percentage, 0))}%
                              </div>
                              <div className="text-xs text-gray-500">총 사용량</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {categoryStats.map((item, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                            <span className="text-sm text-gray-600">{item.categoryName}</span>
                            <span className="text-sm font-medium text-gray-900 ml-auto">
                              {item.percentage.toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="h-48 flex items-center justify-center">
                      <div className="text-gray-500">카테고리 사용량 데이터가 없습니다</div>
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* Monthly Diet Statistics Card */}
            <SectionCard title="월간 식단 통계" variant="statistics">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                {isLoading ? (
                  <div className="h-32 flex items-center justify-center">
                    <div className="text-gray-500">로딩 중...</div>
                  </div>
                ) : monthStats ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 이번 달 평균 칼로리 */}
                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200">
                      <div className="text-2xl mb-2">🔥</div>
                      <h4 className="font-semibold text-gray-900 mb-2">이번 달 평균</h4>
                      <p className="text-2xl font-bold text-orange-600">
                        {Math.round(monthStats.averageKcal)}kcal
                      </p>
                    </div>

                    {/* 지난달 대비 변화 */}
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                      <div className="text-2xl mb-2">📊</div>
                      <h4 className="font-semibold text-gray-900 mb-2">지난달 대비</h4>
                      {monthStats.diffFromLast !== null ? (
                        <p className={`text-2xl font-bold ${
                          monthStats.diffFromLast > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {monthStats.diffFromLast > 0 ? '+' : ''}{Math.round(monthStats.diffFromLast)}kcal
                        </p>
                      ) : (
                        <p className="text-lg text-gray-500">변화 없음</p>
                      )}
                    </div>

                    {/* 변화율 */}
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-green-200">
                      <div className="text-2xl mb-2">📈</div>
                      <h4 className="font-semibold text-gray-900 mb-2">변화율</h4>
                      {monthStats.diffRate !== null ? (
                        <p className={`text-2xl font-bold ${
                          monthStats.diffRate > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {monthStats.diffRate > 0 ? '+' : ''}{Math.round(monthStats.diffRate)}%
                        </p>
                      ) : (
                        <p className="text-lg text-gray-500">변화 없음</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center">
                    <div className="text-gray-500">데이터를 불러올 수 없습니다</div>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Weekly Usage Card */}
            <SectionCard title="주간 칼로리 추이" variant="statistics">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 7일 칼로리 섭취량</h3>
                {isLoading ? (
                  <div className="h-48 flex items-center justify-center">
                    <div className="text-gray-500">로딩 중...</div>
                  </div>
                ) : weekStats.length > 0 ? (
                  <div className="h-48 flex items-end justify-between gap-2">
                    {weekStats.map((stat, index) => {
                      const date = new Date(stat.date);
                      const dayName = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
                      const maxKcal = Math.max(...weekStats.map(s => s.averageKcal));
                      const height = maxKcal > 0 ? (stat.averageKcal / maxKcal) * 100 : 0;
                      
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div className="w-full bg-gradient-to-t from-orange-500 to-red-500 rounded-t-sm relative group">
                            <div 
                              className="w-full bg-gradient-to-t from-orange-500 to-red-500 rounded-t-sm transition-all duration-300"
                              style={{ height: `${Math.max(height, 10)}px` }}
                            ></div>
                            {/* 툴팁 */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {Math.round(stat.averageKcal)}kcal
                            </div>
                          </div>
                          <span className="text-sm text-gray-600 mt-2">{dayName}</span>
                          <span className="text-xs text-gray-500">{date.getMonth() + 1}/{date.getDate()}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center">
                    <div className="text-gray-500">데이터가 없습니다</div>
                  </div>
                )}
                {weekStats.length > 0 && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                      주간 평균: <span className="font-semibold text-orange-600">
                        {Math.round(weekStats.reduce((sum, stat) => sum + stat.averageKcal, 0) / weekStats.length)}kcal
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Insights Card */}
            <SectionCard title="인사이트" variant="statistics">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {insights.map((insight, index) => (
                  <div key={index} className={`${insight.color} rounded-xl p-6 border border-blue-200 hover:shadow-md transition-shadow`}>
                    <div className="text-3xl mb-3">{insight.icon}</div>
                    <h4 className="font-semibold text-gray-900 mb-2">{insight.title}</h4>
                    <p className="text-sm text-gray-600">{insight.description}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Top Categories Card */}
            <SectionCard title="카테고리별 소비량" variant="statistics">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">TOP {Math.min(6, consumedLogStats.length)}</h3>
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    전체 보기
                  </button>
                </div>
                {isLoading ? (
                  <div className="h-48 flex items-center justify-center">
                    <div className="text-gray-500">로딩 중...</div>
                  </div>
                ) : topIngredients.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {topIngredients.map((ingredient, index) => (
                      <div key={index} className="border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white hover:border-blue-300">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl">{ingredient.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900">{ingredient.name}</h4>
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                #{ingredient.rank}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">카테고리</span>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">총 소비량:</span>
                            <span className="font-medium text-blue-600">{ingredient.usage}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center">
                    <div className="text-gray-500">소비량 데이터가 없습니다</div>
                  </div>
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </UserGuard>
  );
}
