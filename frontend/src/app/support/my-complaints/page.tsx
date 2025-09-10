"use client";

import { useState, useEffect } from "react";
import { List, FileText, Clock, CheckCircle, AlertCircle, MessageSquare, Calendar, XCircle } from "lucide-react";
import Link from "next/link";
import { 
  ComplaintService, 
  ComplaintDetailResponseDto, 
  ComplaintStatus, 
  ComplaintStatusUtils,
  RsData 
} from "@/lib/api/services/complaintService";

export default function MyComplaintsPage() {
  const [complaints, setComplaints] = useState<ComplaintDetailResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  const fetchMyComplaints = async () => {
    try {
      setLoading(true);
      // ComplaintService를 사용하여 내 민원 목록을 가져오는 요청
      const response = await ComplaintService.getMyComplaints();
      
      // 직접 배열로 받아오는 데이터 처리
      console.log("API 응답:", response);
      if (response && Array.isArray(response)) {
        console.log("민원 데이터:", response);
        console.log("민원 데이터 타입:", typeof response);
        console.log("민원 데이터 길이:", response.length);
        if (response.length > 0) {
          console.log("첫 번째 민원 데이터:", response[0]);
        }
        setComplaints(response);
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

  const getStatusInfo = (status: string) => {
    // 백엔드에서 받은 상태를 프론트엔드 상태로 매핑
    let frontendStatus: ComplaintStatus;
    switch (status) {
      case 'PENDING':
        frontendStatus = ComplaintStatus.PENDING;
        break;
      case 'IN_PROGRESS':
        frontendStatus = ComplaintStatus.IN_PROGRESS;
        break;
      case 'COMPLETED':
        frontendStatus = ComplaintStatus.COMPLETED;
        break;
      case 'REJECTED':
        frontendStatus = ComplaintStatus.REJECTED;
        break;
      default:
        frontendStatus = ComplaintStatus.PENDING;
    }
    
    const statusLabel = ComplaintStatusUtils.getStatusLabel(frontendStatus);
    const statusColor = ComplaintStatusUtils.getStatusColor(frontendStatus);
    
    // 상태에 따른 아이콘 매핑
    let icon;
    switch (status) {
      case 'PENDING':
        icon = Clock;
        break;
      case 'IN_PROGRESS':
        icon = Clock;
        break;
      case 'COMPLETED':
        icon = CheckCircle;
        break;
      case 'REJECTED':
        icon = XCircle;
        break;
      default:
        icon = AlertCircle;
    }
    
    return { 
      icon, 
      color: statusColor.text, 
      bgColor: statusColor.bg, 
      label: statusLabel 
    };
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
                {complaints.map((complaint) => {
                  const StatusIcon = getStatusInfo(complaint.status || 'PENDING').icon;
                  const statusColor = getStatusInfo(complaint.status || 'PENDING').color;
                  const statusBgColor = getStatusInfo(complaint.status || 'PENDING').bgColor;

                  // createdAt을 한국어 날짜 형식으로 변환
                  const formatDate = (dateString: string | undefined) => {
                    if (!dateString) return '날짜 정보 없음';
                    try {
                      const date = new Date(dateString);
                      return date.toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                    } catch (error) {
                      return '날짜 형식 오류';
                    }
                  };

                  return (
                    <div key={complaint.complaintId} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      {/* 헤더 */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{complaint.title || '제목 없음'}</h3>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusBgColor} ${statusColor}`}>
                              <StatusIcon size={16} />
                              {getStatusInfo(complaint.status || 'PENDING').label}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar size={16} />
                              접수일: {formatDate(complaint.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 내용 */}
                      <div className="mb-4">
                        <p className="text-gray-700 leading-relaxed">{complaint.content || '내용이 없습니다.'}</p>
                      </div>

                      {/* 상태별 안내 메시지 */}
                      {complaint.status === 'COMPLETED' && (
                        <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="font-medium text-green-800">처리 완료</span>
                          </div>
                          <p className="text-green-700 text-sm">
                            민원이 성공적으로 처리되었습니다.
                          </p>
                        </div>
                      )}

                      {complaint.status === 'REJECTED' && (
                        <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
                          <div className="flex items-center gap-2 mb-2">
                            <XCircle className="h-5 w-5 text-red-600" />
                            <span className="font-medium text-red-800">처리 거부</span>
                          </div>
                          <p className="text-red-700 text-sm">
                            민원이 거부되었습니다. 자세한 사유는 관리자에게 문의해주세요.
                          </p>
                        </div>
                      )}

                      {/* 액션 버튼 */}
                      <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
                        <Link
                          href={`/support/my-complaints/${complaint.complaintId}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                        >
                          상세보기
                        </Link>
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{complaints.length}</div>
                    <div className="text-sm text-gray-600">전체 민원</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {complaints.filter(c => c.status === 'COMPLETED').length}
                    </div>
                    <div className="text-sm text-gray-600">완료</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {complaints.filter(c => c.status === 'IN_PROGRESS').length}
                    </div>
                    <div className="text-sm text-gray-600">진행 중</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">
                      {complaints.filter(c => c.status === 'PENDING').length}
                    </div>
                    <div className="text-sm text-gray-600">보류</div>
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
