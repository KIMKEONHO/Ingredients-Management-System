'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/sidebar';

interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  lastLogin: string;
  status: 'active' | 'denied' | 'dormant' | 'withdrawn' | 'pending';
}

const members: Member[] = [
  {
    id: 1,
    name: '김철수',
    email: 'kim@example.com',
    phone: '010-1234-5678',
    joinDate: '2024-01-15',
    lastLogin: '2025-08-07',
    status: 'active'
  },
  {
    id: 2,
    name: '이영희',
    email: 'lee@example.com',
    phone: '010-2345-6789',
    joinDate: '2024-02-20',
    lastLogin: '2025-08-06',
    status: 'active'
  },
  {
    id: 3,
    name: '박민수',
    email: 'park@example.com',
    phone: '010-3456-7890',
    joinDate: '2024-03-10',
    lastLogin: '2025-07-25',
    status: 'denied'
  },
  {
    id: 4,
    name: '최수진',
    email: 'choi@example.com',
    phone: '010-4567-8901',
    joinDate: '2024-04-05',
    lastLogin: '2025-06-15',
    status: 'dormant'
  },
  {
    id: 5,
    name: '정다은',
    email: 'jung@example.com',
    phone: '010-5678-9012',
    joinDate: '2024-05-18',
    lastLogin: '2025-08-07',
    status: 'active'
  },
  {
    id: 6,
    name: '임병호',
    email: 'lim@example.com',
    phone: '010-6789-0123',
    joinDate: '2024-06-22',
    lastLogin: '2025-07-10',
    status: 'withdrawn'
  },
  {
    id: 7,
    name: '한소영',
    email: 'han@example.com',
    phone: '010-7890-1234',
    joinDate: '2024-07-11',
    lastLogin: '2025-08-05',
    status: 'active'
  },
  {
    id: 8,
    name: '윤재혁',
    email: 'yoon@example.com',
    phone: '010-8901-2345',
    joinDate: '2024-08-01',
    lastLogin: '2025-08-04',
    status: 'pending'
  },
  {
    id: 9,
    name: '송미영',
    email: 'song@example.com',
    phone: '010-9012-3456',
    joinDate: '2024-09-15',
    lastLogin: '2025-08-03',
    status: 'active'
  },
  {
    id: 10,
    name: '강동훈',
    email: 'kang@example.com',
    phone: '010-0123-4567',
    joinDate: '2024-10-20',
    lastLogin: '2025-08-02',
    status: 'active'
  },
  {
    id: 11,
    name: '조은영',
    email: 'cho@example.com',
    phone: '010-1234-5679',
    joinDate: '2024-11-05',
    lastLogin: '2025-08-01',
    status: 'pending'
  },
  {
    id: 12,
    name: '백준호',
    email: 'baek@example.com',
    phone: '010-2345-6780',
    joinDate: '2024-12-10',
    lastLogin: '2025-07-30',
    status: 'active'
  }
];

