"use client";

import { useState } from "react";
import { Bug, Plus, Mail, List, FileText } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import Link from "next/link";
import { AuthGuard } from "@/lib/auth/authGuard";

export default function SupportPage() {
  const [formData, setFormData] = useState({
    category: "error",
    title: "",
    content: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // 백엔드 DTO에 맞춰 데이터 변환
      const requestData = {
        title: formData.title,
        content: formData.content,
        categoryCode: formData.category === "error" ? 2 : 1 // 오류사항=2, 식재료요청=1
      };

      const response = await apiClient.post('/api/v1/complaints/', requestData);
      
      alert("민원이 성공적으로 접수되었습니다.");
      
      // 폼 초기화
      setFormData({
        category: "error",
        title: "",
        content: ""
      });
    } catch (error) {
      console.error("민원 접수 오류:", error);
      alert("민원 접수 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <AuthGuard>
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

            {/* 탭 네비게이션 */}
            <div className="bg-white border-b border-gray-200">
              <div className="flex justify-center">
                <div className="flex space-x-1 p-2">
                  <Link
                    href="/support"
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white font-medium transition-colors"
                  >
                    <FileText size={20} />
                    민원 작성
                  </Link>
                  <Link
                    href="/support/my-complaints"
                    className="flex items-center gap-2 px-6 py-3 rounded-lg text-gray-600 hover:bg-gray-100 font-medium transition-colors"
                  >
                    <List size={20} />
                    내 민원 목록
                  </Link>
                </div>
              </div>
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

                  {/* 제목 */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      제목 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="문의 제목을 입력해주세요"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* 상세 내용 */}
                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                      상세 내용 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <textarea
                        id="content"
                        name="content"
                        value={formData.content}
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
                        {formData.content.length}/500
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
                    <Mail className="text-purple-600" size={24} />
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
    </AuthGuard>
  );
}
