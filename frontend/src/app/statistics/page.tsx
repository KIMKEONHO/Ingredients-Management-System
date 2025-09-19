'use client';

import { useState, useEffect } from 'react';
import { COLOR_PRESETS } from '@/lib/constants/colors';
import PageHeader from '../components/ui/PageHeader';
import SectionCard from '../components/ui/SectionCard';
import { DietService, MonthStatisticsResponseDto, WeekStatisticsResponseDto } from '@/lib/api/services/dietService';
import { ConsumedService, ConsumedLogResponseDto, MonthlyConsumedLogResponseDto } from '@/lib/api/services/consumedService';
import { UserGuard } from '@/lib/auth/authGuard';

export default function StatisticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('이번 달');
  const [monthStats, setMonthStats] = useState<MonthStatisticsResponseDto | null>(null);
  const [weekStats, setWeekStats] = useState<WeekStatisticsResponseDto[]>([]);
  const [consumedData, setConsumedData] = useState<ConsumedLogResponseDto[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyConsumedLogResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false); // 중복 로드 방지
  const [retryCount, setRetryCount] = useState(0); // 재시도 횟수
  const [showAllCategories, setShowAllCategories] = useState(false); // 카테고리 더보기 상태
  const [selectedCategory, setSelectedCategory] = useState<string>('전체'); // 선택된 카테고리
  const [showAllCategoryFilters, setShowAllCategoryFilters] = useState(false); // 카테고리 필터 패널 확장 상태

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
        
        const [monthData, weekData] = await Promise.all([
          DietService.getMonthStatistics(),
          DietService.getWeekStatistics()
        ]);
        
        console.log('[DEBUG] 식단 통계 로드 성공:', { monthData, weekData });
        
        setMonthStats(monthData);
        setWeekStats(weekData);
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
              const [monthData, weekData] = await Promise.all([
                DietService.getMonthStatistics(),
                DietService.getWeekStatistics()
              ]);
              
              console.log('[DEBUG] 재시도 성공:', { monthData, weekData });
              
              setMonthStats(monthData);
              setWeekStats(weekData);
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

  // 선택된 기간에 따른 사용량 데이터 로드
  useEffect(() => {
    const loadConsumedData = async () => {
      try {
        setIsLoading(true);
        console.log('[DEBUG] 사용량 데이터 로드 시작, 기간:', selectedPeriod);
        
        const data = await ConsumedService.getConsumedLogByPeriod(selectedPeriod);
        console.log('[DEBUG] 사용량 데이터 로드 성공:', data);
        
        setConsumedData(data);
      } catch (error) {
        console.error('사용량 데이터 로드 실패:', error);
        setConsumedData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadConsumedData();
  }, [selectedPeriod]);

  // 월별 사용량 데이터 로드
  useEffect(() => {
    const loadMonthlyData = async () => {
      try {
        console.log('[DEBUG] 월별 사용량 데이터 로드 시작');
        const data = await ConsumedService.getMonthlyConsumedLog();
        console.log('[DEBUG] 월별 사용량 데이터 로드 성공:', data);
        setMonthlyData(data);
      } catch (error) {
        console.error('월별 사용량 데이터 로드 실패:', error);
        setMonthlyData([]);
      }
    };

    loadMonthlyData();
  }, []);

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

  const topIngredients = [
    { name: '양파', category: '채소류', usage: '45회', totalCost: '67,500원', avgPrice: '1,500원', icon: '🧅' },
    { name: '닭고기', category: '육류', usage: '32회', totalCost: '128,000원', avgPrice: '4,000원', icon: '🍗' },
    { name: '우유', category: '유제품', usage: '28회', totalCost: '84,000원', avgPrice: '3,000원', icon: '🥛' },
    { name: '쌀', category: '곡물류', usage: '25회', totalCost: '75,000원', avgPrice: '3,000원', icon: '🍚' },
    { name: '토마토', category: '채소류', usage: '22회', totalCost: '66,000원', avgPrice: '3,000원', icon: '🍅' },
    { name: '계란', category: '유제품', usage: '38회', totalCost: '76,000원', avgPrice: '2,000원', icon: '🥚' }
  ];

  // 카테고리별 비율 계산 (중복 카테고리 합치기)
  const calculateCategoryRatios = (data: ConsumedLogResponseDto[]) => {
    // 중복 카테고리 합치기
    const categoryMap = new Map<string, { totalQuantity: number; categoryName: string }>();
    
    data.forEach(item => {
      const categoryName = item.categoryName || '기타';
      const quantity = item.totalConsumedQuantity || 0;
      
      if (categoryMap.has(categoryName)) {
        const existing = categoryMap.get(categoryName)!;
        existing.totalQuantity += quantity;
      } else {
        categoryMap.set(categoryName, {
          totalQuantity: quantity,
          categoryName: categoryName
        });
      }
    });
    
    // Map을 배열로 변환
    const mergedData = Array.from(categoryMap.values());
    const totalQuantity = mergedData.reduce((sum, item) => sum + item.totalQuantity, 0);
    
    if (totalQuantity === 0) return [];
    
    const colors = [
      { bg: 'bg-blue-500', hex: '#3B82F6' },
      { bg: 'bg-purple-500', hex: '#8B5CF6' },
      { bg: 'bg-green-500', hex: '#10B981' },
      { bg: 'bg-orange-500', hex: '#F97316' },
      { bg: 'bg-pink-500', hex: '#EC4899' },
      { bg: 'bg-indigo-500', hex: '#6366F1' },
      { bg: 'bg-red-500', hex: '#EF4444' },
      { bg: 'bg-yellow-500', hex: '#EAB308' }
    ];
    
    return mergedData.map((item, index) => ({
      label: item.categoryName,
      percentage: Math.round((item.totalQuantity / totalQuantity) * 100),
      quantity: item.totalQuantity,
      color: colors[index % 8]
    })).sort((a, b) => b.quantity - a.quantity);
  };

  const categoryRatios = calculateCategoryRatios(consumedData);
  const maxVisibleCategories = 5; // 최대 표시할 카테고리 수
  const visibleCategories = showAllCategories ? categoryRatios : categoryRatios.slice(0, maxVisibleCategories);
  const hasMoreCategories = categoryRatios.length > maxVisibleCategories;

  // 월별 카테고리 사용량 데이터 처리
  const processMonthlyData = (data: MonthlyConsumedLogResponseDto[]) => {
    const monthlyMap = new Map<string, Map<string, number>>();
    
    data.forEach(item => {
      const monthKey = `${item.month}월`;
      const categoryName = item.categoryName || '기타';
      const quantity = item.totalConsumedQuantity || 0;
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, new Map());
      }
      
      const monthData = monthlyMap.get(monthKey)!;
      if (monthData.has(categoryName)) {
        monthData.set(categoryName, monthData.get(categoryName)! + quantity);
      } else {
        monthData.set(categoryName, quantity);
      }
    });
    
    return monthlyMap;
  };

  const monthlyChartData = processMonthlyData(monthlyData);
  const months = Array.from(monthlyChartData.keys()).sort((a, b) => {
    const monthA = parseInt(a.replace('월', ''));
    const monthB = parseInt(b.replace('월', ''));
    return monthA - monthB;
  });
  
  // 모든 카테고리 수집
  const allCategories = new Set<string>();
  monthlyChartData.forEach(monthData => {
    monthData.forEach((_, category) => allCategories.add(category));
  });
  const categories = Array.from(allCategories);

  // 선택된 카테고리에 따른 차트 데이터 필터링
  const getFilteredChartData = () => {
    if (selectedCategory === '전체') {
      return monthlyChartData;
    }
    
    const filteredData = new Map<string, Map<string, number>>();
    monthlyChartData.forEach((monthData, month) => {
      const categoryData = monthData.get(selectedCategory);
      if (categoryData !== undefined) {
        const newMonthData = new Map<string, number>();
        newMonthData.set(selectedCategory, categoryData);
        filteredData.set(month, newMonthData);
      }
    });
    
    return filteredData;
  };

  const filteredChartData = getFilteredChartData();

  // 모든 월 (1월~12월) 생성
  const allMonths = Array.from({ length: 12 }, (_, index) => `${index + 1}월`);
  
  // 선택된 카테고리가 변경될 때마다 차트 업데이트
  const filteredMonths = allMonths; // 모든 월을 표시

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
    }] : []),
    // 사용량 관련 인사이트 추가
    ...(categoryRatios.length > 0 ? [{
      title: '주요 소비 카테고리',
      description: `${categoryRatios[0]?.label}이 전체 사용량의 ${categoryRatios[0]?.percentage}%를 차지합니다.`,
      icon: '📊',
      color: 'bg-green-50 border-green-200'
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    월별 카테고리 사용량
                    {selectedCategory !== '전체' && (
                      <span className="text-sm font-normal text-blue-600 ml-2">
                        ({selectedCategory})
                      </span>
                    )}
                  </h3>
                  {isLoading ? (
                    <div className="h-64 flex items-center justify-center">
                      <div className="text-gray-500">로딩 중...</div>
                    </div>
                  ) : monthlyData.length > 0 ? (
                    <>
                      <div className="mb-4">
                        {/* 기본 카테고리 필터 */}
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => {
                              setSelectedCategory('전체');
                              setShowAllCategoryFilters(false); // 카테고리 선택 시 패널 접기
                            }}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              selectedCategory === '전체'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                            }`}
                          >
                            전체
                          </button>
                          {categories.slice(0, 4).map((category, index) => (
                            <button
                              key={category}
                              onClick={() => {
                                setSelectedCategory(category);
                                setShowAllCategoryFilters(false); // 카테고리 선택 시 패널 접기
                              }}
                              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                selectedCategory === category
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                              }`}
                            >
                              {category}
                            </button>
                          ))}
                          {categories.length > 4 && (
                            <button 
                              onClick={() => setShowAllCategoryFilters(!showAllCategoryFilters)}
                              className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                            >
                              {showAllCategoryFilters ? (
                                <>
                                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                  </svg>
                                  접기
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                  +{categories.length - 4}개 더
                                </>
                              )}
                            </button>
                          )}
                        </div>
                        
                        {/* 확장된 카테고리 필터 */}
                        {showAllCategoryFilters && categories.length > 4 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex gap-2 flex-wrap">
                              {categories.slice(4).map((category, index) => (
                                <button
                                  key={category}
                                  onClick={() => {
                                    setSelectedCategory(category);
                                    setShowAllCategoryFilters(false); // 카테고리 선택 시 패널 접기
                                  }}
                                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                    selectedCategory === category
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                                  }`}
                                >
                                  {category}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="h-64">
                        <div className="h-full flex items-end justify-between gap-2">
                          {filteredMonths.map((month, monthIndex) => {
                            const monthData = filteredChartData.get(month);
                            const maxValue = Math.max(
                              ...Array.from(filteredChartData.values()).map(monthData => 
                                Array.from(monthData.values()).reduce((sum, val) => sum + val, 0)
                              )
                            );
                            
                            const totalForMonth = monthData ? 
                              Array.from(monthData.values()).reduce((sum, val) => sum + val, 0) : 0;
                            const height = maxValue > 0 ? (totalForMonth / maxValue) * 100 : 0;
                            
                            // 사용량이 없는 월도 최소 높이로 표시
                            const displayHeight = totalForMonth > 0 ? Math.max(height, 10) : 5;
                            
                            return (
                              <div key={month} className="flex-1 flex flex-col items-center group">
                                <div className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-sm relative mb-2">
                                  <div 
                                    className={`w-full rounded-t-sm transition-all duration-300 ${
                                      totalForMonth > 0 
                                        ? 'bg-gradient-to-t from-blue-500 to-blue-400' 
                                        : 'bg-gradient-to-t from-gray-300 to-gray-200'
                                    }`}
                                    style={{ height: `${displayHeight}px` }}
                                  ></div>
                                  {/* 툴팁 */}
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {totalForMonth > 0 ? `${totalForMonth.toLocaleString()}g` : '사용량 없음'}
                                  </div>
                                </div>
                                <span className="text-xs text-gray-600 font-medium">{month}</span>
                              </div>
                            );
                          })}
                        </div>
                        {filteredMonths.length === 0 && (
                          <div className="h-full flex items-center justify-center">
                            <div className="text-gray-500">월별 데이터를 불러올 수 없습니다</div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="h-64 flex items-center justify-center">
                      <div className="text-gray-500">데이터가 없습니다</div>
                    </div>
                  )}
                </div>

                {/* Category Ratio */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">카테고리별 비율</h3>
                  {isLoading ? (
                    <div className="h-80 flex items-center justify-center">
                      <div className="text-gray-500">로딩 중...</div>
                    </div>
                  ) : categoryRatios.length > 0 ? (
                    <div className="h-80 flex items-center gap-8">
                      {/* 도넛 차트 - 왼쪽 */}
                      <div className="flex-shrink-0">
                        <div className="relative w-56 h-56">
                          <svg className="w-56 h-56 transform -rotate-90" viewBox="0 0 100 100">
                            {categoryRatios.map((item, index) => {
                              const startAngle = categoryRatios.slice(0, index).reduce((sum, prev) => sum + (prev.percentage * 3.6), 0);
                              const endAngle = startAngle + (item.percentage * 3.6);
                              const largeArcFlag = item.percentage > 50 ? 1 : 0;
                              
                              const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                              const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                              const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
                              const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
                              
                              const pathData = [
                                `M 50 50`,
                                `L ${x1} ${y1}`,
                                `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                                'Z'
                              ].join(' ');
                              
                              return (
                                <path
                                  key={index}
                                  d={pathData}
                                  fill={`url(#gradient-${index})`}
                                  stroke="white"
                                  strokeWidth="2"
                                />
                              );
                            })}
                            <defs>
                              {categoryRatios.map((item, index) => (
                                <linearGradient key={index} id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor={item.color.hex} />
                                  <stop offset="100%" stopColor={item.color.hex} />
                                </linearGradient>
                              ))}
                            </defs>
                            <circle cx="50" cy="50" r="20" fill="white" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* 카테고리 비율 목록 - 오른쪽 */}
                      <div className="flex-1 min-w-0 h-full flex flex-col">
                        <div className="flex-1 overflow-y-auto">
                          <div className="space-y-3">
                            {visibleCategories.map((item, index) => (
                              <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                <div 
                                  className="w-4 h-4 rounded-full flex-shrink-0" 
                                  style={{ backgroundColor: item.color.hex }}
                                ></div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-900 truncate">{item.label}</span>
                                    <span className="text-sm font-bold text-gray-900 ml-2">{item.percentage}%</span>
                                  </div>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-xs text-gray-500">수량: {item.quantity.toLocaleString()}g</span>
                                  <div className="w-16 bg-gray-200 rounded-full h-1.5 ml-2">
                                    <div 
                                      className="h-1.5 rounded-full transition-all duration-300"
                                      style={{ 
                                        width: `${item.percentage}%`,
                                        backgroundColor: item.color.hex
                                      }}
                                    ></div>
                                  </div>
                                </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* 더보기/접기 버튼 */}
                        {hasMoreCategories && (
                          <div className="mt-4 pt-3 border-t border-gray-200">
                            <button
                              onClick={() => setShowAllCategories(!showAllCategories)}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              {showAllCategories ? (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                  </svg>
                                  접기
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                  더보기 ({categoryRatios.length - maxVisibleCategories}개 더)
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="h-80 flex items-center justify-center">
                      <div className="text-gray-500">데이터가 없습니다</div>
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

            {/* Top Ingredients Card */}
            <SectionCard title="자주 사용하는 식재료" variant="statistics">
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
            </SectionCard>
          </div>
        </div>
      </div>
    </UserGuard>
  );
}
