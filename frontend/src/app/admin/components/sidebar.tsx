'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="bg-white shadow-lg border-r border-gray-200 w-64 min-h-screen">
      <div className="p-6">
        {/* Logo and Title - 상단에 배치 */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900">관리자 패널</h1>
        </div>

        {/* Navigation - 세로로 배치 */}
        <nav className="space-y-2">
          <Link
            href="/admin/user/controll"
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 w-full ${
              isActive('/admin/user/controll')
                ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
            </svg>
            사용자 관리
          </Link>

          <Link
            href="/admin/ingredients"
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 w-full ${
              isActive('/admin/ingredients')
                ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            식자재 관리
          </Link>

          <Link
            href="/admin/categories"
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 w-full ${
              isActive('/admin/categories')
                ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            카테고리 관리
          </Link>

          <Link
            href="/admin/complaints"
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 w-full ${
              isActive('/admin/complaints')
                ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-.293.293a1 1 0 101.414 1.414l2-2a1 1 0 000-1.414l-2-2a1 1 0 00-1.414 1.414L9.414 11H7a1 1 0 01-1-1V5a1 1 0 00-1-1H3z" clipRule="evenodd" />
            </svg>
            민원 관리
          </Link>

          <Link
            href="/admin/statistics"
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 w-full ${
              isActive('/admin/statistics')
                ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-.293.293a1 1 0 101.414 1.414l2-2a1 1 0 000-1.414l-2-2a1 1 0 00-1.414 1.414L9.414 11H7a1 1 0 01-1-1V5a1 1 0 00-1-1H3z" clipRule="evenodd" />
            </svg>
            통계
          </Link>

          <Link
            href="/admin/callender"
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 w-full ${
              isActive('/admin/callender')
                ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 000-2H6z" clipRule="evenodd" />
            </svg>
            일정 관리
          </Link>
        </nav>

        {/* User Menu - 하단에 배치 */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
              <svg className="h-4 w-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="ml-2 text-gray-700 font-medium">관리자</span>
          </div>

          <Link
            href="/"
            className="flex items-center px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200 w-full"
          >
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            메인으로
          </Link>
        </div>
      </div>
    </div>
  );
}
