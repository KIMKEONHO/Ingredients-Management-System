"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, Clock, CheckCircle, AlertCircle, MessageSquare, Calendar, XCircle, User } from "lucide-react";
import Link from "next/link";
import { 
  ComplaintService, 
  ComplaintStatus, 
  ComplaintStatusUtils
} from "@/lib/api/services/complaintService";
import { ComplaintDetailResponseDto } from "@/lib/backend/apiV1/complaintTypes";
import { FeedbackService, ComplaintFeedbackResponseDto } from "@/lib/api/services/feedbackService";

export default function ComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const complaintId = params.id as string;
  
  const [complaint, setComplaint] = useState<ComplaintDetailResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<ComplaintFeedbackResponseDto | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  useEffect(() => {
    if (complaintId) {
      fetchComplaintDetail();
    }
  }, [complaintId]);

  // 민원 정보가 로드된 후 피드백 조회
  useEffect(() => {
    if (complaint && complaint.complaintId) {
      fetchFeedback();
    }
  }, [complaint]);

  const fetchComplaintDetail = async () => {
    try {
      setLoading(true);
      console.log("민원 상세 조회 시작, ID:", complaintId);
      const response = await ComplaintService.getComplaint(parseInt(complaintId));
      console.log("민원 상세 응답:", response);
      console.log("민원 내용:", response?.content);
      
      if (response) {
        setComplaint(response);
        console.log("민원 데이터 설정 완료:", response);
      } else {
        console.log("민원 응답이 null입니다.");
        setError("민원을 찾을 수 없습니다.");
      }
    } catch (error: unknown) {
      console.error("민원 상세 조회 오류:", error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error as { 
          response?: { 
            status?: number; 
            statusText?: string; 
            data?: unknown; 
          } 
        };
        
        if (errorResponse.response?.status === 404) {
          setError("해당 민원을 찾을 수 없습니다.");
        } else if (errorResponse.response?.status === 401 || errorResponse.response?.status === 403) {
          setError("로그인이 필요합니다. 다시 로그인해주세요.");
        } else {
          setError("민원을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        }
      } else {
        setError("민원을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async () => {
    if (!complaint?.complaintId) return;
    
    try {
      setFeedbackLoading(true);
      console.log("피드백 조회 시작, 민원 ID:", complaint.complaintId);
      const feedbackResponse = await FeedbackService.getFeedback(complaint.complaintId);
      console.log("피드백 응답:", feedbackResponse);
      
      setFeedback(feedbackResponse);
    } catch (error) {
      console.error("피드백 조회 오류:", error);
      // 피드백이 없는 경우는 정상적인 상황이므로 에러로 처리하지 않음
      setFeedback(null);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const getStatusInfo = (status: string | null) => {
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
      case null:
      case undefined:
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
      case null:
      case undefined:
      default:
        icon = Clock; // null인 경우 PENDING으로 처리
    }
    
    return { 
      icon, 
      color: statusColor.text, 
      bgColor: statusColor.bg, 
      label: statusLabel 
    };
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">민원 상세 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-8 text-center">
              <h1 className="text-3xl font-bold mb-4">오류 발생</h1>
              <p className="text-red-100 text-lg">
                민원 상세 정보를 불러오는 중 문제가 발생했습니다.
              </p>
            </div>

            {/* 오류 내용 */}
            <div className="p-8 text-center">
              <div className="bg-red-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-12 w-12 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-red-800 mb-4">{error}</h3>
              <div className="space-y-3">
                <button
                  onClick={fetchComplaintDetail}
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

  if (!complaint) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">민원을 찾을 수 없습니다</h1>
            <p className="text-gray-600 mb-8">요청하신 민원이 존재하지 않거나 삭제되었습니다.</p>
            <Link
              href="/support/my-complaints"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              민원 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const StatusIcon = getStatusInfo(complaint.status).icon;
  const statusColor = getStatusInfo(complaint.status).color;
  const statusBgColor = getStatusInfo(complaint.status).bgColor;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        {/* 메인 카드 컨테이너 */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-blue-100 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                뒤로가기
              </button>
              <Link
                href="/support/my-complaints"
                className="flex items-center gap-2 text-blue-100 hover:text-white transition-colors"
              >
                <FileText size={20} />
                민원 목록
              </Link>
            </div>
            <h1 className="text-3xl font-bold mb-2">민원 상세보기</h1>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="p-8">
            {/* 민원 정보 카드 */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mb-6">
              {/* 제목과 상태 */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {complaint.title || '제목 없음'}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={16} />
                      접수일: {formatDate(complaint.createdAt)}
                    </span>
                    {complaint.userName && (
                      <span className="flex items-center gap-1">
                        <User size={16} />
                        작성자: {complaint.userName}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium ${statusBgColor} ${statusColor}`}>
                  <StatusIcon size={16} />
                  {getStatusInfo(complaint.status).label}
                </span>
              </div>

              {/* 내용 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">민원 내용</h3>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {complaint.content || '내용이 없습니다.'}
                  </p>
                </div>
              </div>

              {/* 상태별 안내 메시지 */}
              {(complaint.status === 'COMPLETED') && (
                <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">처리 완료</span>
                  </div>
                  <p className="text-blue-700 text-sm">
                    민원이 성공적으로 처리되었습니다.
                  </p>
                </div>
              )}

              {complaint.status === 'REJECTED' && (
                <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-red-800">처리 거부</span>
                  </div>
                  <p className="text-red-700 text-sm">
                    민원이 거부되었습니다. 자세한 사유는 관리자에게 문의해주세요.
                  </p>
                </div>
              )}

              {complaint.status === 'IN_PROGRESS' && (
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-800">진행중</span>
                  </div>
                  <p className="text-blue-700 text-sm">
                    민원이 현재 진행 중입니다. 조금만 기다려주세요.
                  </p>
                </div>
              )}

              {complaint.status === 'PENDING' && (
                <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">보류</span>
                  </div>
                  <p className="text-yellow-700 text-sm">
                    민원이 보류 상태입니다. 검토 후 처리 예정입니다.
                  </p>
                </div>
              )}
            </div>

            {/* 피드백 섹션 */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                관리자 피드백
              </h3>
              
              {feedbackLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">피드백을 불러오는 중...</span>
                </div>
              ) : feedback ? (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">담당자:</span>
                      <span className="text-sm text-gray-900">{feedback.responderNickname || '관리자'}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">작성일:</span>
                      <span className="text-sm text-gray-900">
                        {feedback.createAt ? new Date(feedback.createAt).toLocaleDateString('ko-KR') : '알 수 없음'}
                      </span>
                    </div>
                  </div>
                  <div className="border-t pt-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">피드백 내용:</h4>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {feedback.content || '피드백 내용이 없습니다.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg p-4 text-center">
                  <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">아직 관리자 피드백이 없습니다.</p>
                  <p className="text-sm text-gray-400 mt-1">처리 완료 후 피드백을 확인할 수 있습니다.</p>
                </div>
              )}
            </div>

            {/* 액션 버튼들 */}
            <div className="flex justify-between items-center">
              <Link
                href="/support/my-complaints"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft size={16} />
                민원 목록으로 돌아가기
              </Link>
              
              <div className="flex gap-3">
                <Link
                  href="/support"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  새 민원 작성
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
