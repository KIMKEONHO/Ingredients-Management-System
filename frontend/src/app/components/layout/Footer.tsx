export default function Footer() {
    return (
      <footer className="bg-white mt-auto py-10 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between mb-8">
            <div className="mb-6 md:mb-0 max-w-md">
              <div className="flex items-center text-indigo-600 mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-8 h-8"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.5 3.75A2.25 2.25 0 0 1 6.75 1.5h10.5a2.25 2.25 0 0 1 2.25 2.25v16.5a.75.75 0 0 1-1.2.6l-4.8-3.6a1.5 1.5 0 0 0-1.8 0l-4.8 3.6a.75.75 0 0 1-1.2-.6V3.75z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="ml-2 text-sm font-semibold text-indigo-700">IMS</span>
              </div>
              <p className="text-gray-700 text-sm leading-6">
                IMS(Ingredients Management System)는 식재료의 입·출고부터 소진까지
                전 과정을 관리하고, 소비 데이터를 바탕으로 효율적인 운영과 비용 절감을 돕는
                식재료 관리 서비스입니다. AI가 재고를 확인해 메뉴를 추천해 드려요.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-gray-800 font-medium mb-4">주요 기능</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>
                    <a href="/statistics" className="hover:text-indigo-600">식재료 소비 통계</a>
                  </li>
                  <li>
                    <a href="/support" className="hover:text-indigo-600">민원 센터</a>
                  </li>
                  <li>
                    <a href="/recipe-recommendation" className="hover:text-indigo-600">레시피 추천</a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-gray-800 font-medium mb-4">관리 도구</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>
                    <a href="/callender" className="hover:text-indigo-600">식단 관리</a>
                  </li>
                  <li>
                    <a href="/recipe-community" className="hover:text-indigo-600">레시피 공유</a>
                  </li>
                  <li>
                    <a href="/inventory" className="hover:text-indigo-600">재고 관리</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 text-sm text-gray-500 flex flex-col md:flex-row items-center md:justify-between text-center gap-4">
            <div>© {new Date().getFullYear()} IMS. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <a href="mailto:jerry6475@gmail.com" className="hover:text-indigo-600">jerry6475@gmail.com</a>
              <a href="/terms" className="hover:text-indigo-600">이용약관</a>
            </div>
          </div>
        </div>
      </footer>
    );
  }