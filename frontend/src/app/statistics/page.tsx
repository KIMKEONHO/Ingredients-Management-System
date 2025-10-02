'use client';

import { useState, useEffect, useMemo } from 'react';
import { COLOR_PRESETS } from '@/lib/constants/colors';
import PageHeader from '../components/ui/PageHeader';
import SectionCard from '../components/ui/SectionCard';
import { DietService, DietStatisticsResponseDto, NewWeekStatisticsResponseDto } from '@/lib/api/services/dietService';
import { ConsumedService, ConsumedLogResponseDto, MonthlyConsumedLogResponseDto } from '@/lib/api/services/consumedService';
import { UserGuard } from '@/lib/auth/authGuard';

export default function StatisticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('이번 달');
  const [monthStats, setMonthStats] = useState<DietStatisticsResponseDto | null>(null);
  const [weekStats, setWeekStats] = useState<DietStatisticsResponseDto | null>(null);
  const [weekGraphStats, setWeekGraphStats] = useState<NewWeekStatisticsResponseDto[]>([]);
  const [quarterStats, setQuarterStats] = useState<DietStatisticsResponseDto | null>(null);
  const [yearStats, setYearStats] = useState<DietStatisticsResponseDto | null>(null);
  const [consumedData, setConsumedData] = useState<ConsumedLogResponseDto[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyConsumedLogResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false); // 중복 로드 방지
  const [retryCount, setRetryCount] = useState(0); // 재시도 횟수
  const [showAllCategories, setShowAllCategories] = useState(false); // 카테고리 더보기 상태
  const [selectedCategory, setSelectedCategory] = useState<string>('전체'); // 선택된 카테고리
  const [showAllCategoryFilters, setShowAllCategoryFilters] = useState(false); // 카테고리 필터 패널 확장 상태

  // 기간이 변경될 때마다 로드 상태 초기화
  useEffect(() => {
    setHasLoaded(false);
    setRetryCount(0);
  }, [selectedPeriod]);

  const timePeriods = ['이번 주', '이번 달', '지난 3개월', '올해'];

  // 칼로리 통계 헬퍼 함수들
  const getCalorieTitle = () => {
    switch (selectedPeriod) {
      case '이번 주': return '이번 주 평균 칼로리';
      case '이번 달': return '이번 달 평균 칼로리';
      case '지난 3개월': return '3개월 평균 칼로리';
      case '올해': return '올해 평균 칼로리';
      default: return '평균 칼로리';
    }
  };

  const getCalorieValue = () => {
    if (isLoading) return '로딩 중...';

    switch (selectedPeriod) {
      case '이번 주':
        return weekStats ? `${Math.round(weekStats.averageKcal)}kcal` : '데이터 없음';
      case '이번 달':
        return monthStats ? `${Math.round(monthStats.averageKcal)}kcal` : '데이터 없음';
      case '지난 3개월':
        return quarterStats ? `${Math.round(quarterStats.averageKcal)}kcal` : '데이터 없음';
      case '올해':
        return yearStats ? `${Math.round(yearStats.averageKcal)}kcal` : '데이터 없음';
      default:
        return monthStats ? `${Math.round(monthStats.averageKcal)}kcal` : '데이터 없음';
    }
  };

  const getCalorieTrend = () => {
    switch (selectedPeriod) {
      case '이번 주':
        if (weekStats && weekStats.diffRate) {
          return `${weekStats.diffRate > 0 ? '+' : ''}${Math.round(weekStats.diffRate)}% ${weekStats.diffRate > 0 ? '증가' : '감소'}`;
        }
        return '변화 없음';
      case '이번 달':
        if (monthStats && monthStats.diffRate) {
          return `${monthStats.diffRate > 0 ? '+' : ''}${Math.round(monthStats.diffRate)}% ${monthStats.diffRate > 0 ? '증가' : '감소'}`;
        }
        return '변화 없음';
      case '지난 3개월':
        if (quarterStats && quarterStats.diffRate) {
          return `${quarterStats.diffRate > 0 ? '+' : ''}${Math.round(quarterStats.diffRate)}% ${quarterStats.diffRate > 0 ? '증가' : '감소'}`;
        }
        return '변화 없음';
      case '올해':
        if (yearStats && yearStats.diffRate) {
          return `${yearStats.diffRate > 0 ? '+' : ''}${Math.round(yearStats.diffRate)}% ${yearStats.diffRate > 0 ? '증가' : '감소'}`;
        }
        return '변화 없음';
      default:
        return '변화 없음';
    }
  };

  const getCalorieTrendColor = () => {
    switch (selectedPeriod) {
      case '이번 주':
        if (weekStats && weekStats.diffRate) {
          return weekStats.diffRate > 0 ? 'text-red-600' : 'text-green-600';
        }
        return 'text-gray-600';
      case '이번 달':
        if (monthStats && monthStats.diffRate) {
          return monthStats.diffRate > 0 ? 'text-red-600' : 'text-green-600';
        }
        return 'text-gray-600';
      case '지난 3개월':
        if (quarterStats && quarterStats.diffRate) {
          return quarterStats.diffRate > 0 ? 'text-red-600' : 'text-green-600';
        }
        return 'text-gray-600';
      case '올해':
        if (yearStats && yearStats.diffRate) {
          return yearStats.diffRate > 0 ? 'text-red-600' : 'text-green-600';
        }
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getChangeValue = () => {
    switch (selectedPeriod) {
      case '이번 주':
        if (weekStats && weekStats.diffFromLast !== null) {
          return (
            <p className={`text-2xl font-bold ${
              weekStats.diffFromLast > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {weekStats.diffFromLast > 0 ? '+' : ''}{Math.round(weekStats.diffFromLast)}kcal
            </p>
          );
        }
        return <p className="text-lg text-gray-500">변화 없음</p>;
      case '이번 달':
        if (monthStats && monthStats.diffFromLast !== null) {
          return (
            <p className={`text-2xl font-bold ${
              monthStats.diffFromLast > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {monthStats.diffFromLast > 0 ? '+' : ''}{Math.round(monthStats.diffFromLast)}kcal
            </p>
          );
        }
        return <p className="text-lg text-gray-500">변화 없음</p>;
      case '지난 3개월':
        if (quarterStats && quarterStats.diffFromLast !== null) {
          return (
            <p className={`text-2xl font-bold ${
              quarterStats.diffFromLast > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {quarterStats.diffFromLast > 0 ? '+' : ''}{Math.round(quarterStats.diffFromLast)}kcal
            </p>
          );
        }
        return <p className="text-lg text-gray-500">변화 없음</p>;
      case '올해':
        if (yearStats && yearStats.diffFromLast !== null) {
          return (
            <p className={`text-2xl font-bold ${
              yearStats.diffFromLast > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {yearStats.diffFromLast > 0 ? '+' : ''}{Math.round(yearStats.diffFromLast)}kcal
            </p>
          );
        }
        return <p className="text-lg text-gray-500">변화 없음</p>;
      default:
        return <p className="text-lg text-gray-500">변화 없음</p>;
    }
  };

  // 주간 차트 전용 함수
  const getWeekChartData = () => {
    console.log('[DEBUG] getWeekChartData - weekGraphStats:', weekGraphStats);

    // 임시 더미 데이터 (API가 작동하지 않을 경우를 위한 테스트)
    const testData = weekGraphStats.length > 0 ? weekGraphStats : [
      { date: '2024-01-15', averageKcal: 1800 },
      { date: '2024-01-16', averageKcal: 2200 },
      { date: '2024-01-17', averageKcal: 1600 },
      { date: '2024-01-18', averageKcal: 2400 },
      { date: '2024-01-19', averageKcal: 2000 },
      { date: '2024-01-20', averageKcal: 1900 },
      { date: '2024-01-21', averageKcal: 2100 }
    ];

    if (testData && testData.length > 0) {
      const maxKcal = Math.max(...testData.map(s => s.averageKcal));
      const minKcal = Math.min(...testData.map(s => s.averageKcal));

      return (
        <div className="w-full h-48 flex items-end justify-between gap-2 px-2">
          {testData.map((stat, index) => {
            const date = new Date(stat.date);
            const dayName = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
            const height = maxKcal > 0 ? Math.max((stat.averageKcal / maxKcal) * 100, 10) : 10;

            return (
              <div key={index} className="flex-1 flex flex-col items-center group">
                {/* 막대 */}
                <div
                  className="w-full bg-gradient-to-t from-orange-400 via-orange-500 to-red-500 rounded-t-lg relative group/bar transition-all duration-500 hover:from-orange-300 hover:via-orange-400 hover:to-red-400 shadow-md hover:shadow-lg"
                  style={{ height: `${height}px` }}
                >
                  {/* 호버 시 표시되는 툴팁 */}
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {Math.round(stat.averageKcal)}kcal
                  </div>

                  {/* 막대 상단에 값 표시 */}
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 opacity-0 group-hover/bar:opacity-100 transition-opacity">
                    {Math.round(stat.averageKcal)}
                  </div>
                </div>

                {/* 요일 표시 */}
                <div className="mt-2 text-center">
                  <div className="text-sm font-medium text-gray-700">{dayName}</div>
                  <div className="text-xs text-gray-500">{date.getMonth() + 1}/{date.getDate()}</div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    return <div className="h-48 flex items-center justify-center w-full"><div className="text-gray-500">주간 그래프 데이터가 없습니다</div></div>;
  };

  const getChartData = () => {
    switch (selectedPeriod) {
      case '지난 3개월':
        // 3개월 통계는 단일 값이므로 간단한 표시
        if (quarterStats) {
          return (
            <div className="h-48 flex items-center justify-center w-full">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {Math.round(quarterStats.averageKcal)}kcal
                </div>
                <div className="text-gray-600">3개월 평균</div>
              </div>
            </div>
          );
        }
        return <div className="h-48 flex items-center justify-center w-full"><div className="text-gray-500">데이터가 없습니다</div></div>;

      case '올해':
        // 연간 통계는 단일 값이므로 간단한 표시
        if (yearStats) {
          return (
            <div className="h-48 flex items-center justify-center w-full">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {Math.round(yearStats.averageKcal)}kcal
                </div>
                <div className="text-gray-600">연간 평균</div>
              </div>
            </div>
          );
        }
        return <div className="h-48 flex items-center justify-center w-full"><div className="text-gray-500">데이터가 없습니다</div></div>;

      default:
        return <div className="h-48 flex items-center justify-center w-full"><div className="text-gray-500">데이터가 없습니다</div></div>;
    }
  };

  // 주간 차트 요약 전용 함수
  const getWeekChartSummary = () => {
    if (weekGraphStats.length > 0) {
      const maxKcal = Math.max(...weekGraphStats.map(s => s.averageKcal));
      const minKcal = Math.min(...weekGraphStats.map(s => s.averageKcal));
      const avgKcal = weekGraphStats.reduce((sum, stat) => sum + stat.averageKcal, 0) / weekGraphStats.length;

      return (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <div className="text-sm text-gray-600 mb-1">주간 평균</div>
            <div className="text-lg font-bold text-orange-600">
              {Math.round(avgKcal)}kcal
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="text-sm text-gray-600 mb-1">최고 섭취량</div>
            <div className="text-lg font-bold text-blue-600">
              {Math.round(maxKcal)}kcal
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="text-sm text-gray-600 mb-1">최저 섭취량</div>
            <div className="text-lg font-bold text-green-600">
              {Math.round(minKcal)}kcal
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const getChartSummary = () => {
    switch (selectedPeriod) {
      case '지난 3개월':
        if (quarterStats) {
          return (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                3개월 평균: <span className="font-semibold text-blue-600">
                  {Math.round(quarterStats.averageKcal)}kcal
                </span>
              </p>
            </div>
          );
        }
        return null;

      case '올해':
        if (yearStats) {
          return (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                연간 평균: <span className="font-semibold text-green-600">
                  {Math.round(yearStats.averageKcal)}kcal
                </span>
              </p>
            </div>
          );
        }
        return null;

      default:
        return null;
    }
  };

  // 페이지 로드 시 주간 그래프 데이터 로드 (항상 고정)
  useEffect(() => {
    const loadWeekGraphData = async () => {
      try {
        // 인증 토큰이 준비될 때까지 대기
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('[DEBUG] 주간 그래프 데이터 로드 시작');
        const weekGraphData = await DietService.getWeekGraphStatistics();
        setWeekGraphStats(weekGraphData);
        console.log('[DEBUG] 주간 그래프 데이터 로드 성공:', weekGraphData);
      } catch (error) {
        console.error('주간 그래프 데이터 로드 실패:', error);
        // 인증 오류인 경우 재시도하지 않음
        if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
          console.log('[DEBUG] 인증 오류로 인한 주간 그래프 데이터 로드 실패, 재시도하지 않음');
          return;
        }
      }
    };

    loadWeekGraphData();
  }, []); // 페이지 로드 시 한 번만 실행

  // 선택된 기간에 따른 통계 데이터 로드
  useEffect(() => {
    const loadDietStatistics = async () => {
      try {
        setIsLoading(true);
        
        // 인증 토큰이 준비될 때까지 대기
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('[DEBUG] 식단 통계 로드 시작, 선택된 기간:', selectedPeriod);
        
        // 선택된 기간에 따라 다른 데이터 로드
        switch (selectedPeriod) {
          case '이번 주':
            const weekData = await DietService.getWeekStatistics();
            setWeekStats(weekData);
            console.log('[DEBUG] 주간 통계 로드 성공:', weekData);
            break;
          case '이번 달':
            const monthData = await DietService.getMonthStatistics();
            setMonthStats(monthData);
            console.log('[DEBUG] 월간 통계 로드 성공:', monthData);
            break;
          case '지난 3개월':
            const quarterData = await DietService.getQuarterStatistics();
            setQuarterStats(quarterData);
            console.log('[DEBUG] 3개월 통계 로드 성공:', quarterData);
            break;
          case '올해':
            const yearData = await DietService.getYearStatistics();
            setYearStats(yearData);
            console.log('[DEBUG] 연간 통계 로드 성공:', yearData);
            break;
          default:
            const defaultMonthData = await DietService.getMonthStatistics();
            setMonthStats(defaultMonthData);
            console.log('[DEBUG] 기본 월간 통계 로드 성공:', defaultMonthData);
        }
        setHasLoaded(true); // 로드 완료 표시
      } catch (error) {
        console.error('식단 통계 로드 실패:', error);
        
        // 인증 오류인 경우 재시도하지 않음
        if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
          console.log('[DEBUG] 인증 오류로 인한 식단 통계 로드 실패, 재시도하지 않음');
          setIsLoading(false);
          return;
        }
        
        // 재시도 횟수가 2회 미만일 때만 재시도
        if (retryCount < 2) {
          console.log('[DEBUG] 재시도 시작, 1초 후 실행...');
          setRetryCount(prev => prev + 1);
          
          setTimeout(async () => {
            try {
              console.log('[DEBUG] 재시도 실행 중...');
              
              // 선택된 기간에 따라 재시도
              switch (selectedPeriod) {
                case '이번 주':
                  const weekData = await DietService.getWeekStatistics();
                  setWeekStats(weekData);
                  break;
                case '이번 달':
                  const monthData = await DietService.getMonthStatistics();
                  setMonthStats(monthData);
                  break;
                case '지난 3개월':
                  const quarterData = await DietService.getQuarterStatistics();
                  setQuarterStats(quarterData);
                  break;
                case '올해':
                  const yearData = await DietService.getYearStatistics();
                  setYearStats(yearData);
                  break;
                default:
                  const defaultMonthData = await DietService.getMonthStatistics();
                  setMonthStats(defaultMonthData);
              }

              console.log('[DEBUG] 재시도 성공');
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
  }, [selectedPeriod, retryCount]); // selectedPeriod를 의존성으로 추가

  // 선택된 기간에 따른 사용량 데이터 로드
  useEffect(() => {
    const loadConsumedData = async () => {
      try {
        setIsLoading(true);
        
        // 인증 토큰이 준비될 때까지 대기
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('[DEBUG] 사용량 데이터 로드 시작, 기간:', selectedPeriod);

        const data = await ConsumedService.getConsumedLogByPeriod(selectedPeriod);
        console.log('[DEBUG] 사용량 데이터 로드 성공:', data);

        setConsumedData(data);
      } catch (error) {
        console.error('사용량 데이터 로드 실패:', error);
        // 인증 오류인 경우 재시도하지 않음
        if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
          console.log('[DEBUG] 인증 오류로 인한 사용량 데이터 로드 실패, 재시도하지 않음');
          return;
        }
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
        // 인증 토큰이 준비될 때까지 대기
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('[DEBUG] 월별 사용량 데이터 로드 시작');
        const data = await ConsumedService.getMonthlyConsumedLog();
        console.log('[DEBUG] 월별 사용량 데이터 로드 성공:', data);
        setMonthlyData(data);
      } catch (error) {
        console.error('월별 사용량 데이터 로드 실패:', error);
        // 인증 오류인 경우 재시도하지 않음
        if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
          console.log('[DEBUG] 인증 오류로 인한 월별 사용량 데이터 로드 실패, 재시도하지 않음');
          return;
        }
        setMonthlyData([]);
      }
    };

    loadMonthlyData();
  }, []);

  // 총 사용량 계산 함수
  const getTotalUsage = () => {
    if (!consumedData || consumedData.length === 0) return '0g';
    const total = consumedData.reduce((sum, item) => sum + (item.totalConsumedQuantity || 0), 0);
    return `${total.toLocaleString()}g`;
  };

  // 제일 많이 사용된 식재료 이름들 반환 (동일한 사용량인 경우 모두 포함)
  const getTopIngredientName = () => {
    if (!consumedData || consumedData.length === 0) return '데이터 없음';
    
    // 식재료별 사용량 집계
    const ingredientMap = new Map<string, { 
      name: string; 
      category: string; 
      totalQuantity: number; 
      usageCount: number;
    }>();

    consumedData.forEach((item) => {
      const ingredientName = item.ingredientName || '알 수 없는 식재료';
      const categoryName = item.categoryName || '기타';
      const quantity = item.totalConsumedQuantity || 0;

      if (!ingredientName || ingredientName.trim() === '' || ingredientName === '알 수 없는 식재료') {
        return;
      }

      if (ingredientMap.has(ingredientName)) {
        const existing = ingredientMap.get(ingredientName)!;
        existing.totalQuantity += quantity;
        existing.usageCount += 1;
      } else {
        ingredientMap.set(ingredientName, {
          name: ingredientName,
          category: categoryName,
          totalQuantity: quantity,
          usageCount: 1
        });
      }
    });

    // 사용량 기준으로 정렬
    const sortedIngredients = Array.from(ingredientMap.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity);

    if (sortedIngredients.length === 0) return '데이터 없음';
    
    // 1위 사용량과 동일한 모든 식재료 찾기
    const topQuantity = sortedIngredients[0].totalQuantity;
    const topIngredients = sortedIngredients.filter(ingredient => ingredient.totalQuantity === topQuantity);
    
    // 최대 3개까지만 표시
    const displayIngredients = topIngredients.slice(0, 3);
    
    if (displayIngredients.length === 1) {
      return displayIngredients[0].name;
    } else {
      return `${displayIngredients.length}가지`;
    }
  };

  // 제일 많이 사용된 식재료들의 통계 데이터 반환 (공동 1위 포함)
  const getTopIngredientData = () => {
    if (!consumedData || consumedData.length === 0) return null;
    
    // 식재료별 사용량 집계
    const ingredientMap = new Map<string, { 
      name: string; 
      category: string; 
      totalQuantity: number; 
      usageCount: number;
    }>();

    consumedData.forEach((item) => {
      const ingredientName = item.ingredientName || '알 수 없는 식재료';
      const categoryName = item.categoryName || '기타';
      const quantity = item.totalConsumedQuantity || 0;

      if (!ingredientName || ingredientName.trim() === '' || ingredientName === '알 수 없는 식재료') {
        return;
      }

      if (ingredientMap.has(ingredientName)) {
        const existing = ingredientMap.get(ingredientName)!;
        existing.totalQuantity += quantity;
        existing.usageCount += 1;
      } else {
        ingredientMap.set(ingredientName, {
          name: ingredientName,
          category: categoryName,
          totalQuantity: quantity,
          usageCount: 1
        });
      }
    });

    // 사용량 기준으로 정렬
    const sortedIngredients = Array.from(ingredientMap.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity);

    if (sortedIngredients.length === 0) return null;
    
    // 1위 사용량과 동일한 모든 식재료 찾기
    const topQuantity = sortedIngredients[0].totalQuantity;
    const topIngredients = sortedIngredients.filter(ingredient => ingredient.totalQuantity === topQuantity);
    
    // 공동 1위들의 통계 합계 계산
    const totalUsageCount = topIngredients.reduce((sum, ingredient) => sum + ingredient.usageCount, 0);
    const totalQuantity = topIngredients[0].totalQuantity; // 모든 공동 1위는 동일한 사용량
    
    return {
      totalUsageCount,
      totalQuantity,
      topIngredients
    };
  };

  // 일평균 사용량 계산
  const getDailyAverageUsage = () => {
    if (!consumedData || consumedData.length === 0) return '0g';
    
    // 선택된 기간에 따른 일수 계산
    let days = 1;
    switch (selectedPeriod) {
      case '이번 주':
        days = 7;
        break;
      case '이번 달':
        days = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
        break;
      case '지난 3개월':
        days = 90;
        break;
      case '올해':
        const currentYear = new Date().getFullYear();
        days = new Date(currentYear, 11, 31).getTime() - new Date(currentYear, 0, 1).getTime();
        days = Math.ceil(days / (1000 * 60 * 60 * 24)) + 1; // 올해 1월 1일부터 오늘까지의 일수
        break;
    }
    
    const total = consumedData.reduce((sum, item) => sum + (item.totalConsumedQuantity || 0), 0);
    const dailyAverage = Math.round(total / days);
    return `${dailyAverage.toLocaleString()}g`;
  };

  const summaryStats: Array<{
    title: string;
    value: string;
    trend: string;
    trendColor: string;
    icon: React.ReactNode;
    customContent?: React.ReactNode;
  }> = [
    {
      title: '식품 재고 총 사용량',
      value: getTotalUsage(),
      trend: selectedPeriod + ' 기준',
      trendColor: 'text-green-600',
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042h1.096a1 1 0 00.01-.042L6.34 3H10a1 1 0 00.01-.042L10.34 1H3zM13 2.5a.5.5 0 00-.5-.5h-1a.5.5 0 00-.5.5v1a.5.5 0 00.5.5h1a.5.5 0 00.5-.5v-1z"/>
          <path d="M9.5 1H2V2h5.5V1zM1 4v10a1 1 0 001 1h12a1 1 0 001-1V4H1zm0 1h12v8H1V5z"/>
        </svg>
      )
    },
    {
      title: '제일 많이 사용된 식재료',
      value: getTopIngredientName(),
      trend: '사용량 기준 1위',
      trendColor: 'text-blue-600',
      icon: (
        <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
        </svg>
      )
    },
    {
      title: getCalorieTitle(),
      value: getCalorieValue(),
      trend: getCalorieTrend(),
      trendColor: getCalorieTrendColor(),
      icon: (
        <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
        </svg>
      )
    },
    {
      title: '일평균 식품 재고 사용량',
      value: getDailyAverageUsage(),
      trend: selectedPeriod + ' 평균',
      trendColor: 'text-blue-600',
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3-3a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1z" clipRule="evenodd"/>
        </svg>
      )
    }
  ];

  // 식재료 아이콘 매핑 함수
  const getIngredientIcon = (ingredientName: string): string => {
    const iconMap: { [key: string]: string } = {
      '양파': '🧅', '닭고기': '🍗', '우유': '🥛', '쌀': '🍚', '토마토': '🍅', '계란': '🥚',
      '돼지고기': '🥩', '소고기': '🥩', '생선': '🐟', '새우': '🦐', '치즈': '🧀', '버터': '🧈',
      '당근': '🥕', '감자': '🥔', '고구마': '🍠', '배추': '🥬', '시금치': '🥬', '상추': '🥬',
      '오이': '🥒', '파': '🧄', '마늘': '🧄', '고추': '🌶️', '피망': '🫑', '브로콜리': '🥦',
      '양배추': '🥬', '무': '🥕', '배': '🍐', '사과': '🍎', '바나나': '🍌', '오렌지': '🍊',
      '레몬': '🍋', '딸기': '🍓', '포도': '🍇', '복숭아': '🍑', '수박': '🍉', '참외': '🍈',
      '키위': '🥝', '파인애플': '🍍', '망고': '🥭', '아보카도': '🥑', '빵': '🍞', '라면': '🍜',
      '국수': '🍜', '파스타': '🍝', '밥': '🍚', '떡': '🍡', '과자': '🍪', '사탕': '🍬',
      '초콜릿': '🍫', '아이스크림': '🍦', '케이크': '🍰', '쿠키': '🍪', '도넛': '🍩', '와플': '🧇',
      '팬케이크': '🥞', '토스트': '🍞', '샌드위치': '🥪', '햄버거': '🍔', '피자': '🍕', '타코': '🌮',
      '부리토': '🌯', '샐러드': '🥗', '스시': '🍣', '김밥': '🍙', '초밥': '🍣', '라멘': '🍜',
      '우동': '🍜', '된장국': '🍲', '김치찌개': '🍲', '부대찌개': '🍲', '순두부찌개': '🍲',
      '된장찌개': '🍲', '미역국': '🍲', '시래기국': '🍲', '콩나물국': '🍲', '계란국': '🍲',
      '닭볶음탕': '🍲', '갈비탕': '🍲', '설렁탕': '🍲', '삼계탕': '🍲', '보신탕': '🍲',
      '감자탕': '🍲', '추어탕': '🍲', '해물탕': '🍲', '매운탕': '🍲', '알탕': '🍲', '곰탕': '🍲',
      '육개장': '🍲', '청국장': '🍲', '비빔밥': '🍚', '김치볶음밥': '🍚', '볶음밥': '🍚',
      '주먹밥': '🍙', '떡볶이': '🍢', '순대': '🍢', '튀김': '🍤', '만두': '🥟', '교자': '🥟',
      '칼국수': '🍜', '냉면': '🍜', '비빔냉면': '🍜', '물냉면': '🍜', '밀면': '🍜', '막국수': '🍜',
      '콩국수': '🍜', '잔치국수': '🍜', '비빔국수': '🍜', '냉국수': '🍜', '메밀국수': '🍜',
      '소바': '🍜', '짬뽕': '🍜', '짜장면': '🍜', '탕수육': '🍖', '깐풍기': '🍖', '라조기': '🍖',
      '고추잡채': '🍖', '동파육': '🍖', '꿔바로우': '🍖', '마파두부': '🍲', '궁보계정': '🍖',
      '팔보채': '🍖', '양장피': '🍖', '해물찜': '🍲', '깐쇼새우': '🍤', '새우볶음': '🍤',
      '게살볶음': '🦀', '홍게찜': '🦀', '대게찜': '🦀', '킹크랩': '🦀', '랍스터': '🦞',
      '전복': '🐚', '소라': '🐚', '홍합': '🐚', '굴': '🐚', '바지락': '🐚', '조개': '🐚',
      '문어': '🐙', '오징어': '🦑', '낙지': '🐙', '쭈꾸미': '🦑', '해삼': '🦑', '멍게': '🦑',
      '성게': '🦑', '미역': '🌿', '다시마': '🌿', '김': '🌿', '파래': '🌿', '청각': '🌿',
      '톳': '🌿', '모자반': '🌿'
    };

    // 정확한 매칭 시도
    if (iconMap[ingredientName]) {
      return iconMap[ingredientName];
    }

    // 부분 매칭 시도
    for (const [key, icon] of Object.entries(iconMap)) {
      if (ingredientName.includes(key) || key.includes(ingredientName)) {
        return icon;
      }
    }

    // 기본 아이콘들
    const defaultIcons = ['🥕', '🥬', '🍖', '🐟', '🥛', '🍚', '🥔', '🌶️', '🧄', '🍅'];
    return defaultIcons[ingredientName.length % defaultIcons.length];
  };

  // 식재료별 사용량 계산 함수 (ingredientName 기준)
  const calculateTopIngredients = (data: ConsumedLogResponseDto[]) => {
    if (!data || data.length === 0) {
      return [];
    }

    // 식재료별 사용량 집계
    const ingredientMap = new Map<string, { 
      name: string; 
      category: string; 
      totalQuantity: number; 
      usageCount: number;
    }>();

    data.forEach((item) => {
      const ingredientName = item.ingredientName || '알 수 없는 식재료';
      const categoryName = item.categoryName || '기타';
      const quantity = item.totalConsumedQuantity || 0;

      // 유효하지 않은 식재료명은 건너뛰기
      if (!ingredientName || ingredientName.trim() === '' || ingredientName === '알 수 없는 식재료') {
        return;
      }

      if (ingredientMap.has(ingredientName)) {
        const existing = ingredientMap.get(ingredientName)!;
        existing.totalQuantity += quantity;
        existing.usageCount += 1;
      } else {
        ingredientMap.set(ingredientName, {
          name: ingredientName,
          category: categoryName,
          totalQuantity: quantity,
          usageCount: 1
        });
      }
    });

    // 사용량 기준으로 정렬하고 상위 6개 선택
    const sortedIngredients = Array.from(ingredientMap.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 6);

    // 공동 순위 처리
    const rankedIngredients = sortedIngredients.map((ingredient, index) => {
      // 현재 순위 계산 (같은 사용량의 식재료들은 같은 순위)
      let currentRank = index + 1;
      
      // 이전 순위의 식재료들과 사용량이 같은지 확인
      for (let i = index - 1; i >= 0; i--) {
        if (sortedIngredients[i].totalQuantity === ingredient.totalQuantity) {
          currentRank = i + 1; // 같은 순위로 설정
        } else {
          break;
        }
      }

      // 순위 텍스트 생성 (공동 순위 처리)
      let rankText: string;
      if (currentRank === 1) {
        rankText = '🥇 1위';
      } else if (currentRank === 2) {
        rankText = '🥈 2위';
      } else if (currentRank === 3) {
        rankText = '🥉 3위';
      } else {
        rankText = `${currentRank}위`;
      }

      // 공동 순위인 경우 표시 추가
      const isTied = sortedIngredients.filter((_, i) => 
        sortedIngredients[i].totalQuantity === ingredient.totalQuantity
      ).length > 1;
      
      if (isTied) {
        rankText += ' (공동)';
      }

      return {
        name: ingredient.name,
        category: ingredient.category,
        usage: `${ingredient.usageCount}회`,
        totalQuantity: `${ingredient.totalQuantity.toLocaleString()}g`,
        avgQuantity: `${Math.round(ingredient.totalQuantity / ingredient.usageCount).toLocaleString()}g`,
        icon: getIngredientIcon(ingredient.name),
        rank: currentRank,
        rankText: rankText,
        isTied: isTied
      };
    });

    return rankedIngredients;
  };

  // 현재 선택된 기간의 식재료 데이터 계산
  const topIngredients = useMemo(() => {
    // 실제 데이터가 없을 때는 빈 배열 반환
    if (!consumedData || consumedData.length === 0) {
      return [];
    }
    
    return calculateTopIngredients(consumedData);
  }, [consumedData]);

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
    ...(weekStats ? [{
      title: '주간 칼로리 패턴',
      description: `이번 주 평균 ${Math.round(weekStats.averageKcal)}kcal를 섭취하고 있습니다.`,
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
                    
                    {/* 2번째 탭(제일 많이 사용된 식재료)만 특별한 레이아웃 적용 */}
                    {index === 1 ? (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                          {(() => {
                            const topData = getTopIngredientData();
                            if (!topData) return null;
                            
                            return (
                              <div className="flex gap-2">
                                <div className="bg-blue-50 rounded-lg px-2 py-1 text-center">
                                  <div className="text-sm font-bold text-blue-600">{topData.totalUsageCount}회</div>
                                </div>
                                <div className="bg-orange-50 rounded-lg px-2 py-1 text-center">
                                  <div className="text-sm font-bold text-orange-600">{topData.totalQuantity.toLocaleString()}g</div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                        
                        {/* 공동 1위가 2개 이상일 때만 더보기 버튼 표시 */}
                        {(() => {
                          const topData = getTopIngredientData();
                          if (!topData || topData.topIngredients.length <= 1) return null;
                          
                          return (
                            <div className="relative">
                              <details className="group">
                                <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 list-none">
                                  <span>더보기</span>
                                  <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </summary>
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto w-96">
                                  <div className="text-xs text-gray-600 mb-3 font-medium">공동 1위 식재료 상세정보</div>
                                  <div className="space-y-3">
                                    {topData.topIngredients.map((ingredient, idx) => (
                                      <div key={idx} className="flex items-center justify-between text-sm p-3 hover:bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3 flex-1">
                                          <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                                            {idx + 1}
                                          </span>
                                          <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{ingredient.name}</span>
                                            <span className="text-xs text-gray-500">{ingredient.category}</span>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs">
                                          <span className="text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">{ingredient.usageCount}회</span>
                                          <span className="text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded">{ingredient.totalQuantity.toLocaleString()}g</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </details>
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    )}
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
                          {categories.slice(0, 4).map((category) => (
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
                              {categories.slice(4).map((category) => (
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
                          {filteredMonths.map((month) => {
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

            {/* Period-based Diet Statistics Card */}
            <SectionCard title={`${selectedPeriod} 식단 통계`} variant="statistics">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                {isLoading ? (
                  <div className="h-32 flex items-center justify-center">
                    <div className="text-gray-500">로딩 중...</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 평균 칼로리 */}
                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200">
                      <div className="text-2xl mb-2">🔥</div>
                      <h4 className="font-semibold text-gray-900 mb-2">{getCalorieTitle()}</h4>
                      <p className="text-2xl font-bold text-orange-600">
                        {getCalorieValue()}
                      </p>
                    </div>

                    {/* 변화량 */}
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                      <div className="text-2xl mb-2">📊</div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {selectedPeriod === '이번 주' ? '주간 패턴' :
                         selectedPeriod === '이번 달' ? '지난달 대비' :
                         selectedPeriod === '지난 3개월' ? '이전 분기 대비' :
                         selectedPeriod === '올해' ? '작년 대비' : '변화량'}
                      </h4>
                      {getChangeValue()}
                    </div>

                    {/* 변화율 */}
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-green-200">
                      <div className="text-2xl mb-2">📈</div>
                      <h4 className="font-semibold text-gray-900 mb-2">변화율</h4>
                      <p className={`text-2xl font-bold ${getCalorieTrendColor()}`}>
                        {getCalorieTrend()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* 주간 칼로리 추이 차트 (고정) */}
            <SectionCard title="주간 칼로리 추이" variant="statistics">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  최근 7일 칼로리 섭취량 (막대 그래프)
                </h3>
                <div>
                  {getWeekChartData()}
                </div>
                {getWeekChartSummary()}
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
            <SectionCard title={`${selectedPeriod} 자주 사용하는 식재료`} variant="statistics">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedPeriod} 식재료 사용량 순위
                      {topIngredients.length === 0 && ' (데이터 없음)'}
                    </h3>
                    <div className="text-sm text-gray-500 mt-1">
                      총 사용량 기준 (ingredientName별) • 상위 {topIngredients.length}개
                    </div>
                  </div>
                  {topIngredients.length > 0 && (
                    <div className="text-right">
                      <div className="text-xs text-gray-500">1위 식재료</div>
                      <div className="text-sm font-bold text-yellow-600">
                        {topIngredients[0]?.name} ({topIngredients[0]?.totalQuantity})
                      </div>
                    </div>
                  )}
                </div>
                
                {isLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-gray-500">로딩 중...</div>
                  </div>
                ) : topIngredients.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {topIngredients.map((ingredient, index) => (
                      <div key={index} className={`border rounded-lg p-4 hover:shadow-md transition-all duration-300 bg-white hover:border-opacity-80 ${
                        ingredient.isTied ? 'border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-md ring-2 ring-purple-200 ring-opacity-30' :
                        ingredient.rank === 1 ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg' :
                        ingredient.rank === 2 ? 'border-gray-300 bg-gradient-to-br from-gray-50 to-slate-50 shadow-md' :
                        ingredient.rank === 3 ? 'border-orange-300 bg-gradient-to-br from-orange-50 to-red-50 shadow-md' :
                        'border-blue-200 hover:border-blue-300'
                      }`}>
                        {/* 순위 헤더 */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{ingredient.icon}</span>
                            <div className="flex flex-col items-center">
                              <div className={`flex items-center justify-center w-10 h-10 text-lg font-bold rounded-full ${
                                ingredient.rank === 1 ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300' :
                                ingredient.rank === 2 ? 'bg-gray-100 text-gray-800 border-2 border-gray-300' :
                                ingredient.rank === 3 ? 'bg-orange-100 text-orange-800 border-2 border-orange-300' :
                                'bg-blue-100 text-blue-800 border-2 border-blue-300'
                              } ${ingredient.isTied ? 'ring-2 ring-purple-300 ring-opacity-50' : ''}`}>
                                {ingredient.rank}
                              </div>
                              <div className={`text-xs font-medium mt-1 ${ingredient.isTied ? 'text-purple-600' : ''}`}>
                                {ingredient.rankText}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500">총 사용량</div>
                            <div className="text-lg font-bold text-green-600">{ingredient.totalQuantity}</div>
                          </div>
                        </div>

                        {/* 식재료 정보 */}
                        <div className="mb-3">
                          <h4 className="font-semibold text-gray-900 text-lg truncate mb-1">{ingredient.name}</h4>
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{ingredient.category}</span>
                        </div>

                        {/* 사용량 정보 */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="text-center p-2 bg-blue-50 rounded-lg">
                            <div className="text-gray-600 text-xs">사용 횟수</div>
                            <div className="font-bold text-blue-600">{ingredient.usage}</div>
                          </div>
                          <div className="text-center p-2 bg-orange-50 rounded-lg">
                            <div className="text-gray-600 text-xs">평균 사용량</div>
                            <div className="font-bold text-orange-600">{ingredient.avgQuantity}</div>
                          </div>
                        </div>
                        
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                    <div className="text-4xl mb-4">📊</div>
                    <div className="text-lg font-medium mb-2">데이터가 없습니다</div>
                    <div className="text-sm text-center">
                      {selectedPeriod} 동안 사용된 식재료 데이터가 없습니다.<br/>
                      다른 기간을 선택해보세요.
                    </div>
                  </div>
                )}

                
                {/* 기간별 안내 메시지 */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="text-blue-600 text-lg">💡</div>
                    <div className="text-sm text-blue-800">
                      <div className="font-medium mb-1">식재료 사용량 순위 분석</div>
                      <div className="space-y-1">
                        <div>
                          {selectedPeriod === '이번 주' && '이번 주 동안 가장 많이 사용한 식재료를 총 사용량 기준으로 순위를 매겨 보여줍니다.'}
                          {selectedPeriod === '이번 달' && '이번 달 동안 가장 많이 사용한 식재료를 총 사용량 기준으로 순위를 매겨 보여줍니다.'}
                          {selectedPeriod === '지난 3개월' && '지난 3개월 동안 가장 많이 사용한 식재료를 총 사용량 기준으로 순위를 매겨 보여줍니다.'}
                          {selectedPeriod === '올해' && '올해 가장 많이 사용한 식재료를 총 사용량 기준으로 순위를 매겨 보여줍니다.'}
                        </div>
                        <div className="text-xs text-blue-600 mt-2">
                          • 동일한 식재료명(ingredientName)의 사용량을 합산하여 순위를 결정합니다
                          • 1위는 🥇, 2위는 🥈, 3위는 🥉로 표시됩니다
                          • 총 사용량이 같은 식재료들은 공동 순위로 표시됩니다 (보라색 테두리)
                          • 공동 순위인 경우 다음 순위는 건너뛰어 계산됩니다
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </UserGuard>
  );
}
