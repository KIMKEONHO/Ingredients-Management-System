export default function Home() {
  console.log('FRONT_BASE_URL', process.env.NEXT_PUBLIC_FRONT_BASE_URL)
  console.log('API_BASE_URL', process.env.NEXT_PUBLIC_API_BASE_URL)

  return (
      <>
          {/* 배너 영역 */}
          <section className="relative">
              <div className="w-full h-96 overflow-hidden">
                  <img src="/images/korean-food.jpg" alt="한국 음식" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center">
                      <div className="container mx-auto px-6">
                          <div className="text-white">
                              <h1 className="text-4xl font-bold mb-2">전통 맛집 탐방</h1>
                              <p className="text-xl">숨겨진 맛집을 찾아서</p>
                          </div>
                      </div>
                  </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 flex justify-center mb-4">
                  <div className="flex space-x-2">
                      <button className="w-2 h-2 rounded-full bg-white bg-opacity-50"></button>
                      <button className="w-2 h-2 rounded-full bg-white"></button>
                      <button className="w-2 h-2 rounded-full bg-white bg-opacity-50"></button>
                  </div>
              </div>
          </section>

          {/* 최신 게시물 영역 */}
          <section className="container mx-auto py-10 px-4">
              <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold">최신 게시물</h2>
                  <div className="flex">
                      <select className="mr-2 px-3 py-2 border rounded-md">
                          <option>최신순</option>
                          <option>전체</option>
                      </select>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* 게시물 1 */}
                  <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                      <img src="/images/cafe.jpg" alt="서울의 숨은 카페" className="w-full h-48 object-cover" />
                      <div className="p-4">
                          <h3 className="font-bold text-lg mb-2">서울의 숨은 카페</h3>
                          <p className="text-sm text-gray-600 mb-3">
                              조용히 호칭만의 시간을 보내기 좋은 카페를 소개합니다...
                          </p>
                          <div className="flex justify-between items-center text-sm text-gray-500">
                              <span>2024.02.15</span>
                              <span className="flex items-center">
                                  <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={1.5}
                                      stroke="currentColor"
                                      className="w-4 h-4 mr-1"
                                  >
                                      <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                                      />
                                      <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                      />
                                  </svg>
                                  238
                              </span>
                          </div>
                      </div>
                  </div>

                  {/* 게시물 2 */}
                  <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                      <img src="/images/salad.jpg" alt="맛있는 집밥 레시피" className="w-full h-48 object-cover" />
                      <div className="p-4">
                          <h3 className="font-bold text-lg mb-2">맛있는 집밥 레시피</h3>
                          <p className="text-sm text-gray-600 mb-3">누구나 쉽게 따라할 수 있는 건강한 한식 레시피</p>
                          <div className="flex justify-between items-center text-sm text-gray-500">
                              <span>2024.02.14</span>
                              <span className="flex items-center">
                                  <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={1.5}
                                      stroke="currentColor"
                                      className="w-4 h-4 mr-1"
                                  >
                                      <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                                      />
                                      <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                      />
                                  </svg>
                                  156
                              </span>
                          </div>
                      </div>
                  </div>

                  {/* 게시물 3 */}
                  <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                      <img src="/images/jeju.jpg" alt="제주도 여행 코스" className="w-full h-48 object-cover" />
                      <div className="p-4">
                          <h3 className="font-bold text-lg mb-2">제주도 여행 코스</h3>
                          <p className="text-sm text-gray-600 mb-3">로컬이 추천하는 제주도의 숨은 명소들...</p>
                          <div className="flex justify-between items-center text-sm text-gray-500">
                              <span>2024.02.13</span>
                              <span className="flex items-center">
                                  <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={1.5}
                                      stroke="currentColor"
                                      className="w-4 h-4 mr-1"
                                  >
                                      <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                                      />
                                      <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                      />
                                  </svg>
                                  412
                              </span>
                          </div>
                      </div>
                  </div>

                  {/* 게시물 4 */}
                  <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                      <img src="/images/jeju.jpg" alt="제주도 여행 코스" className="w-full h-48 object-cover" />
                      <div className="p-4">
                          <h3 className="font-bold text-lg mb-2">제주도 여행 코스</h3>
                          <p className="text-sm text-gray-600 mb-3">로컬이 추천하는 제주도의 숨은 명소들...</p>
                          <div className="flex justify-between items-center text-sm text-gray-500">
                              <span>2024.02.13</span>
                              <span className="flex items-center">
                                  <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={1.5}
                                      stroke="currentColor"
                                      className="w-4 h-4 mr-1"
                                  >
                                      <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                                      />
                                      <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                      />
                                  </svg>
                                  412
                              </span>
                          </div>
                      </div>
                  </div>
              </div>
          </section>
      </>
  )
}