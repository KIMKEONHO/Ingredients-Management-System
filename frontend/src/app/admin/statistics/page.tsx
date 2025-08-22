'use client';

import { useState } from 'react';
import AdminSidebar from '../components/sidebar';

export default function AdminStatisticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('이번 달');

  const timePeriods = ['이번 주', '이번 달', '지난 3개월', '올해'];

  const summaryStats = [
    {
      title: '총 회원 수',
      value: '1,247명',
      trend: '+12% 증가',
      trendColor: 'text-green-600',
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
        </svg>
      )
    },
    {
      title: '활성 회원',
      value: '892명',
      trend: '+8% 증가',
      trendColor: 'text-blue-600',
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
        </svg>
      )
    },
    {
      title: '신규 가입',
      value: '45명',
      trend: '+15% 증가',
      trendColor: 'text-orange-600',
      icon: (
        <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
        </svg>
      )
    },
    {
      title: '민원 처리율',
      value: '94%',
      trend: '+2% 증가',
      trendColor: 'text-purple-600',
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3-3a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1z" clipRule="evenodd"/>
        </svg>
      )
    }
  ];

  const topUsers = [
    { name: '김철수', email: 'kim@example.com', lastLogin: '2025-08-07', status: '활성', usage: '45회', icon: '👤' },
    { name: '이영희', email: 'lee@example.com', lastLogin: '2025-08-06', status: '활성', usage: '32회', icon: '👤' },
    { name: '박민수', email: 'park@example.com', lastLogin: '2025-07-25', status: '차단', usage: '28회', icon: '👤' },
    { name: '최수진', email: 'choi@example.com', lastLogin: '2025-06-15', status: '휴면', usage: '25회', icon: '👤' },
    { name: '정다은', email: 'jung@example.com', lastLogin: '2025-08-07', status: '활성', usage: '22회', icon: '👤' }
  ];

  const insights = [
    {
      title: '회원 활성도 증가',
      description: '지난달 대비 활성 회원 수가 8% 증가했습니다. 서비스 품질 개선의 효과가 나타나고 있습니다.',
      icon: '📈',
      color: 'bg-green-50 border-green-200'
    },
    {
      title: '민원 처리 효율성 향상',
      description: '민원 처리율이 94%로 높은 수준을 유지하고 있습니다. 고객 만족도 향상에 기여하고 있어요.',
      icon: '✅',
      color: 'bg-blue-50 border-blue-200'
    },
    {
      title: '신규 가입자 증가',
      description: '신규 가입자가 지속적으로 증가하고 있습니다. 마케팅 활동의 효과가 나타나고 있어요.',
      icon: '🎯',
      color: 'bg-orange-50 border-orange-200'
    }
  ];

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

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {summaryStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-gray-50">
                    {stat.icon}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <p className={`text-sm ${stat.trendColor}`}>{stat.trend}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Top Users and Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Users */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">활성 사용자 TOP 5</h2>
              <div className="space-y-4">
                {topUsers.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{user.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{user.usage}</p>
                      <p className={`text-xs px-2 py-1 rounded-full ${
                        user.status === '활성' ? 'bg-green-100 text-green-800' :
                        user.status === '차단' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">주요 인사이트</h2>
              <div className="space-y-4">
                {insights.map((insight, index) => (
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
