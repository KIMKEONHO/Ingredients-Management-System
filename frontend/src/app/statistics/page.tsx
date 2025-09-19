'use client';

import { useState, useEffect } from 'react';
import { COLOR_PRESETS } from '@/lib/constants/colors';
import PageHeader from '../components/ui/PageHeader';
import SectionCard from '../components/ui/SectionCard';
import { DietService, MonthStatisticsResponseDto, WeekStatisticsResponseDto, QuarterStatisticsResponseDto, YearStatisticsResponseDto } from '@/lib/api/services/dietService';
import { UserGuard } from '@/lib/auth/authGuard';

export default function StatisticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('이번 달');
  const [monthStats, setMonthStats] = useState<MonthStatisticsResponseDto | null>(null);
  const [weekStats, setWeekStats] = useState<WeekStatisticsResponseDto[]>([]);
  const [quarterStats, setQuarterStats] = useState<QuarterStatisticsResponseDto | null>(null);
  const [yearStats, setYearStats] = useState<YearStatisticsResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false); // 중복 로드 방지
  const [retryCount, setRetryCount] = useState(0); // 재시도 횟수

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
        if (weekStats.length > 0) {
          const avg = weekStats.reduce((sum, stat) => sum + stat.averageKcal, 0) / weekStats.length;
          return `${Math.round(avg)}kcal`;
        }
        return '데이터 없음';
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
        return '주간 패턴';
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
        return 'text-blue-600';
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
        if (weekStats.length > 0) {
          const avg = weekStats.reduce((sum, stat) => sum + stat.averageKcal, 0) / weekStats.length;
          return <p className="text-2xl font-bold text-blue-600">{Math.round(avg)}kcal</p>;
        }
        return <p className="text-lg text-gray-500">데이터 없음</p>;
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
        if (quarterStats && quarterStats.diffFromPreviousQuarter !== null) {
          return (
            <p className={`text-2xl font-bold ${
              quarterStats.diffFromPreviousQuarter > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {quarterStats.diffFromPreviousQuarter > 0 ? '+' : ''}{Math.round(quarterStats.diffFromPreviousQuarter)}kcal
            </p>
          );
        }
        return <p className="text-lg text-gray-500">변화 없음</p>;
      case '올해':
        if (yearStats && yearStats.diffFromLastYear !== null) {
          return (
            <p className={`text-2xl font-bold ${
              yearStats.diffFromLastYear > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {yearStats.diffFromLastYear > 0 ? '+' : ''}{Math.round(yearStats.diffFromLastYear)}kcal
            </p>
          );
        }
        return <p className="text-lg text-gray-500">변화 없음</p>;
      default:
        return <p className="text-lg text-gray-500">변화 없음</p>;
    }
  };

  const getChartData = () => {
    switch (selectedPeriod) {
      case '이번 주':
        if (weekStats.length > 0) {
          const maxKcal = Math.max(...weekStats.map(s => s.averageKcal));
          return weekStats.map((stat, index) => {
            const date = new Date(stat.date);
            const dayName = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
            const height = maxKcal > 0 ? (stat.averageKcal / maxKcal) * 100 : 0;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gradient-to-t from-orange-500 to-red-500 rounded-t-sm relative group">
                  <div 
                    className="w-full bg-gradient-to-t from-orange-500 to-red-500 rounded-t-sm transition-all duration-300"
                    style={{ height: `${Math.max(height, 10)}px` }}
                  ></div>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {Math.round(stat.averageKcal)}kcal
                  </div>
                </div>
                <span className="text-sm text-gray-600 mt-2">{dayName}</span>
                <span className="text-xs text-gray-500">{date.getMonth() + 1}/{date.getDate()}</span>
              </div>
            );
          });
        }
        return <div className="h-48 flex items-center justify-center w-full"><div className="text-gray-500">데이터가 없습니다</div></div>;
      
      case '지난 3개월':
        if (quarterStats && quarterStats.monthlyBreakdown.length > 0) {
          const maxKcal = Math.max(...quarterStats.monthlyBreakdown.map(m => m.averageKcal));
          return quarterStats.monthlyBreakdown.map((month, index) => {
            const height = maxKcal > 0 ? (month.averageKcal / maxKcal) * 100 : 0;
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-sm relative group">
                  <div 
                    className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-sm transition-all duration-300"
                    style={{ height: `${Math.max(height, 10)}px` }}
                  ></div>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {Math.round(month.averageKcal)}kcal
                  </div>
                </div>
                <span className="text-sm text-gray-600 mt-2">{month.month}월</span>
              </div>
            );
          });
        }
        return <div className="h-48 flex items-center justify-center w-full"><div className="text-gray-500">데이터가 없습니다</div></div>;
      
      case '올해':
        if (yearStats && yearStats.monthlyBreakdown.length > 0) {
          const maxKcal = Math.max(...yearStats.monthlyBreakdown.map(m => m.averageKcal));
          return yearStats.monthlyBreakdown.map((month, index) => {
            const height = maxKcal > 0 ? (month.averageKcal / maxKcal) * 100 : 0;
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gradient-to-t from-green-500 to-blue-500 rounded-t-sm relative group">
                  <div 
                    className="w-full bg-gradient-to-t from-green-500 to-blue-500 rounded-t-sm transition-all duration-300"
                    style={{ height: `${Math.max(height, 10)}px` }}
                  ></div>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {Math.round(month.averageKcal)}kcal
                  </div>
                </div>
                <span className="text-sm text-gray-600 mt-2">{month.month}월</span>
              </div>
            );
          });
        }
        return <div className="h-48 flex items-center justify-center w-full"><div className="text-gray-500">데이터가 없습니다</div></div>;
      
      default:
        return <div className="h-48 flex items-center justify-center w-full"><div className="text-gray-500">데이터가 없습니다</div></div>;
    }
  };

  const getChartSummary = () => {
    switch (selectedPeriod) {
      case '이번 주':
        if (weekStats.length > 0) {
          const avg = weekStats.reduce((sum, stat) => sum + stat.averageKcal, 0) / weekStats.length;
          return (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                주간 평균: <span className="font-semibold text-orange-600">
                  {Math.round(avg)}kcal
                </span>
              </p>
            </div>
          );
        }
        return null;
      
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

  // 선택된 기간에 따른 통계 데이터 로드
  useEffect(() => {
    const loadDietStatistics = async () => {
      try {
        setIsLoading(true);
        
        // API 요청 전에 약간의 지연을 두어 인증 토큰이 준비되도록 함
        await new Promise(resolve => setTimeout(resolve, 200));
        
        console.log('[DEBUG] 식단 통계 로드 시작, 선택된 기간:', selectedPeriod);
        
        let monthData = null;
        let weekData: WeekStatisticsResponseDto[] = [];
        
        // 선택된 기간에 따라 다른 데이터 로드
        switch (selectedPeriod) {
          case '이번 주':
            weekData = await DietService.getWeekStatistics();
            break;
          case '이번 달':
            monthData = await DietService.getMonthStatistics();
            weekData = await DietService.getWeekStatistics();
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
            monthData = await DietService.getMonthStatistics();
            weekData = await DietService.getWeekStatistics();
        }
        
        console.log('[DEBUG] 식단 통계 로드 성공:', { monthData, weekData, selectedPeriod });
        
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
  }, [selectedPeriod, retryCount]); // selectedPeriod를 의존성으로 추가

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

            {/* Period-based Chart Card */}
            <SectionCard title={`${selectedPeriod} 칼로리 추이`} variant="statistics">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {selectedPeriod === '이번 주' ? '최근 7일 칼로리 섭취량' :
                   selectedPeriod === '이번 달' ? '이번 달 칼로리 추이' :
                   selectedPeriod === '지난 3개월' ? '3개월간 월별 칼로리 추이' :
                   selectedPeriod === '올해' ? '올해 월별 칼로리 추이' : '칼로리 추이'}
                </h3>
                {isLoading ? (
                  <div className="h-48 flex items-center justify-center">
                    <div className="text-gray-500">로딩 중...</div>
                  </div>
                ) : (
                  <div className="h-48 flex items-end justify-between gap-2">
                    {getChartData()}
                  </div>
                )}
                {getChartSummary()}
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
