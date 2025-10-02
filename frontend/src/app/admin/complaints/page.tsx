'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '../components/sidebar';
import AdminGuard from '@/lib/auth/adminGuard';
import { getAllComplaints, updateComplaintStatus, getStatusCodeFromStatus } from '@/lib/api/services/complaintService';
import { Complaint, Feedback } from '@/lib/backend/apiV1/complaintTypes';
import ComplaintDetailModal from './components/ComplaintDetailModal';




const getDeadlineDisplay = (deadline: string, daysLeft?: number) => {
  if (daysLeft !== undefined && daysLeft <= 3 && daysLeft >= 0) {
    const color = daysLeft === 0 ? 'text-red-600' : 
                  daysLeft === 1 ? 'text-red-600' : 
                  daysLeft === 2 ? 'text-orange-600' : 'text-orange-600';
    return (
      <span className={color}>
        {deadline} (D-{daysLeft})
      </span>
    );
  }
  return deadline;
};

function ComplaintManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedComplaints, setSelectedComplaints] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [complaintsData, setComplaintsData] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const itemsPerPage = 10;

  // 민원 데이터 로드
  useEffect(() => {
    const loadComplaints = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllComplaints();
        setComplaintsData(data);
      } catch (err) {
        setError('민원 데이터를 불러오는데 실패했습니다.');
        console.error('민원 로드 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    loadComplaints();
  }, []);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId) {
        const target = event.target as Element;
        // 드롭다운 버튼이나 드롭다운 메뉴 내부 클릭이 아닌 경우에만 닫기
        if (!target.closest(`[data-dropdown-id="${openDropdownId}"]`)) {
          setOpenDropdownId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId]);

  const filteredComplaints = complaintsData.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (complaint.content && complaint.content.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatusFilter = filterStatus === 'all' || complaint.status === filterStatus;
    const matchesCategoryFilter = filterCategory === 'all' || complaint.category === filterCategory;
    return matchesSearch && matchesStatusFilter && matchesCategoryFilter;
  });

  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentComplaints = filteredComplaints.slice(startIndex, endIndex);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedComplaints([]);
      setSelectAll(false);
    } else {
      setSelectedComplaints(filteredComplaints.map(c => c.id));
      setSelectAll(true);
    }
  };

  const handleSelectComplaint = (id: string) => {
    if (selectedComplaints.includes(id)) {
      setSelectedComplaints(selectedComplaints.filter(c => c !== id));
      setSelectAll(false);
    } else {
      const newSelected = [...selectedComplaints, id];
      setSelectedComplaints(newSelected);
      if (newSelected.length === filteredComplaints.length) {
        setSelectAll(true);
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = () => {
    setCurrentPage(1); // 필터 변경 시 첫 페이지로 이동
  };

  const handleStatusChange = async (complaintId: string, newStatus: Complaint['status']) => {
    try {
      // 민원 ID에서 숫자 부분 추출 (C2024-0001 -> 1)
      const idNumber = parseInt(complaintId.split('-')[1]);
      const statusCode = getStatusCodeFromStatus(newStatus);
      
      console.log('단일 처리 시작:', {
        complaintId,
        idNumber,
        newStatus,
        statusCode
      });
      
      await updateComplaintStatus(idNumber, statusCode);
      
      console.log('단일 처리 성공:', complaintId);
      
      // 로컬 상태 업데이트
      setComplaintsData(prev => 
        prev.map(complaint => 
          complaint.id === complaintId 
            ? { ...complaint, status: newStatus }
            : complaint
        )
      );
      
      // 상태 변경 후 맨 위로 스크롤
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      alert(`민원 상태가 ${getStatusText(newStatus)}로 변경되었습니다.`);
    } catch (error) {
      console.error('상태 변경 오류:', error);
      alert('민원 상태 변경에 실패했습니다.');
    }
  };

  // 일괄 상태 변경 함수
  const handleBulkStatusChange = async (newStatus: Complaint['status']) => {
    if (selectedComplaints.length === 0) {
      alert('변경할 민원을 선택해주세요.');
      return;
    }

    try {
      const statusCode = getStatusCodeFromStatus(newStatus);
      console.log('일괄 처리 시작:', {
        selectedComplaints,
        newStatus,
        statusCode
      });

      const promises = selectedComplaints.map(async (complaintId, index) => {
        const idNumber = parseInt(complaintId.split('-')[1]);
        console.log(`민원 ${index + 1} 처리 중:`, {
          complaintId,
          idNumber,
          statusCode
        });
        
        try {
          await updateComplaintStatus(idNumber, statusCode);
          console.log(`민원 ${index + 1} 성공:`, complaintId);
          return { success: true, complaintId };
        } catch (error) {
          console.error(`민원 ${index + 1} 실패:`, complaintId, error);
          return { success: false, complaintId, error };
        }
      });

      const results = await Promise.all(promises);
      console.log('일괄 처리 결과:', results);
      
      // 성공한 민원들만 로컬 상태 업데이트
      const successfulComplaints = results.filter(r => r.success).map(r => r.complaintId);
      setComplaintsData(prev => 
        prev.map(complaint => 
          successfulComplaints.includes(complaint.id)
            ? { ...complaint, status: newStatus }
            : complaint
        )
      );
      
      // 선택 초기화
      setSelectedComplaints([]);
      setSelectAll(false);
      
      // 맨 위로 스크롤
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      const successCount = successfulComplaints.length;
      const failCount = results.length - successCount;
      
      if (failCount > 0) {
        alert(`${successCount}개 민원 성공, ${failCount}개 민원 실패했습니다. 콘솔을 확인해주세요.`);
      } else {
        alert(`${successCount}개 민원의 상태가 ${getStatusText(newStatus)}로 변경되었습니다.`);
      }
    } catch (error) {
      console.error('일괄 상태 변경 오류:', error);
      alert('일괄 상태 변경에 실패했습니다.');
    }
  };

  const getStatusText = (status: Complaint['status']) => {
    const statusMap = {
      pending: '보류',
      processing: '진행중',
      completed: '완료',
      rejected: '거부됨'
    };
    return statusMap[status];
  };

  // 민원 상세 모달 열기
  const handleOpenDetailModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setIsDetailModalOpen(true);
  };

  // 민원 상세 모달 닫기
  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedComplaint(null);
  };

  // 피드백 업데이트
  const handleFeedbackUpdate = (complaintId: string, feedback: Feedback) => {
    setComplaintsData(prev => 
      prev.map(complaint => 
        complaint.id === complaintId 
          ? { ...complaint, feedback }
          : complaint
      )
    );
  };

  const StatusDropdown: React.FC<{ complaint: Complaint }> = ({ complaint }) => {
    const isOpen = openDropdownId === complaint.id;
    
    // 현재 페이지의 민원 개수와 위치에 따라 드롭다운 위치 결정
    const getDropdownPosition = (): 'top' | 'bottom' => {
      // 현재 페이지의 민원 개수가 7개 이상이면 8번째부터 위로 표시
      if (currentComplaints.length >= 7) {
        const complaintIndex = currentComplaints.findIndex(c => c.id === complaint.id);
        return complaintIndex >= 7 ? 'top' : 'bottom';
      }
      return 'bottom';
    };

    const handleToggle = () => {
      if (!isOpen) {
        setOpenDropdownId(complaint.id);
      } else {
        setOpenDropdownId(null);
      }
    };

    const handleStatusChangeAndClose = (newStatus: Complaint['status']) => {
      handleStatusChange(complaint.id, newStatus);
      setOpenDropdownId(null);
    };

    return (
      <div className="relative" data-dropdown-id={complaint.id}>
        <button
          id={`status-button-${complaint.id}`}
          onClick={handleToggle}
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${
            complaint.status === 'pending' ? 'bg-gray-100 text-gray-800 border border-gray-200' :
            complaint.status === 'processing' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
            complaint.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' :
            complaint.status === 'rejected' ? 'bg-red-100 text-red-800 border border-red-200' :
            'bg-gray-100 text-gray-800 border border-gray-200'
          }`}
        >
          {getStatusText(complaint.status)}
          <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {isOpen && (
          <div className={`absolute z-10 w-32 bg-white border border-gray-200 rounded-md shadow-lg ${
            getDropdownPosition() === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}>
            <div className="py-1">
              <button
                onClick={() => handleStatusChangeAndClose('pending')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                보류
              </button>
              <button
                onClick={() => handleStatusChangeAndClose('processing')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                처리중
              </button>
              <button
                onClick={() => handleStatusChangeAndClose('completed')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                완료
              </button>
              <button
                onClick={() => handleStatusChangeAndClose('rejected')}
                className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
              >
                거부됨
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const totalComplaints = complaintsData.length;
  const processingComplaints = complaintsData.filter(c => c.status === 'processing').length;
  const completedComplaints = complaintsData.filter(c => c.status === 'completed').length;
  const rejectedComplaints = complaintsData.filter(c => c.status === 'rejected').length;
  const urgentComplaints = complaintsData.filter(c => c.daysLeft !== undefined && c.daysLeft <= 3 && c.daysLeft >= 0).length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-6">
        {/* Main Card Container */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Complaints */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-sm p-6 border border-blue-200">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-.293.293a1 1 0 101.414 1.414l2-2a1 1 0 000-1.414l-2-2a1 1 0 00-1.414 1.414L9.414 11H7a1 1 0 01-1-1V5a1 1 0 00-1-1H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">전체 민원</p>
                  <p className="text-2xl font-semibold text-gray-900">{totalComplaints}건</p>
                  <p className="text-sm text-blue-600">이번 달 접수</p>
                </div>
              </div>
            </div>

            {/* Processing Complaints */}
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg shadow-sm p-6 border border-orange-200">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-orange-100">
                  <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">처리중</p>
                  <p className="text-2xl font-semibold text-gray-900">{processingComplaints}건</p>
                  <p className="text-sm text-orange-600">진행 중</p>
                </div>
              </div>
            </div>

            {/* Completed Complaints */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg shadow-sm p-6 border border-green-200">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">완료</p>
                  <p className="text-2xl font-semibold text-gray-900">{completedComplaints}건</p>
                  <p className="text-sm text-green-600">처리 완료</p>
                </div>
              </div>
            </div>

            {/* Rejected Complaints */}
            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg shadow-sm p-6 border border-red-200">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-red-100">
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">거부됨</p>
                  <p className="text-2xl font-semibold text-gray-900">{rejectedComplaints}건</p>
                  <p className="text-sm text-red-600">처리 거부</p>
                </div>
              </div>
            </div>
          </div>

          {/* Complaint List Card */}
          <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200">
            {/* Search and Filter */}
            <div className="px-6 py-4 border-b border-gray-200 bg-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">전체 선택</span>
                  </label>
                  <select className="block px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                    <option>일괄 처리</option>
                    <option>상태 변경</option>
                    <option>담당자 배정</option>
                    <option>삭제</option>
                  </select>
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
                        placeholder="민원 제목, 내용, 민원번호 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      handleFilterChange();
                    }}
                    className="block w-32 px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">전체</option>
                    <option value="pending">보류</option>
                    <option value="processing">처리중</option>
                    <option value="completed">완료</option>
                    <option value="rejected">거부됨</option>
                  </select>
                  <select
                    value={filterCategory}
                    onChange={(e) => {
                      setFilterCategory(e.target.value);
                      handleFilterChange();
                    }}
                    className="block w-32 px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">전체</option>
                    <option value="식자재 요청">식자재 요청</option>
                    <option value="민원">민원</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 일괄 처리 UI */}
            {selectedComplaints.length > 0 && (
              <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-blue-800">
                      {selectedComplaints.length}개 민원 선택됨
                    </span>
                    <button
                      onClick={() => {
                        setSelectedComplaints([]);
                        setSelectAll(false);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      선택 해제
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-blue-700">일괄 상태 변경:</span>
                    <button
                      onClick={() => handleBulkStatusChange('pending')}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors"
                    >
                      보류
                    </button>
                    <button
                      onClick={() => handleBulkStatusChange('processing')}
                      className="px-3 py-1 text-xs bg-orange-100 text-orange-800 rounded hover:bg-orange-200 transition-colors"
                    >
                      처리중
                    </button>
                    <button
                      onClick={() => handleBulkStatusChange('completed')}
                      className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
                    >
                      완료
                    </button>
                    <button
                      onClick={() => handleBulkStatusChange('rejected')}
                      className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                    >
                      거부됨
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto bg-white" style={{ minHeight: '700px', maxHeight: '800px' }}>
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">민원 데이터를 불러오는 중...</span>
                </div>
              ) : error ? (
                <div className="flex justify-center items-center h-full">
                  <div className="text-center">
                    <div className="text-red-600 mb-2">⚠️</div>
                    <p className="text-gray-600">{error}</p>
                    <button 
                      onClick={() => window.location.reload()} 
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      다시 시도
                    </button>
                  </div>
                </div>
              ) : currentComplaints.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <div className="text-center">
                    <div className="text-gray-400 mb-2">📝</div>
                    <p className="text-gray-600">민원이 없습니다.</p>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  <div className="overflow-y-auto flex-1">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <input
                              type="checkbox"
                              checked={selectAll}
                              onChange={handleSelectAll}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">민원번호</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">민원 제목</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">민원 내용</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작성자</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">접수일자</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">처리기한</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                    {currentComplaints.map((complaint) => (
                      <tr 
                        key={complaint.id} 
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleOpenDetailModal(complaint)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedComplaints.includes(complaint.id)}
                            onChange={() => handleSelectComplaint(complaint.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{complaint.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">{complaint.title}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                          <div className="truncate" title={complaint.content}>
                            {complaint.content || '내용 없음'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-blue-600 font-medium text-sm">
                                {complaint.userName ? complaint.userName.charAt(0).toUpperCase() : '?'}
                              </span>
                            </div>
                            <span className="font-medium">{complaint.userName || '알 수 없음'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{complaint.submissionDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {getDeadlineDisplay(complaint.deadline, complaint.daysLeft)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <StatusDropdown complaint={complaint} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            complaint.category === '식자재 요청' 
                              ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                              : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          }`}>
                            {complaint.category}
                          </span>
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
                  {startIndex + 1}-{Math.min(endIndex, filteredComplaints.length)} of {filteredComplaints.length} results
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

      {/* 민원 상세 모달 */}
      <ComplaintDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        complaint={selectedComplaint}
        onFeedbackUpdate={handleFeedbackUpdate}
      />
    </div>
  );
}

export default function ComplaintManagementPageWithGuard() {
  return (
    <AdminGuard>
      <ComplaintManagementPage />
    </AdminGuard>
  );
}
