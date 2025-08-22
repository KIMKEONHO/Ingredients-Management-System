"use client";

import { useState } from "react";
import { Bug, Plus, Clock, Mail } from "lucide-react";

export default function SupportPage() {
  const [formData, setFormData] = useState({
    category: "error",
    name: "",
    email: "",
    priority: "",
    subject: "",
    description: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API 연동 로직 구현
    console.log("민원 제출:", formData);
    alert("민원이 성공적으로 접수되었습니다.");
    
    // 폼 초기화
    setFormData({
      category: "error",
      name: "",
      email: "",
      priority: "",
      subject: "",
      description: ""
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        {/* 메인 카드 컨테이너 */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 text-center">
            <h1 className="text-3xl font-bold mb-4">고객 지원</h1>
            <p className="text-blue-100 text-lg">
              문의사항이나 요청사항을 남겨주세요. 빠른 시간 내에 답변드리겠습니다.
            </p>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="p-8">
            {/* 메인 폼 */}
            <div className="bg-gray-50 rounded-lg p-8 mb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 문의 카테고리 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    문의 카테고리
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category: "error" }))}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-colors ${
                        formData.category === "error"
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <Bug size={20} />
                      오류사항 문의
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category: "ingredient" }))}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-colors ${
                        formData.category === "ingredient"
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <Plus size={20} />
                      식재료 추가 요청
                    </button>
                  </div>
                </div>

                {/* 이름과 이메일 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      이름 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="이름을 입력해주세요"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      이메일 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="이메일을 입력해주세요"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* 우선순위 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    우선순위
                  </label>
                  <div className="flex gap-4">
                    {["낮음", "보통", "높음"].map((priority) => (
                      <button
                        key={priority}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, priority }))}
                        className={`px-6 py-3 rounded-lg border-2 transition-colors ${
                          formData.priority === priority
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {priority}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 제목 */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    제목 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="문의 제목을 입력해주세요"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* 상세 내용 */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    상세 내용 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder={
                        formData.category === "error"
                          ? "발생한 오류의 상황을 자세히 설명해주세요. 어떤 기능을 사용하던 중 문제가 발생했는지, 오류 메시지가 있었는지 등을 포함해 주세요."
                          : "추가하고 싶은 식재료에 대해 자세히 설명해주세요. 식재료명, 용도, 선호 브랜드 등을 포함해 주세요."
                      }
                      required
                      rows={6}
                      maxLength={500}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    <div className="absolute bottom-3 right-3 text-sm text-gray-400">
                      {formData.description.length}/500
                    </div>
                  </div>
                </div>

                {/* 제출 버튼 */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    문의 접수하기
                  </button>
                </div>
              </form>
            </div>

            {/* 추가 정보 섹션 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 응답 시간 */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="text-purple-600" size={24} />
                  <h3 className="text-lg font-semibold text-gray-900">응답 시간</h3>
                </div>
                <div className="space-y-2 text-gray-600">
                  <p>일반 문의: 1-2 영업일 내</p>
                  <p>긴급 문의: 당일 내</p>
                  <p>식재료 추가 요청: 3-5 영업일 내</p>
                </div>
              </div>

              {/* 연락처 */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="text-blue-600" size={24} />
                  <h3 className="text-lg font-semibold text-gray-900">연락처</h3>
                </div>
                <div className="space-y-2 text-gray-600">
                  <p>이메일: support@foodtracker.com</p>
                  <p>전화: 02-1234-5678</p>
                  <p>운영시간: 평일 09:00-18:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
