import Link from 'next/link';

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-6xl mb-4">��</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            접근 권한이 없습니다
          </h1>
          <p className="text-gray-600 mb-6">
            이 페이지에 접근할 권한이 없습니다. 관리자에게 문의하거나 다른 페이지로 이동해주세요.
          </p>
          <div className="space-y-3">
            <Link
              href="/"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors block"
            >
              홈으로 돌아가기
            </Link>
            <Link
              href="/login"
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors block"
            >
              로그인하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
