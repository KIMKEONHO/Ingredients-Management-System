'use client';

import { useState } from 'react';
import AdminSidebar from '../components/sidebar';

interface Complaint {
  id: string;
  title: string;
  submitter: string;
  submissionDate: string;
  deadline: string;
  status: 'received' | 'processing' | 'completed' | 'pending';
  handler: string;
  category: '식자재 요청' | '민원';
  daysLeft?: number;
}

const complaints: Complaint[] = [
  {
    id: 'C2024-0001',
    title: '신선 유기농 채소류 품목 추가 요청',
    submitter: '김지원',
    submissionDate: '2024.01.15',
    deadline: '2024.01.22',
    status: 'processing',
    handler: '박성민',
    category: '식자재 요청',
    daysLeft: 2
  },
  {
    id: 'C2024-0002',
    title: '식자재 발주 시스템 개선 요청',
    submitter: '이현주',
    submissionDate: '2024.01.14',
    deadline: '2024.01.28',
    status: 'received',
    handler: '최준호',
    category: '민원'
  },
  {
    id: 'C2024-0003',
    title: '수입 식재료 원산지 표기 오류 수정',
    submitter: '강동현',
    submissionDate: '2024.01.13',
    deadline: '2024.01.27',
    status: 'completed',
    handler: '임서영',
    category: '민원'
  },
  {
    id: 'C2024-0004',
    title: '식자재 품질 관리 기준 개선 요청',
    submitter: '송지은',
    submissionDate: '2024.01.12',
    deadline: '2024.01.19',
    status: 'processing',
    handler: '정민우',
    category: '민원',
    daysLeft: 1
  },
  {
    id: 'C2024-0005',
    title: '계절 과일 품목 확대 제안',
    submitter: '윤서연',
    submissionDate: '2024.01.11',
    deadline: '2024.01.25',
    status: 'received',
    handler: '김태호',
    category: '식자재 요청'
  },
  {
    id: 'C2024-0006',
    title: '식자재 배송 일정 조정 요청',
    submitter: '박준영',
    submissionDate: '2024.01.10',
    deadline: '2024.01-24',
    status: 'completed',
    handler: '이미영',
    category: '민원'
  },
  {
    id: 'C2024-0007',
    title: '신규 공급업체 등록 절차 문의',
    submitter: '최수진',
    submissionDate: '2024.01.09',
    deadline: '2024.01.23',
    status: 'received',
    handler: '김동현',
    category: '민원'
  },
  {
    id: 'C2024-0008',
    title: '식자재 가격 정책 개선 제안',
    submitter: '정민수',
    submissionDate: '2024.01.08',
    deadline: '2024.01.21',
    status: 'processing',
    handler: '박지영',
    category: '민원',
    daysLeft: 3
  },
  {
    id: 'C2024-0009',
    title: '식자재 보관 방법 가이드 요청',
    submitter: '임서연',
    submissionDate: '2024.01.07',
    deadline: '2024.01.20',
    status: 'completed',
    handler: '최준호',
    category: '식자재 요청'
  },
  {
    id: 'C2024-0010',
    title: '식자재 품질 검증 절차 개선',
    submitter: '한지우',
    submissionDate: '2024.01.06',
    deadline: '2024.01.19',
    status: 'received',
    handler: '김태호',
    category: '민원'
  },
  {
    id: 'C2024-0011',
    title: '식자재 반품 정책 수정 요청',
    submitter: '윤동훈',
    submissionDate: '2024.01.05',
    deadline: '2024.01.18',
    status: 'pending',
    handler: '박성민',
    category: '민원'
  },
  {
    id: 'C2024-0012',
    title: '식자재 재고 관리 시스템 개선',
    submitter: '송미영',
    submissionDate: '2024.01.04',
    deadline: '2024.01.17',
    status: 'processing',
    handler: '정민우',
    category: '민원'
  }
];



const getDeadlineDisplay = (deadline: string, daysLeft?: number) => {
  if (daysLeft && daysLeft <= 2) {
    const color = daysLeft === 1 ? 'text-orange-600' : 'text-red-600';
    return (
      <span className={color}>
        {deadline} (D-{daysLeft})
      </span>
    );
  }
  return deadline;
};

export default function ComplaintManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedComplaints, setSelectedComplaints] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [complaintsData, setComplaintsData] = useState<Complaint[]>(complaints);
  const itemsPerPage = 10;

  const filteredComplaints = complaintsData.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.submitter.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.id.toLowerCase().includes(searchTerm.toLowerCase());
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

  const handleStatusChange = (complaintId: string, newStatus: Complaint['status']) => {
    // 실제 구현에서는 API 호출을 통해 상태를 업데이트해야 합니다
    console.log(`Complaint ${complaintId} status changed to ${newStatus}`);
    
    // 로컬 상태 업데이트
    setComplaintsData(prev => 
      prev.map(complaint => 
        complaint.id === complaintId 
          ? { ...complaint, status: newStatus }
          : complaint
      )
    );
    
    alert(`민원 상태가 ${getStatusText(newStatus)}로 변경되었습니다.`);
  };

  const getStatusText = (status: Complaint['status']) => {
    const statusMap = {
      received: '접수',
      processing: '처리중',
      completed: '완료',
      pending: '보류'
    };
    return statusMap[status];
  };

  const StatusDropdown: React.FC<{ complaint: Complaint }> = ({ complaint }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${
            complaint.status === 'received' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
            complaint.status === 'processing' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
            complaint.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' :
            'bg-gray-100 text-gray-800 border border-gray-200'
          }`}
        >
          {getStatusText(complaint.status)}
          <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg">
            <div className="py-1">
              <button
                onClick={() => {
                  handleStatusChange(complaint.id, 'received');
                  setIsOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                접수
              </button>
              <button
                onClick={() => {
                  handleStatusChange(complaint.id, 'processing');
                  setIsOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                처리중
              </button>
              <button
                onClick={() => {
                  handleStatusChange(complaint.id, 'completed');
                  setIsOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                완료
              </button>
              <button
                onClick={() => {
                  handleStatusChange(complaint.id, 'pending');
                  setIsOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                보류
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
  const urgentComplaints = complaintsData.filter(c => c.daysLeft && c.daysLeft <= 2).length;

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

            {/* Urgent Complaints */}
            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg shadow-sm p-6 border border-red-200">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-red-100">
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">긴급</p>
                  <p className="text-2xl font-semibold text-gray-900">{urgentComplaints}건</p>
                  <p className="text-sm text-red-600">D-2 이내</p>
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
                        placeholder="민원 제목, 접수자명, 민원번호 검색..."
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
                    <option value="received">접수</option>
                    <option value="processing">처리중</option>
                    <option value="completed">완료</option>
                    <option value="pending">보류</option>
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

            {/* Table */}
            <div className="overflow-x-auto bg-white">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">접수자명</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">접수일자</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">처리기한</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">담당자</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentComplaints.map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedComplaints.includes(complaint.id)}
                          onChange={() => handleSelectComplaint(complaint.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{complaint.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">{complaint.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{complaint.submitter}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{complaint.submissionDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {getDeadlineDisplay(complaint.deadline, complaint.daysLeft)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusDropdown complaint={complaint} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{complaint.handler}</td>
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
    </div>
  );
}
