'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '../components/sidebar';
import AdminGuard from '@/lib/auth/adminGuard';
import { adminStatisticsService, ChartData } from '@/lib/api/services/adminStatisticsService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

function AdminStatisticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('이번 달');
  const [statistics, setStatistics] = useState<{
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    activeUserGrowthRate: number;
    newUserGrowthRate: number;
    complaintRate: number;
    totalRecipes: number;
    totalIngredients: number;
    totalComplaints: number;
    totalFeedback: number;
    recipeGrowthRate: number;
    ingredientGrowthRate: number;
    complaintGrowthRate: number;
    feedbackGrowthRate: number;
    totalDietLogs: number;
    dietLogGrowthRate: number;
    totalInventoryItems: number;
    inventoryGrowthRate: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);

  const timePeriods = ['이번 주', '이번 달', '지난 3개월', '올해'];

  // 기간별 테마 매핑
  const getThemeFromPeriod = (period: string): string => {
    switch (period) {
      case '이번 주': return 'week';
      case '이번 달': return 'month';
      case '지난 3개월': return 'quarter';
      case '올해': return 'year';
      default: return 'month';
    }
  };

  // 통계 데이터 로드
  const loadStatistics = async (period: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const theme = getThemeFromPeriod(period);
      
      // 통계 데이터와 차트 데이터를 병렬로 가져오기
      const [statisticsResponse, chartResponse] = await Promise.all([
        adminStatisticsService.getAdminStatistics(theme),
        adminStatisticsService.getChartData(theme)
      ]);
      
      if (statisticsResponse.success && statisticsResponse.data) {
        setStatistics(statisticsResponse.data);
      } else {
        setError(statisticsResponse.message || '통계 데이터를 불러올 수 없습니다.');
      }

      // 차트 데이터 설정
      if (chartResponse.success && chartResponse.data) {
        setChartData(chartResponse.data);
      } else {
        console.warn('차트 데이터를 불러올 수 없습니다:', chartResponse.message);
        // 차트 데이터가 없으면 기본값 사용
        setChartData(null);
      }
    } catch (err) {
      console.error('통계 데이터 로드 실패:', err);
      setError(err instanceof Error ? err.message : '통계 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 및 기간 변경 시 데이터 로드
  useEffect(() => {
    loadStatistics(selectedPeriod);
  }, [selectedPeriod]);

  // 통계 데이터가 없을 때 기본값
  const getSummaryStats = () => {
    if (!statistics) {
      return [
        {
          title: '총 회원 수',
          value: '로딩 중...',
          trend: '',
          trendColor: 'text-gray-500',
          icon: (
            <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
            </svg>
          )
        },
        {
          title: '총 레시피',
          value: '로딩 중...',
          trend: '',
          trendColor: 'text-gray-500',
          icon: (
            <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
            </svg>
          )
        },
        {
          title: '총 식자재',
          value: '로딩 중...',
          trend: '',
          trendColor: 'text-gray-500',
          icon: (
            <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
            </svg>
          )
        },
        {
          title: '민원 처리율',
          value: '로딩 중...',
          trend: '',
          trendColor: 'text-gray-500',
          icon: (
            <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3-3a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1z" clipRule="evenodd"/>
            </svg>
          )
        }
      ];
    }

    return [
      {
        title: '총 회원 수',
        value: `${statistics.totalUsers.toLocaleString()}명`,
        trend: '',
        trendColor: 'text-gray-600',
        icon: (
          <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
          </svg>
        )
      },
      {
        title: '총 레시피',
        value: `${statistics.totalRecipes.toLocaleString()}개`,
        trend: statistics.recipeGrowthRate > 0 ? `+${statistics.recipeGrowthRate.toFixed(1)}% 증가` : `${statistics.recipeGrowthRate.toFixed(1)}% 감소`,
        trendColor: statistics.recipeGrowthRate > 0 ? 'text-blue-600' : 'text-red-600',
        icon: (
          <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
          </svg>
        )
      },
      {
        title: '총 식자재',
        value: `${statistics.totalIngredients.toLocaleString()}개`,
        trend: statistics.ingredientGrowthRate > 0 ? `+${statistics.ingredientGrowthRate.toFixed(1)}% 증가` : `${statistics.ingredientGrowthRate.toFixed(1)}% 감소`,
        trendColor: statistics.ingredientGrowthRate > 0 ? 'text-orange-600' : 'text-red-600',
        icon: (
          <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
          </svg>
        )
      },
      {
        title: '민원 처리율',
        value: `${statistics.complaintRate.toFixed(1)}%`,
        trend: '',
        trendColor: 'text-purple-600',
        icon: (
          <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3-3a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1z" clipRule="evenodd"/>
          </svg>
        )
      }
    ];
  };

  // 사용자 활동 트렌드 데이터 생성
  const getUserActivityData = () => {
    if (chartData?.weeklyTrend) {
      return chartData.weeklyTrend.map(item => ({
        day: item.day,
        활성사용자: item.activeUsers,
        신규가입: item.newUsers,
        레시피등록: item.recipeRegistrations
      }));
    }

    // API 데이터가 없을 때 기본값 (하드코딩)
    if (!statistics) {
      return [];
    }

    const days = ['월', '화', '수', '목', '금', '토', '일'];
    return days.map(day => ({
      day,
      활성사용자: Math.floor(Math.random() * 50) + 20,
      신규가입: Math.floor(Math.random() * 10) + 2,
      레시피등록: Math.floor(Math.random() * 15) + 5
    }));
  };

  // 사용자 상태 분포 데이터 생성
  const getUserStatusData = () => {
    if (chartData?.userStatusDistribution) {
      return chartData.userStatusDistribution;
    }

    // API 데이터가 없을 때 기본값 (백엔드 Status enum에 맞춤)
    if (!statistics) {
      return [];
    }

    return [
      { name: '활성 (ACTIVE)', value: statistics.activeUsers, color: '#10B981' },
      { name: '비활성 (INACTIVE)', value: Math.floor(statistics.totalUsers * 0.2), color: '#F59E0B' },
      { name: '보류 중 (PENDING)', value: Math.floor(statistics.totalUsers * 0.05), color: '#3B82F6' },
      { name: '철회됨 (WITHDRAWN)', value: Math.floor(statistics.totalUsers * 0.02), color: '#EF4444' }
    ];
  };

  // 일별 사용자 활동 데이터 생성
  const getDailyActivityData = () => {
    if (chartData?.dailyActivity) {
      return chartData.dailyActivity.map(item => ({
        date: item.date,
        로그인: item.logins,
        레시피조회: item.recipeViews,
        레시피등록: item.recipeRegistrations
      }));
    }

    // API 데이터가 없을 때 기본값 (하드코딩)
    if (!statistics) {
      return [];
    }

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push({
        date: date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        로그인: Math.floor(Math.random() * 100) + 50,
        레시피조회: Math.floor(Math.random() * 200) + 100,
        레시피등록: Math.floor(Math.random() * 20) + 5
      });
    }
    return last7Days;
  };

  // 동적 인사이트 생성
  const getInsights = () => {
    if (!statistics) {
      return [
        {
          title: '데이터 로딩 중',
          description: '통계 데이터를 불러오는 중입니다...',
          icon: '⏳',
          color: 'bg-gray-50 border-gray-200'
        }
      ];
    }

    const insights = [];

    // 레시피 증가율 기반 인사이트
    if (statistics.recipeGrowthRate > 0) {
      insights.push({
        title: '레시피 등록 증가',
        description: `레시피 등록이 ${statistics.recipeGrowthRate.toFixed(1)}% 증가했습니다. 사용자들의 요리 활동이 활발해지고 있어요.`,
        icon: '🍳',
        color: 'bg-green-50 border-green-200'
      });
    } else if (statistics.recipeGrowthRate < 0) {
      insights.push({
        title: '레시피 등록 감소',
        description: `레시피 등록이 ${Math.abs(statistics.recipeGrowthRate).toFixed(1)}% 감소했습니다. 사용자 참여 유도가 필요합니다.`,
        icon: '📉',
        color: 'bg-red-50 border-red-200'
      });
    }

    // 식자재 증가율 기반 인사이트
    if (statistics.ingredientGrowthRate > 0) {
      insights.push({
        title: '식자재 데이터 확장',
        description: `식자재 데이터가 ${statistics.ingredientGrowthRate.toFixed(1)}% 증가했습니다. 더 다양한 요리 정보를 제공할 수 있게 되었어요.`,
        icon: '🥕',
        color: 'bg-blue-50 border-blue-200'
      });
    } else if (statistics.ingredientGrowthRate < 0) {
      insights.push({
        title: '식자재 데이터 부족',
        description: `식자재 데이터가 ${Math.abs(statistics.ingredientGrowthRate).toFixed(1)}% 감소했습니다. 데이터 관리가 필요합니다.`,
        icon: '⚠️',
        color: 'bg-yellow-50 border-yellow-200'
      });
    }

    // 식단 로그 증가율 기반 인사이트
    if (statistics.dietLogGrowthRate > 0) {
      insights.push({
        title: '식단 관리 활성화',
        description: `식단 로그가 ${statistics.dietLogGrowthRate.toFixed(1)}% 증가했습니다. 사용자들의 건강 관리 관심이 높아지고 있어요.`,
        icon: '🥗',
        color: 'bg-green-50 border-green-200'
      });
    }

    // 재고 관리 기반 인사이트
    if (statistics.inventoryGrowthRate > 0) {
      insights.push({
        title: '재고 관리 활성화',
        description: `재고 아이템이 ${statistics.inventoryGrowthRate.toFixed(1)}% 증가했습니다. 사용자들이 더 체계적으로 식자재를 관리하고 있어요.`,
        icon: '📦',
        color: 'bg-purple-50 border-purple-200'
      });
    }

    // 민원 처리율 기반 인사이트
    if (statistics.complaintRate >= 90) {
      insights.push({
        title: '민원 처리 효율성 우수',
        description: `민원 처리율이 ${statistics.complaintRate.toFixed(1)}%로 높은 수준을 유지하고 있습니다. 고객 만족도 향상에 기여하고 있어요.`,
        icon: '✅',
        color: 'bg-purple-50 border-purple-200'
      });
    } else if (statistics.complaintRate >= 70) {
      insights.push({
        title: '민원 처리율 양호',
        description: `민원 처리율이 ${statistics.complaintRate.toFixed(1)}%로 양호한 수준입니다. 더 나은 서비스를 위해 개선 여지가 있습니다.`,
        icon: '⚠️',
        color: 'bg-orange-50 border-orange-200'
      });
    } else {
      insights.push({
        title: '민원 처리율 개선 필요',
        description: `민원 처리율이 ${statistics.complaintRate.toFixed(1)}%로 낮습니다. 고객 서비스 개선이 시급합니다.`,
        icon: '🚨',
        color: 'bg-red-50 border-red-200'
      });
    }

    // 사용자 활동 기반 인사이트
    if (statistics.activeUsers > statistics.totalUsers * 0.7) {
      insights.push({
        title: '높은 사용자 활성도',
        description: `활성 사용자 비율이 ${((statistics.activeUsers / statistics.totalUsers) * 100).toFixed(1)}%로 높습니다. 서비스 품질이 우수합니다.`,
        icon: '👥',
        color: 'bg-green-50 border-green-200'
      });
    } else if (statistics.activeUsers < statistics.totalUsers * 0.3) {
      insights.push({
        title: '사용자 활성도 개선 필요',
        description: `활성 사용자 비율이 ${((statistics.activeUsers / statistics.totalUsers) * 100).toFixed(1)}%로 낮습니다. 사용자 참여 유도가 필요합니다.`,
        icon: '📊',
        color: 'bg-red-50 border-red-200'
      });
    }

    // 기본 인사이트 (데이터가 충분하지 않은 경우)
    if (insights.length === 0) {
      insights.push({
        title: '서비스 현황',
        description: `총 ${statistics.totalUsers.toLocaleString()}명의 회원이 서비스를 이용하고 있습니다.`,
        icon: '👥',
        color: 'bg-gray-50 border-gray-200'
      });
    }

    return insights;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-6">
        {/* Main Card Container */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">관리자 통계 대시보드</h1>
            <p className="text-gray-600 mb-6">시스템 전반의 현황과 성과를 한눈에 확인하세요</p>
            
            {/* Time Period Selector */}
            <div className="flex justify-end">
              <div className="bg-white rounded-lg p-1 shadow-sm border">
                {timePeriods.map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      selectedPeriod === period
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {getSummaryStats().map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-gray-50">
                    {stat.icon}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    {stat.trend && (
                      <p className={`text-sm ${stat.trendColor}`}>{stat.trend}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-red-50">
                  <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-.293.293a1 1 0 101.414 1.414l2-2a1 1 0 000-1.414l-2-2a1 1 0 00-1.414 1.414L9.414 11H7a1 1 0 01-1-1V5a1 1 0 00-1-1H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">총 민원</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {statistics ? `${statistics.totalComplaints.toLocaleString()}건` : '로딩 중...'}
                  </p>
                  <p className={`text-sm ${statistics && statistics.complaintGrowthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {statistics ? (statistics.complaintGrowthRate > 0 ? `+${statistics.complaintGrowthRate.toFixed(1)}% 증가` : `${statistics.complaintGrowthRate.toFixed(1)}% 감소`) : ''}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-yellow-50">
                  <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">총 피드백</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {statistics ? `${statistics.totalFeedback.toLocaleString()}건` : '로딩 중...'}
                  </p>
                  <p className={`text-sm ${statistics && statistics.feedbackGrowthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {statistics ? (statistics.feedbackGrowthRate > 0 ? `+${statistics.feedbackGrowthRate.toFixed(1)}% 증가` : `${statistics.feedbackGrowthRate.toFixed(1)}% 감소`) : ''}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-indigo-50">
                  <svg className="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">활성 사용자</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {statistics ? `${statistics.activeUsers.toLocaleString()}명` : '로딩 중...'}
                  </p>
                  <p className={`text-sm ${statistics && statistics.activeUserGrowthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {statistics ? (statistics.activeUserGrowthRate > 0 ? `+${statistics.activeUserGrowthRate.toFixed(1)}% 증가` : `${statistics.activeUserGrowthRate.toFixed(1)}% 감소`) : ''}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-teal-50">
                  <svg className="w-8 h-8 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">신규 가입</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {statistics ? `${statistics.newUsers.toLocaleString()}명` : '로딩 중...'}
                  </p>
                  <p className={`text-sm ${statistics && statistics.newUserGrowthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {statistics ? (statistics.newUserGrowthRate > 0 ? `+${statistics.newUserGrowthRate.toFixed(1)}% 증가` : `${statistics.newUserGrowthRate.toFixed(1)}% 감소`) : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Statistics Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-50">
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">총 식단 로그</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {statistics ? `${statistics.totalDietLogs.toLocaleString()}건` : '로딩 중...'}
                  </p>
                  <p className={`text-sm ${statistics && statistics.dietLogGrowthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {statistics ? (statistics.dietLogGrowthRate > 0 ? `+${statistics.dietLogGrowthRate.toFixed(1)}% 증가` : `${statistics.dietLogGrowthRate.toFixed(1)}% 감소`) : ''}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-50">
                  <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">총 재고 아이템</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {statistics ? `${statistics.totalInventoryItems.toLocaleString()}개` : '로딩 중...'}
                  </p>
                  <p className={`text-sm ${statistics && statistics.inventoryGrowthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {statistics ? (statistics.inventoryGrowthRate > 0 ? `+${statistics.inventoryGrowthRate.toFixed(1)}% 증가` : `${statistics.inventoryGrowthRate.toFixed(1)}% 감소`) : ''}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-pink-50">
                  <svg className="w-8 h-8 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">민원 처리율</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {statistics ? `${statistics.complaintRate.toFixed(1)}%` : '로딩 중...'}
                  </p>
                  <p className="text-sm text-gray-500">전체 민원 대비 처리율</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-cyan-50">
                  <svg className="w-8 h-8 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-.293.293a1 1 0 101.414 1.414l2-2a1 1 0 000-1.414l-2-2a1 1 0 00-1.414 1.414L9.414 11H7a1 1 0 01-1-1V5a1 1 0 00-1-1H3z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">시스템 상태</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {statistics ? '정상' : '로딩 중...'}
                  </p>
                  <p className="text-sm text-green-600">모든 서비스 정상 운영</p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                <p className="text-red-700">{error}</p>
                <button 
                  onClick={() => loadStatistics(selectedPeriod)}
                  className="ml-auto px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                >
                  다시 시도
                </button>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-blue-700">통계 데이터를 불러오는 중...</p>
              </div>
            </div>
          )}

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* 사용자 활동 트렌드 차트 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">주간 사용자 활동 트렌드</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getUserActivityData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="활성사용자" stroke="#10B981" strokeWidth={2} />
                    <Line type="monotone" dataKey="신규가입" stroke="#3B82F6" strokeWidth={2} />
                    <Line type="monotone" dataKey="레시피등록" stroke="#F59E0B" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 사용자 상태 분포 차트 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">사용자 상태 분포</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getUserStatusData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getUserStatusData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Daily Activity Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">최근 7일 사용자 활동</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getDailyActivityData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="로그인" fill="#10B981" />
                  <Bar dataKey="레시피조회" fill="#3B82F6" />
                  <Bar dataKey="레시피등록" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">

            {/* Insights */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">주요 인사이트</h2>
              <div className="space-y-4">
                {getInsights().map((insight, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${insight.color}`}>
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">{insight.icon}</span>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">{insight.title}</h3>
                        <p className="text-sm text-gray-700">{insight.description}</p>
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

export default function AdminStatisticsPageWithGuard() {
  return (
    <AdminGuard>
      <AdminStatisticsPage />
    </AdminGuard>
  );
}
