"use client";

import { useState, useEffect } from "react";
import { List, FileText, Clock, CheckCircle, AlertCircle, MessageSquare, Calendar } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import Link from "next/link";

interface Complaint {
  complaintId: number;
  title: string;
  content: string;
  // 백엔드에서 제공하지 않는 필드들은 임시로 기본값 설정
  categoryCode?: number;
  status?: string;
  createdAt?: string;
  answer?: string;
  answeredAt?: string;
}

interface RsData<T> {
  resultCode: string;
  msg: string;
  data: T;
}

export default function MyComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  const fetchMyComplaints = async () => {
    try {
      setLoading(true);
      // 백엔드 API에서 내 민원 목록을 가져오는 요청
      const response = await apiClient.get<RsData<Complaint[]>>('/api/v1/complaints/users');
      
      // RsData 구조에 맞춰 데이터 추출
      console.log("API 응답:", response);
      if (response && response.data) {
        console.log("민원 데이터:", response.data);
        setComplaints(response.data);
      } else {
        console.log("민원 데이터가 없습니다");
        setComplaints([]);
      }
    } catch (error: unknown) {
      console.error("민원 목록 조회 오류:", error);
      
      // HTTP 에러 응답 타입 가드
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error as { 
          response?: { 
            status?: number; 
            statusText?: string; 
            data?: unknown; 
          } 
        };
        
        // 401, 403 에러인 경우 인증 문제
        if (errorResponse.response?.status === 401 || errorResponse.response?.status === 403) {
          setError("로그인이 필요합니다. 다시 로그인해주세요.");
        } else if (errorResponse.response?.status === 404) {
          // 404 에러인 경우 민원이 없는 것으로 처리
          setComplaints([]);
          setError(null);
        } else {
          setError("민원 목록을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        }
      } else {
        setError("민원 목록을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string | undefined) => {
    // 백엔드 상태 코드에 따른 매핑
    switch (status) {
      case "1": // 접수완료
        return { icon: Clock, color: "text-blue-600", bgColor: "bg-blue-50", label: "접수완료" };
      case "2": // 처리중
        return { icon: Clock, color: "text-yellow-600", bgColor: "bg-yellow-50", label: "처리중" };
      case "3": // 답변완료
        return { icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-50", label: "답변완료" };
      default:
        return { icon: AlertCircle, color: "text-gray-600", bgColor: "bg-gray-50", label: status || "알 수 없음" };
    }
  };

  const getCategoryName = (categoryCode: number) => {
    return categoryCode === 1 ? "식재료 추가 요청" : "오류사항 문의";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">민원 목록을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-8 text-center">
              <h1 className="text-3xl font-bold mb-4">오류 발생</h1>
              <p className="text-red-100 text-lg">
                민원 목록을 불러오는 중 문제가 발생했습니다.
              </p>
            </div>

            {/* 탭 네비게이션 */}
            <div className="bg-white border-b border-gray-200">
              <div className="flex justify-center">
                <div className="flex space-x-1 p-2">
                  <Link
                    href="/support"
                    className="flex items-center gap-2 px-6 py-3 rounded-lg text-gray-600 hover:bg-gray-100 font-medium transition-colors"
                  >
                    <FileText size={20} />
                    민원 작성
                  </Link>
                  <Link
                    href="/support/my-complaints"
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-red-600 text-white font-medium transition-colors"
                  >
                    <List size={20} />
                    내 민원 목록
                  </Link>
                </div>
              </div>
            </div>

            {/* 오류 내용 */}
            <div className="p-8 text-center">
              <div className="bg-red-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-12 w-12 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-red-800 mb-4">{error}</h3>
              <div className="space-y-3">
                <button
                  onClick={fetchMyComplaints}
                  className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  다시 시도
                </button>
                <div className="text-sm text-gray-500">
                  문제가 지속되면 고객센터에 문의해주세요
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        {/* 메인 카드 컨테이너 */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-8 text-center">
            <h1 className="text-3xl font-bold mb-4">내 민원 목록</h1>
            <p className="text-green-100 text-lg">
              작성하신 민원의 처리 상태와 답변을 확인하실 수 있습니다.
            </p>
          </div>

          {/* 탭 네비게이션 */}
          <div className="bg-white border-b border-gray-200">
            <div className="flex justify-center">
              <div className="flex space-x-1 p-2">
                <Link
                  href="/support"
                  className="flex items-center gap-2 px-6 py-3 rounded-lg text-gray-600 hover:bg-gray-100 font-medium transition-colors"
                >
                  <FileText size={20} />
                  민원 작성
                </Link>
                <Link
                  href="/support/my-complaints"
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white font-medium transition-colors"
                >
                  <List size={20} />
                  내 민원 목록
                </Link>
              </div>
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="p-8">
                         {complaints.length === 0 ? (
               <div className="text-center py-16">
                 <div className="bg-blue-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                   <List className="h-12 w-12 text-blue-500" />
                 </div>
                 <h3 className="text-2xl font-semibold text-gray-800 mb-3">아직 작성된 민원이 없습니다</h3>
                 <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                   문의사항이나 개선 요청이 있으시다면<br />
                   언제든지 민원을 작성해주세요
                 </p>
                 <div className="space-y-3">
                   <Link
                     href="/support"
                     className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
                   >
                     <FileText size={24} />
                     첫 번째 민원 작성하기
                   </Link>
                   <div className="text-sm text-gray-500">
                     빠른 답변을 위해 상세한 내용을 작성해주세요
                   </div>
                 </div>
               </div>
            ) : (
              <div className="space-y-6">
                                 {complaints.map((complaint, index) => {
                   // 백엔드에서 제공하지 않는 필드들에 기본값 설정
                   const status = complaint.status || "1"; // 기본값: 접수완료
                   const categoryCode = complaint.categoryCode || 2; // 기본값: 오류사항 문의
                   const createdAt = complaint.createdAt || new Date(Date.now() - index * 86400000).toISOString(); // 기본값: 최근 날짜부터 순차적으로
                   
                   const StatusIcon = getStatusInfo(status).icon;
                   const statusColor = getStatusInfo(status).color;
                   const statusBgColor = getStatusInfo(status).bgColor;

                   return (
                     <div key={complaint.complaintId} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      {/* 헤더 */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{complaint.title}</h3>
                                                       <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusBgColor} ${statusColor}`}>
                             <StatusIcon size={16} />
                             {getStatusInfo(complaint.status).label}
                           </span>
                          </div>
                                                     <div className="flex items-center gap-4 text-sm text-gray-500">
                             <span className="flex items-center gap-1">
                               <Calendar size={16} />
                               {formatDate(createdAt)}
                             </span>
                             <span className="flex items-center gap-1">
                               <MessageSquare size={16} />
                               {getCategoryName(categoryCode)}
                             </span>
                           </div>
                        </div>
                      </div>

                      {/* 내용 */}
                      <div className="mb-4">
                        <p className="text-gray-700 leading-relaxed">{complaint.content}</p>
                      </div>

                                             {/* 답변 */}
                       {complaint.answer && (
                         <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                           <div className="flex items-center gap-2 mb-2">
                             <CheckCircle className="h-5 w-5 text-green-600" />
                             <span className="font-medium text-green-800">답변</span>
                             {complaint.answeredAt && (
                               <span className="text-sm text-gray-500">
                                 {formatDate(complaint.answeredAt)}
                               </span>
                             )}
                           </div>
                           <p className="text-gray-700">{complaint.answer}</p>
                         </div>
                       )}
                       
                       {/* 백엔드에서 제공하지 않는 필드들에 대한 안내 */}
                       {!complaint.status && (
                         <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500 mt-4">
                           <div className="flex items-center gap-2 mb-2">
                             <AlertCircle className="h-5 w-5 text-yellow-600" />
                             <span className="font-medium text-yellow-800">처리 상태</span>
                           </div>
                           <p className="text-yellow-700 text-sm">
                             현재 처리 상태 정보를 확인할 수 없습니다. 관리자에게 문의해주세요.
                           </p>
                         </div>
                       )}

                      {/* 액션 버튼 */}
                      <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
                          상세보기
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 통계 정보 */}
            {complaints.length > 0 && (
              <div className="mt-8 bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">민원 통계</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{complaints.length}</div>
                    <div className="text-sm text-gray-600">전체 민원</div>
                  </div>
                                     <div className="text-center">
                     <div className="text-2xl font-bold text-green-600">
                       {complaints.filter(c => c.status === "3").length}
                     </div>
                     <div className="text-sm text-gray-600">답변완료</div>
                   </div>
                   <div className="text-center">
                     <div className="text-2xl font-bold text-yellow-600">
                       {complaints.filter(c => c.status === "2" || c.status === "1").length}
                     </div>
                     <div className="text-sm text-gray-600">처리중</div>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
