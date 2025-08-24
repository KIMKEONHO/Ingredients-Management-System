import Link from 'next/link'

export default function Home() {
  return (
      <>
        <main className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-purple-50">
          {/* Hero */}
          <section className="container mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-24">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
                IMS · Ingredients Management System
              </span>
              <h1 className="mt-6 text-4xl md:text-6xl font-extrabold tracking-tight text-black">
                식재료 관리의 표준, IMS
              </h1>
              <p className="mt-5 text-lg md:text-xl leading-8 text-blue-800">
                재고부터 통계, AI 추천까지. 매장의 운영을 단순하고 똑똑하게 만듭니다.
              </p>
              <div className="mt-10 flex items-center justify-center gap-3">
                <a href="/login" className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200">
                  시작하기
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M3.75 12a.75.75 0 0 1 .75-.75h12.69l-3.72-3.72a.75.75 0 1 1 1.06-1.06l5 5a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 1 1-1.06-1.06l3.72-3.72H4.5A.75.75 0 0 1 3.75 12Z"/></svg>
                </a>
                <a href="#features" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-blue-700 ring-1 ring-blue-200 transition hover:bg-blue-50">
                  기능 보기
                </a>
              </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-[600px] w-[800px] rounded-full bg-blue-200/20 blur-3xl" />
          </section>

          {/* Features */}
          <section id="features" className="container mx-auto px-6 py-16 md:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black">핵심 기능</h2>
              <p className="mt-4 text-blue-700">매장 운영의 필수 기능을 하나의 제품 안에 담았습니다.</p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* 재고 관리 */}
              <div className="group rounded-2xl bg-white p-8 shadow-sm ring-1 ring-blue-100 transition hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M3.75 6.75A.75.75 0 0 1 4.5 6h15a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75h-15a.75.75 0 0 1-.75-.75V6.75Z"/><path d="M7.5 3.75A.75.75 0 0 1 8.25 3h7.5a.75.75 0 0 1 .75.75V6h-9V3.75Z"/></svg>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-black">식재료 재고 관리</h3>
                <p className="mt-2 text-blue-700">입고/출고/유통기한을 한 화면에서 관리하고 알림으로 낭비를 줄입니다.</p>
              </div>

              {/* 사용 통계 */}
              <div className="group rounded-2xl bg-white p-8 shadow-sm ring-1 ring-purple-100 transition hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M3.75 19.5a.75.75 0 0 1-.75-.75V5.25a.75.75 0 0 1 1.5 0v12.75c0 .414-.336.75-.75.75Z"/><path d="M6 18.75a.75.75 0 0 1-.75-.75v-6a.75.75 0 0 1 1.5 0v6c0 .414-.336.75-.75.75Zm4.5 0a.75.75 0 0 1-.75-.75V9a.75.75 0 0 1 1.5 0v9c0 .414-.336.75-.75.75Zm4.5 0a.75.75 0 0 1-.75-.75V6.75a.75.75 0 0 1 1.5 0V18c0 .414-.336.75-.75.75Zm4.5 0a.75.75 0 0 1-.75-.75V12a.75.75 0 0 1 1.5 0v6.75c0 .414-.336.75-.75.75Z"/></svg>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-black">식재료 사용 통계</h3>
                <p className="mt-2 text-purple-700">기간별/메뉴별 사용량을 시각화하고 원가를 추적합니다.</p>
              </div>

              {/* AI 메뉴 추천 */}
              <div className="group rounded-2xl bg-white p-8 shadow-sm ring-1 ring-blue-100 transition hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M12 2.25a9.75 9.75 0 1 0 9.75 9.75A9.761 9.761 0 0 0 12 2.25Zm.75 4.5a.75.75 0 0 0-1.5 0v6a.75.75 0 0 0 .44.68l4.5 2.25a.75.75 0 1 0 .66-1.34L12.75 12.3V6.75Z"/></svg>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-black">AI 메뉴 추천</h3>
                <p className="mt-2 text-blue-700">보유 재고와 판매 추이를 기반으로 판매 가능한 메뉴를 추천합니다.</p>
              </div>

              {/* 장바구니 */}
              <Link href="/cart" className="group rounded-2xl bg-white p-8 shadow-sm ring-1 ring-purple-100 transition hover:shadow-md hover:ring-purple-200">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M2.25 3.75A.75.75 0 0 1 3 3h2.31a1.5 1.5 0 0 1 1.46 1.14l.3 1.21h12.6a.75.75 0 0 1 .73.92l-1.5 6a1.5 1.5 0 0 1-1.45 1.13H8.31l.18.72a.75.75 0 0 0 .73.56h9.03a.75.75 0 0 1 0 1.5H9.22a2.25 2.25 0 0 1-2.18-1.69L4.54 5.86l-.3-1.2H3a.75.75 0 0 1-.75-.9Z"/><path d="M6.75 21a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm10.5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z"/></svg>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-black">장바구니</h3>
                <p className="mt-2 text-purple-700">필요한 식재료를 담아 발주서를 쉽고 빠르게 생성합니다.</p>
              </Link>

              {/* 민원/문의 */}
              <div className="group rounded-2xl bg-white p-8 shadow-sm ring-1 ring-blue-100 transition hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M12 3.75A8.25 8.25 8.25 0 1 0 20.25 12 8.26 8.26 0 0 0 12 3.75Zm0 12.75a.75.75 0 0 1-.53-.22l-2.25-2.25a.75.75 0 0 1 1.06-1.06l1.72 1.72 3.97-3.97a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-.53.22Z"/></svg>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-black">민원/문의</h3>
                <p className="mt-2 text-blue-700">매장 이슈와 요청 사항을 접수하고 처리 현황을 추적합니다.</p>
              </div>
            </div>
          </section>

          {/* How it works */}
          <section className="container mx-auto px-6 py-16 md:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black">3단계로 시작하세요</h2>
              <p className="mt-4 text-blue-700">간단한 온보딩으로 바로 운영에 적용할 수 있어요.</p>
            </div>

            <ol className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
              <li className="rounded-2xl bg-white p-8 ring-1 ring-blue-100 shadow-sm">
                <div className="text-sm font-semibold text-blue-600">Step 1</div>
                <h3 className="mt-2 text-xl font-semibold text-black">재고 등록</h3>
                <p className="mt-2 text-blue-700">보유 중인 식재료와 수량을 입력합니다. CSV 업로드도 지원 예정.</p>
              </li>
              <li className="rounded-2xl bg-white p-8 ring-1 ring-purple-100 shadow-sm">
                <div className="text-sm font-semibold text-purple-600">Step 2</div>
                <h3 className="mt-2 text-xl font-semibold text-black">사용 기록</h3>
                <p className="mt-2 text-purple-700">입고/출고를 기록하면 통계와 알림이 자동으로 생성됩니다.</p>
              </li>
              <li className="rounded-2xl bg-white p-8 ring-1 ring-blue-100 shadow-sm">
                <div className="text-sm font-semibold text-blue-600">Step 3</div>
                <h3 className="mt-2 text-xl font-semibold text-black">추천 활용</h3>
                <p className="mt-2 text-blue-700">AI 메뉴 추천으로 재고 소진을 최적화하고 매출을 높입니다.</p>
              </li>
            </ol>
          </section>

          {/* Highlight band */}
          <section className="bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="container mx-auto px-6 py-14 text-center text-white">
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-white">재고 데이터를, 매출로 바꾸세요</h3>
              <p className="mt-3 text-blue-100">AI 추천과 자동 통계로 의사결정을 더 빠르고 정확하게.</p>
              <div className="mt-8">
                <a href="/login" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50">
                  지금 시작하기
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M3.75 12a.75.75 0 0 1 .75-.75h12.69l-3.72-3.72a.75.75 0 1 1 1.06-1.06l5 5a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 1 1-1.06-1.06l3.72-3.72H4.5A.75.75 0 0 1 3.75 12Z"/></svg>
                </a>
              </div>
            </div>
          </section>

          {/* FAQ or CTA */}
          <section className="container mx-auto px-6 py-16 md:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black">지금 바로 IMS를 경험하세요</h2>
              <p className="mt-4 text-blue-700">로그인하고 1분 만에 매장에 맞는 재고 관리 환경을 구성해보세요.</p>
              <div className="mt-8 flex items-center justify-center gap-3">
                <a href="/login" className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200">
                  로그인하고 시작하기
                </a>
                <a href="#" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-blue-700 ring-1 ring-blue-200 transition hover:bg-blue-50">
                  데모 살펴보기
                </a>
              </div>
            </div>
          </section>
        </main>
      </>
  )
}