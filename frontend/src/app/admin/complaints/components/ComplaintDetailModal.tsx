'use client';

import { useState, useEffect } from 'react';
import { Complaint, Feedback } from '@/lib/backend/apiV1/complaintTypes';
import { createFeedback, getFeedback } from '@/lib/api/services/feedbackService';

interface ComplaintDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint | null;
  onFeedbackUpdate?: (complaintId: string, feedback: Feedback) => void;
}



export default function ComplaintDetailModal({ isOpen, onClose, complaint, onFeedbackUpdate }: ComplaintDetailModalProps) {
  const [feedbackData, setFeedbackData] = useState({
    assignee: '',
    content: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // 모달이 열릴 때 피드백 데이터 초기화
  useEffect(() => {
    if (isOpen && complaint) {
      const existingFeedback = complaint.feedback || {
        assignee: '관리자 박지원',
        content: '',
        createdAt: '',
        updatedAt: ''
      };
      
      setFeedbackData({
        assignee: existingFeedback.assignee || '관리자 박지원',
        content: existingFeedback.content || ''
      });
    }
  }, [isOpen, complaint]);

  const handleSave = async () => {
    if (!complaint || !feedbackData.assignee.trim() || !feedbackData.content.trim()) {
      alert('담당자명과 피드백 내용을 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const idNumber = parseInt(complaint.id.split('-')[1]);
      
      // 피드백 생성 또는 수정
      await createFeedback(idNumber, {
        title: `피드백 - ${complaint.title}`,
        content: feedbackData.content
      });

      // 로컬 상태 업데이트
      if (onFeedbackUpdate) {
        const newFeedback: Feedback = {
          assignee: feedbackData.assignee,
          content: feedbackData.content,
          createdAt: complaint.feedback?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        onFeedbackUpdate(complaint.id, newFeedback);
      }

      alert('피드백이 성공적으로 저장되었습니다.');
    } catch (error) {
      console.error('피드백 저장 오류:', error);
      alert('피드백 저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !complaint) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">피드백 수정</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 모달 내용 */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* 문의 내용 섹션 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">문의 내용</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 왼쪽 컬럼 */}
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">작성자:</span>
                    <span className="ml-2 text-sm text-gray-900">{complaint.userName || '알 수 없음'}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">카테고리:</span>
                    <span className="ml-2 text-sm text-gray-900">{complaint.category}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">제목:</span>
                    <span className="ml-2 text-sm text-gray-900 bg-blue-50 px-2 py-1 rounded">{complaint.title}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">내용:</span>
                    <div className="mt-1 text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                      {complaint.content || '내용이 없습니다.'}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">작성일:</span>
                    <span className="ml-2 text-sm text-gray-900">{complaint.submissionDate}</span>
                  </div>
                </div>

                {/* 오른쪽 컬럼 */}
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">긴급도:</span>
                    <span className="ml-2 text-sm text-gray-900">
                      {complaint.daysLeft !== undefined && complaint.daysLeft <= 3 && complaint.daysLeft >= 0 ? '높음' : '보통'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 기존 피드백 섹션 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">기존 피드백</h3>
              {complaint.feedback && complaint.feedback.content ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium text-gray-700">관리자:</span>
                      <span className="ml-2 text-sm font-medium text-gray-900">{complaint.feedback.assignee}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {complaint.feedback.createdAt ? new Date(complaint.feedback.createdAt).toLocaleString('ko-KR') : '날짜 없음'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">피드백 내용:</span>
                    <div className="mt-1 text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                      {complaint.feedback.content}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">아직 피드백이 작성되지 않았습니다.</p>
                  <p className="text-gray-400 text-xs mt-1">관리자가 피드백을 작성해주세요.</p>
                </div>
              )}
            </div>

            {/* 피드백 작성 섹션 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  담당자명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={feedbackData.assignee}
                  onChange={(e) => setFeedbackData(prev => ({ ...prev, assignee: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="담당자명을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  피드백 내용 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <textarea
                    value={feedbackData.content}
                    onChange={(e) => setFeedbackData(prev => ({ ...prev, content: e.target.value }))}
                    rows={6}
                    maxLength={1000}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="피드백 내용을 입력하세요"
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                    {feedbackData.content.length}/1000
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 모달 푸터 */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            닫기
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !feedbackData.assignee.trim() || !feedbackData.content.trim()}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}
