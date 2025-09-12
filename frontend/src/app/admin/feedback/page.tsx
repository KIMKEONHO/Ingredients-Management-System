'use client';

import { useState, useEffect } from 'react';
import { ComplaintFeedbackResponseDto, getAllFeedback, updateFeedback, deleteFeedback } from '@/lib/api/services/feedbackService';
import PageHeader from '@/app/components/ui/PageHeader';
import SectionCard from '@/app/components/ui/SectionCard';
import AdminSidebar from '../components/sidebar';

export default function FeedbackListPage() {
  const [feedbacks, setFeedbacks] = useState<ComplaintFeedbackResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<ComplaintFeedbackResponseDto | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<ComplaintFeedbackResponseDto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 피드백 목록 조회
  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllFeedback();
      setFeedbacks(data);
    } catch (err) {
      console.error('피드백 목록 조회 오류:', err);
      setError('피드백 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // 피드백 상세 보기
  const handleViewFeedback = (feedback: ComplaintFeedbackResponseDto) => {
    setSelectedFeedback(feedback);
    setIsDetailModalOpen(true);
  };

  // 피드백 수정
  const handleEditFeedback = (feedback: ComplaintFeedbackResponseDto) => {
    setEditingFeedback(feedback);
    setIsEditModalOpen(true);
  };

  // 피드백 삭제
  const handleDeleteFeedback = async (feedbackId: number) => {
    if (!confirm('정말로 이 피드백을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteFeedback(feedbackId);
      alert('피드백이 삭제되었습니다.');
      fetchFeedbacks(); // 목록 새로고침
    } catch (err) {
      console.error('피드백 삭제 오류:', err);
      alert('피드백 삭제에 실패했습니다.');
    }
  };

  // 검색 필터링
  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesSearch = 
      (feedback.title && feedback.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (feedback.content && feedback.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (feedback.responderNickname && feedback.responderNickname.toLowerCase().includes(searchTerm.toLowerCase())) ||
      feedback.id?.toString().includes(searchTerm);
    return matchesSearch;
  });

  // 페이징 계산
  const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFeedbacks = filteredFeedbacks.slice(startIndex, endIndex);

  // 페이지 변경
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 검색어 변경 시 첫 페이지로 이동
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // 날짜 포맷팅
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <PageHeader title="피드백 관리" />
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">피드백 목록을 불러오는 중...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <PageHeader title="피드백 관리" />
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <p className="text-red-600 text-lg">{error}</p>
                <button
                  onClick={fetchFeedbacks}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  다시 시도
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <PageHeader title="피드백 관리" />
          
          {/* Main Card Container */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Feedback List Card */}
            <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200">
              {/* Search and Filter */}
              <div className="px-6 py-4 border-b border-gray-200 bg-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-700">
                      총 {filteredFeedbacks.length}개의 피드백
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 max-w-md">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          placeholder="피드백 제목, 내용, 작성자 검색..."
                          value={searchTerm}
                          onChange={(e) => handleSearchChange(e.target.value)}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto bg-white" style={{ minHeight: '700px', maxHeight: '800px' }}>
                {filteredFeedbacks.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="text-center">
                      <div className="text-gray-400 mb-2">📝</div>
                      <p className="text-gray-600">피드백이 없습니다.</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col">
                    <div className="overflow-y-auto flex-1">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              제목
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              민원 ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              작성자
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              작성일
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              수정일
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              작업
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {currentFeedbacks.map((feedback) => (
                            <tr key={feedback.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                #{feedback.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                  {feedback.title || '-'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                C2024-{String(feedback.complaintId || 0).padStart(4, '0')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {feedback.responderNickname || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(feedback.createAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(feedback.modifiedAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleViewFeedback(feedback)}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    보기
                                  </button>
                                  <button
                                    onClick={() => handleEditFeedback(feedback)}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    수정
                                  </button>
                                  <button
                                    onClick={() => handleDeleteFeedback(feedback.id!)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    삭제
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 bg-white rounded-b-lg">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    {startIndex + 1}-{Math.min(endIndex, filteredFeedbacks.length)} of {filteredFeedbacks.length} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 피드백 상세 보기 모달 */}
      {isDetailModalOpen && selectedFeedback && (
        <FeedbackDetailModal
          feedback={selectedFeedback}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedFeedback(null);
          }}
        />
      )}

      {/* 피드백 수정 모달 */}
      {isEditModalOpen && editingFeedback && (
        <FeedbackEditModal
          feedback={editingFeedback}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingFeedback(null);
          }}
          onSave={() => {
            setIsEditModalOpen(false);
            setEditingFeedback(null);
            fetchFeedbacks();
          }}
        />
      )}
    </div>
  );
}

// 피드백 상세 보기 모달 컴포넌트
interface FeedbackDetailModalProps {
  feedback: ComplaintFeedbackResponseDto;
  isOpen: boolean;
  onClose: () => void;
}

function FeedbackDetailModal({ feedback, isOpen, onClose }: FeedbackDetailModalProps) {
  if (!isOpen) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">피드백 상세 정보</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">닫기</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">피드백 ID</label>
              <p className="mt-1 text-sm text-gray-900">#{feedback.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">민원 ID</label>
              <p className="mt-1 text-sm text-gray-900">C2024-{String(feedback.complaintId || 0).padStart(4, '0')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">작성자</label>
              <p className="mt-1 text-sm text-gray-900">{feedback.responderNickname || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">작성일</label>
              <p className="mt-1 text-sm text-gray-900">{formatDate(feedback.createAt)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">수정일</label>
              <p className="mt-1 text-sm text-gray-900">{formatDate(feedback.modifiedAt)}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">제목</label>
            <p className="mt-1 text-sm text-gray-900">{feedback.title || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">내용</label>
            <div className="mt-1 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{feedback.content || '-'}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

// 피드백 수정 모달 컴포넌트
interface FeedbackEditModalProps {
  feedback: ComplaintFeedbackResponseDto;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

function FeedbackEditModal({ feedback, isOpen, onClose, onSave }: FeedbackEditModalProps) {
  const [formData, setFormData] = useState({
    title: feedback.title || '',
    content: feedback.content || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      await updateFeedback(feedback.id!, {
        title: formData.title,
        content: formData.content
      });
      alert('피드백이 수정되었습니다.');
      onSave();
    } catch (err) {
      console.error('피드백 수정 오류:', err);
      alert('피드백 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">피드백 수정</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">닫기</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">제목</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="피드백 제목을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">내용</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="피드백 내용을 입력하세요"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}