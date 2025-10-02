'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/sidebar';
import AdminGuard from '@/lib/auth/adminGuard';
import { userService, UserStatistics } from '@/lib/api/services/userService';

interface Member {
  id: number;
  name: string;
  email: string;
  phone: string | null; // 카카오/구글 로그인 시 null 가능
  joinDate: string;
  lastLogin: string;
  status: 'active' | 'inactive' | 'pending' | 'withdrawn'; // 백엔드 Status enum과 일치
}

// 백엔드에서 받은 UserStatistics를 Member 형태로 변환하는 함수
const convertUserStatisticsToMember = (userStats: UserStatistics): Member => {
  return {
    id: userStats.id, // 백엔드에서 제공하는 실제 ID 사용
    name: userStats.userName,
    email: userStats.userEmail,
    phone: userStats.userPhoneNum, // null일 수 있음
    joinDate: new Date(userStats.createdAt).toLocaleDateString('ko-KR'),
    lastLogin: new Date(userStats.recentLogin).toLocaleDateString('ko-KR'),
    status: userStats.status
  };
};

const getStatusBadge = (status: Member['status']) => {
  const statusConfig = {
    // 백엔드 Status enum과 일치하는 소문자 상태값
    active: { text: '활동중', bg: 'bg-green-100', textColor: 'text-green-800', border: 'border-green-200' },
    inactive: { text: '비활성', bg: 'bg-gray-100', textColor: 'text-gray-800', border: 'border-gray-200' },
    pending: { text: '대기중', bg: 'bg-yellow-100', textColor: 'text-yellow-800', border: 'border-yellow-200' },
    withdrawn: { text: '철회됨', bg: 'bg-gray-800', textColor: 'text-white', border: 'border-gray-700' }
  };

  // 안전장치: 정의되지 않은 상태값에 대한 기본값 제공
  const config = statusConfig[status] || { 
    text: status || '알 수 없음', 
    bg: 'bg-gray-100', 
    textColor: 'text-gray-800', 
    border: 'border-gray-200' 
  };

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
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={mode === 'view'}
                placeholder={formData.phone ? '' : '전화번호 없음 (소셜 로그인)'}
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
                <option value="inactive">비활성</option>
                <option value="pending">대기중</option>
                <option value="withdrawn">철회됨</option>
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

function MemberManagementPage() {
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
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; userId: number | null; userName: string }>({
    isOpen: false,
    userId: null,
    userName: ''
  });
  const [membersData, setMembersData] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 10;

  // 백엔드에서 유저 데이터를 가져오는 함수
  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.getAllUserStatistics();
      
      if (response.success && response.data) {
        const convertedMembers = response.data.map((userStats) => 
          convertUserStatisticsToMember(userStats)
        );
        setMembersData(convertedMembers);
      } else {
        setError(response.message || '유저 데이터를 불러올 수 없습니다.');
      }
    } catch (err) {
      console.error('유저 데이터 로딩 실패:', err);
      setError(err instanceof Error ? err.message : '유저 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchUserData();
  }, []);

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

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.size === 0) return;
    
    const userIds = Array.from(selectedUsers);
    let status: Member['status'];
    
    // 액션에 따른 상태 매핑
    switch (action) {
      case '활성화':
        status = 'active';
        break;
      case '비활성화':
        status = 'inactive';
        break;
      case '대기중':
        status = 'pending';
        break;
      case '철회':
        status = 'withdrawn';
        break;
      default:
        alert('지원하지 않는 액션입니다.');
        return;
    }
    
    try {
      // 일괄 상태 변경 API 호출
      const response = await userService.bulkChangeUserStatus({
        userIds: userIds,
        status: status
      });
      
      if (response.success) {
        // 성공 시 로컬 상태 업데이트
        setMembersData(prev => 
          prev.map(member => 
            selectedUsers.has(member.id) 
              ? { ...member, status: status }
              : member
          )
        );
        
        // 선택 해제
        setSelectedUsers(new Set());
        
        alert(`${action} 처리 완료: ${selectedUsers.size}명의 사용자`);
      } else {
        alert(`${action} 처리에 실패했습니다: ${response.message}`);
      }
    } catch (error) {
      console.error('일괄 상태 변경 실패:', error);
      alert(`${action} 처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
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

  const handleSaveUser = async (updatedUser: Member) => {
    try {
      // API 호출을 통해 유저 데이터 변경
      const response = await userService.changeUserData({
        userId: updatedUser.id,
        userName: updatedUser.name,
        userEmail: updatedUser.email,
        userPhone: updatedUser.phone || '',
        userStatus: updatedUser.status
      });
      
      if (response.success) {
        // 성공 시 로컬 상태 업데이트
        setMembersData(prev => 
          prev.map(member => 
            member.id === updatedUser.id 
              ? updatedUser
              : member
          )
        );
        
        alert('사용자 정보가 성공적으로 수정되었습니다.');
      } else {
        alert(`사용자 정보 수정에 실패했습니다: ${response.message}`);
      }
    } catch (error) {
      console.error('사용자 정보 수정 실패:', error);
      alert(`사용자 정보 수정 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  };

  const handleStatusChange = async (userId: number, newStatus: Member['status']) => {
    try {
      console.log(`User ${userId} status changed to ${newStatus}`);
      
      // API 호출을 통해 상태 변경
      const response = await userService.changeUserStatus({
        userId: userId,
        status: newStatus
      });
      
      if (response.success) {
        // 성공 시 로컬 상태 업데이트
        setMembersData(prev => 
          prev.map(member => 
            member.id === userId 
              ? { ...member, status: newStatus }
              : member
          )
        );
        
        alert(`사용자 상태가 ${getStatusText(newStatus)}로 변경되었습니다.`);
      } else {
        alert(`상태 변경에 실패했습니다: ${response.message}`);
      }
    } catch (error) {
      console.error('상태 변경 실패:', error);
      alert(`상태 변경 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
    
    setEditingStatus(null);
  };

  // 유저 삭제 함수
  const handleDeleteUser = async (userId: number) => {
    try {
      const result = await userService.deleteUser(userId);
      
      if (result.success) {
        // 성공 시 목록에서 해당 유저 제거
        setMembersData(prev => prev.filter(member => member.id !== userId));
        alert('유저가 성공적으로 삭제되었습니다.');
      } else {
        alert(result.message || '유저 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('유저 삭제 오류:', error);
      alert(error instanceof Error ? error.message : '유저 삭제 중 오류가 발생했습니다.');
    } finally {
      setDeleteModal({ isOpen: false, userId: null, userName: '' });
    }
  };

  // 삭제 확인 모달 열기
  const openDeleteModal = (userId: number, userName: string) => {
    setDeleteModal({ isOpen: true, userId, userName });
  };

  // 삭제 확인 모달 닫기
  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, userId: null, userName: '' });
  };

  const getStatusText = (status: Member['status']) => {
    const statusMap = {
      active: '활동중',
      inactive: '비활성',
      pending: '대기중',
      withdrawn: '철회됨'
    };
    return statusMap[status] || status || '알 수 없음';
  };

  const StatusDropdown: React.FC<{ member: Member }> = ({ member }) => {
    const [isOpen, setIsOpen] = useState(false);

    // 상태에 따른 스타일을 직접 정의
    const getStatusStyle = (status: Member['status']) => {
      const statusStyles = {
        active: { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
        inactive: { bg: '#f3f4f6', text: '#1f2937', border: '#e5e7eb' },
        pending: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
        withdrawn: { bg: '#1f2937', text: '#ffffff', border: '#374151' }
      };
      
      return statusStyles[status] || { bg: '#f3f4f6', text: '#1f2937', border: '#e5e7eb' };
    };

    const style = getStatusStyle(member.status);

    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity border"
          style={{
            backgroundColor: style.bg,
            color: style.text,
            borderColor: style.border
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
              {[
                { value: 'active', label: '활동중' },
                { value: 'inactive', label: '비활성' },
                { value: 'pending', label: '대기중' },
                { value: 'withdrawn', label: '철회됨' }
              ].map((statusOption) => (
                <button
                  key={statusOption.value}
                  onClick={() => {
                    handleStatusChange(member.id, statusOption.value as Member['status']);
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {statusOption.label}
                </button>
              ))}
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
                  <p className="text-sm text-green-600">↑ 전월 대비 +{Math.floor(membersData.length * 0.1)}명</p>
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
                  <p className="text-sm text-green-600">↑ 전월 대비 +{Math.floor(membersData.filter(m => m.status === 'active').length * 0.1)}명</p>
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
                  <p className="text-2xl font-semibold text-gray-900">{membersData.filter(m => {
                    const joinDate = new Date(m.joinDate);
                    const now = new Date();
                    const thisMonth = now.getMonth();
                    const thisYear = now.getFullYear();
                    return joinDate.getMonth() === thisMonth && joinDate.getFullYear() === thisYear;
                  }).length}명</p>
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
                  <p className="text-sm font-medium text-gray-600">철회된 회원</p>
                  <p className="text-2xl font-semibold text-gray-900">{membersData.filter(m => m.status === 'withdrawn').length}명</p>
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
                      className="px-3 py-1 text-sm text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md"
                    >
                      일괄 활성화
                    </button>
                    <button
                      onClick={() => handleBulkAction('비활성화')}
                      className="px-3 py-1 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                    >
                      일괄 비활성화
                    </button>
                    <button
                      onClick={() => handleBulkAction('대기중')}
                      className="px-3 py-1 text-sm text-yellow-700 bg-yellow-100 hover:bg-yellow-200 rounded-md"
                    >
                      일괄 대기중
                    </button>
                    <button
                      onClick={() => handleBulkAction('철회')}
                      className="px-3 py-1 text-sm text-red-700 bg-red-100 hover:bg-red-200 rounded-md"
                    >
                      일괄 철회
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
                  <option value="inactive">비활성</option>
                  <option value="pending">대기중</option>
                  <option value="withdrawn">철회됨</option>
                </select>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="px-6 py-12 text-center">
                <div className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  유저 데이터를 불러오는 중...
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="px-6 py-12 text-center">
                <div className="text-red-600 mb-4">
                  <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">오류가 발생했습니다</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={fetchUserData}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  다시 시도
                </button>
              </div>
            )}

            {/* Table */}
            {!loading && !error && (
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">최근 로그인</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentMembers.map((member, index) => (
                    <tr key={member.id || `member-${index}`} className="hover:bg-gray-50">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.phone || (
                          <span className="text-gray-400 italic">전화번호 없음</span>
                        )}
                      </td>
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
                          <button 
                            onClick={() => openDeleteModal(member.id, member.name)}
                            className="text-red-600 hover:text-red-900"
                            title="유저 완전 삭제"
                          >
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
            )}

            {/* Pagination */}
            {!loading && !error && (
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
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page, index) => (
                    <button
                      key={`page-${page}-${index}`}
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
            )}
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

        {/* 삭제 확인 모달 */}
        {deleteModal.isOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mt-4">유저 삭제 확인</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    <strong>{deleteModal.userName}</strong> 유저를 완전히 삭제하시겠습니까?
                  </p>
                  <p className="text-sm text-red-600 mt-2">
                    ⚠️ 이 작업은 되돌릴 수 없습니다. 유저의 모든 데이터가 영구적으로 삭제됩니다.
                  </p>
                </div>
                <div className="items-center px-4 py-3">
                  <button
                    onClick={() => deleteModal.userId && handleDeleteUser(deleteModal.userId)}
                    className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-24 mr-2 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                  >
                    삭제
                  </button>
                  <button
                    onClick={closeDeleteModal}
                    className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-24 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MemberManagementPageWithGuard() {
  return (
    <AdminGuard>
      <MemberManagementPage />
    </AdminGuard>
  );
}