const getStatusBadge = (status: Member['status']) => {
  const statusConfig = {
    active: { text: '활동중', bg: 'bg-green-100', textColor: 'text-green-800', border: 'border-green-200' },
    denied: { text: '활동 거부됨', bg: 'bg-red-100', textColor: 'text-red-800', border: 'border-red-200' },
    dormant: { text: '휴면', bg: 'bg-gray-100', textColor: 'text-gray-800', border: 'border-gray-200' },
    withdrawn: { text: '탈퇴', bg: 'bg-gray-800', textColor: 'text-white', border: 'border-gray-700' },
    pending: { text: '대기중', bg: 'bg-yellow-100', textColor: 'text-yellow-800', border: 'border-yellow-200' }
  };

  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.textColor} ${config.border}`}>
      {config.text}
      <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    </span>
  );
};

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Member | null;
  mode: 'view' | 'edit';
  onSave: (updatedUser: Member) => void;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, user, mode, onSave }) => {
  const [formData, setFormData] = useState<Member | null>(user);

  // user prop이 변경될 때 formData를 업데이트
  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  if (!isOpen || !user || !formData) return null;

  const handleInputChange = (field: keyof Member, value: string) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave(formData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {mode === 'view' ? '사용자 상세정보' : '사용자 정보 수정'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={mode === 'view'}
                className={`w-full px-3 py-2 border rounded-md ${
                  mode === 'view' 
                    ? 'bg-gray-100 text-gray-600' 
                    : 'border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={mode === 'view'}
                className={`w-full px-3 py-2 border rounded-md ${
                  mode === 'view' 
                    ? 'bg-gray-100 text-gray-600' 
                    : 'border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={mode === 'view'}
                className={`w-full px-3 py-2 border rounded-md ${
                  mode === 'view' 
                    ? 'bg-gray-100 text-gray-600' 
                    : 'border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">가입일</label>
              <input
                type="date"
                value={formData.joinDate}
                onChange={(e) => handleInputChange('joinDate', e.target.value)}
                disabled={mode === 'view'}
                className={`w-full px-3 py-2 border rounded-md ${
                  mode === 'view' 
                    ? 'bg-gray-100 text-gray-600' 
                    : 'border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as Member['status'])}
                disabled={mode === 'view'}
                className={`w-full px-3 py-2 border rounded-md ${
                  mode === 'view' 
                    ? 'bg-gray-100 text-gray-600' 
                    : 'border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                }`}
              >
                <option value="active">활동중</option>
                <option value="denied">활동 거부됨</option>
                <option value="dormant">휴면</option>
                <option value="withdrawn">탈퇴</option>
                <option value="pending">대기중</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              취소
            </button>
            {mode === 'edit' && (
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                저장
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default function MemberManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [modalData, setModalData] = useState<{
    isOpen: boolean;
    user: Member | null;
    mode: 'view' | 'edit';
  }>({
    isOpen: false,
    user: null,
    mode: 'view'
  });
  const [editingStatus, setEditingStatus] = useState<number | null>(null);
  const [membersData, setMembersData] = useState<Member[]>(members);
  const itemsPerPage = 10;

  const filteredMembers = membersData.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || member.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMembers = filteredMembers.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === currentMembers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(currentMembers.map(member => member.id)));
    }
  };

  const handleSelectUser = (userId: number) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleBulkAction = (action: string) => {
    if (selectedUsers.size === 0) return;
    
    // 여기에 일괄 처리 로직을 구현할 수 있습니다
    console.log(`${action} for users:`, Array.from(selectedUsers));
    alert(`${action} 처리: ${selectedUsers.size}명의 사용자`);
  };

  const openModal = (user: Member, mode: 'view' | 'edit') => {
    setModalData({
      isOpen: true,
      user,
      mode
    });
  };

  const closeModal = () => {
    setModalData({
      isOpen: false,
      user: null,
      mode: 'view'
    });
  };

  const handleSaveUser = (updatedUser: Member) => {
    // 여기에 실제 저장 로직을 구현할 수 있습니다
    console.log('Updated user:', updatedUser);
    alert('사용자 정보가 수정되었습니다.');
  };

  const handleStatusChange = (userId: number, newStatus: Member['status']) => {
    // 실제 구현에서는 API 호출을 통해 상태를 업데이트해야 합니다
    console.log(`User ${userId} status changed to ${newStatus}`);
    
    // 로컬 상태 업데이트
    setMembersData(prev => 
      prev.map(member => 
        member.id === userId 
          ? { ...member, status: newStatus }
          : member
      )
    );
    
    alert(`사용자 상태가 ${getStatusText(newStatus)}로 변경되었습니다.`);
    setEditingStatus(null);
  };

  const getStatusText = (status: Member['status']) => {
    const statusMap = {
      active: '활동중',
      denied: '활동 거부됨',
      dormant: '휴면',
      withdrawn: '탈퇴',
      pending: '대기중'
    };
    return statusMap[status];
  };

  const StatusDropdown: React.FC<{ member: Member }> = ({ member }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity"
          style={{
            backgroundColor: getStatusBadge(member.status).props.className.includes('bg-green-100') ? '#dcfce7' :
                           getStatusBadge(member.status).props.className.includes('bg-red-100') ? '#fee2e2' :
                           getStatusBadge(member.status).props.className.includes('bg-gray-100') ? '#f3f4f6' :
                           getStatusBadge(member.status).props.className.includes('bg-gray-800') ? '#1f2937' :
                           '#fef3c7',
            color: getStatusBadge(member.status).props.className.includes('text-white') ? '#ffffff' :
                   getStatusBadge(member.status).props.className.includes('text-green-800') ? '#166534' :
                   getStatusBadge(member.status).props.className.includes('text-red-800') ? '#991b1b' :
                   getStatusBadge(member.status).props.className.includes('text-gray-800') ? '#1f2937' :
                   '#92400e',
            borderColor: getStatusBadge(member.status).props.className.includes('border-green-200') ? '#bbf7d0' :
                        getStatusBadge(member.status).props.className.includes('border-red-200') ? '#fecaca' :
                        getStatusBadge(member.status).props.className.includes('border-gray-200') ? '#e5e7eb' :
                        getStatusBadge(member.status).props.className.includes('border-gray-700') ? '#374151' :
                        '#fde68a'
          }}
        >
          {getStatusText(member.status)}
          <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg">
            <div className="py-1">
              <button
                onClick={() => {
                  handleStatusChange(member.id, 'active');
                  setIsOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                활동중
              </button>
              <button
                onClick={() => {
                  handleStatusChange(member.id, 'withdrawn');
                  setIsOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                탈퇴함
              </button>
              <button
                onClick={() => {
                  handleStatusChange(member.id, 'denied');
                  setIsOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                활동 거부됨
              </button>
              <button
                onClick={() => {
                  handleStatusChange(member.id, 'dormant');
                  setIsOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                휴면
              </button>
              <button
                onClick={() => {
                  handleStatusChange(member.id, 'pending');
                  setIsOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                대기중
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-6">
        {/* Main Card Container */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Members */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-sm p-6 border border-blue-200">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">전체 회원</p>
                  <p className="text-2xl font-semibold text-gray-900">{membersData.length}명</p>
                  <p className="text-sm text-green-600">↑ 전월 대비 +{membersData.length}명</p>
                </div>
              </div>
            </div>

            {/* Active Members */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg shadow-sm p-6 border border-green-200">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">활동 중인 회원</p>
                  <p className="text-2xl font-semibold text-gray-900">{membersData.filter(m => m.status === 'active').length}명</p>
                  <p className="text-sm text-green-600">↑ 전월 대비 +5명</p>
                </div>
              </div>
            </div>

            {/* New Sign-ups */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg shadow-sm p-6 border border-purple-200">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-100">
                  <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">신규 가입</p>
                  <p className="text-2xl font-semibold text-gray-900">12명</p>
                  <p className="text-sm text-gray-600">이번 달 가입</p>
                </div>
              </div>
            </div>

            {/* Blocked Members */}
            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg shadow-sm p-6 border border-red-200">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-red-100">
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">차단된 회원</p>
                  <p className="text-2xl font-semibold text-gray-900">{membersData.filter(m => m.status === 'denied').length}명</p>
                  <p className="text-sm text-red-600">▲ 관리 필요</p>
                </div>
              </div>
            </div>
          </div>

          {/* Member List Card */}
          <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-white rounded-t-lg">
              <h2 className="text-lg font-semibold text-gray-900">회원 목록</h2>
            </div>

            {/* Bulk Actions */}
            {selectedUsers.size > 0 && (
              <div className="px-6 py-3 border-b border-gray-200 bg-blue-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700 font-medium">
                    {selectedUsers.size}명의 사용자가 선택되었습니다
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleBulkAction('활성화')}
                      className="px-3 py-1 text-sm text-green-700 bg-green-100 hover:bg-green-200 rounded-md"
                    >
                      일괄 활성화
                    </button>
                    <button
                      onClick={() => handleBulkAction('차단')}
                      className="px-3 py-1 text-sm text-red-700 bg-red-100 hover:bg-red-200 rounded-md"
                    >
                      일괄 차단
                    </button>
                    <button
                      onClick={() => handleBulkAction('삭제')}
                      className="px-3 py-1 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                    >
                      일괄 삭제
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Search and Filter */}
            <div className="px-6 py-4 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="이름 또는 이메일 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="block w-32 px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">전체</option>
                  <option value="active">활동중</option>
                  <option value="denied">활동 거부됨</option>
                  <option value="dormant">휴면</option>
                  <option value="withdrawn">탈퇴</option>
                  <option value="pending">대기중</option>
                </select>
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
                        checked={selectedUsers.size === currentMembers.length && currentMembers.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">회원명</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">전화번호</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가입일</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">최근 로그인</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(member.id)}
                          onChange={() => handleSelectUser(member.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                              <svg className="h-4 w-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.joinDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.lastLogin}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusDropdown member={member} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => openModal(member, 'view')}
                            className="text-blue-600 hover:text-blue-900"
                            title="상세보기"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => openModal(member, 'edit')}
                            className="text-green-600 hover:text-green-900"
                            title="수정"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button className="text-red-600 hover:text-red-900" title="삭제">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
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
                  {startIndex + 1}-{Math.min(endIndex, filteredMembers.length)} of {filteredMembers.length} results
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

        {/* User Modal */}
        <UserModal
          isOpen={modalData.isOpen}
          onClose={closeModal}
          user={modalData.user}
          mode={modalData.mode}
          onSave={handleSaveUser}
        />
      </div>
    </div>
  );
}
