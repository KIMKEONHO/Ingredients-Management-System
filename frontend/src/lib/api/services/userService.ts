import { apiClient } from '../client';
import axios from 'axios';

export interface UserProfile {
  nickName: string;
  email: string;
  profile?: string;
  phoneNum?: string;
  userStatus: string;
  createdAt: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserProfileResponse {
  success: boolean;
  data?: UserProfile;
  message?: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message?: string;
}

// 통합 프로필 데이터 변경 관련 타입 정의
export interface ExchangeProfileDataRequest {
  nickname?: string;
  phoneNum?: string;
}

export interface ExchangeProfileDataResponse {
  success: boolean;
  message?: string;
}

// 유저 통계 관련 타입 정의
export interface UserStatistics {
  id: number; // 유저 ID 추가
  userName: string;
  userEmail: string;
  userPhoneNum: string | null; // 카카오/구글 로그인 시 null 가능
  createdAt: string;
  recentLogin: string;
  status: 'active' | 'inactive' | 'pending' | 'withdrawn'; // 백엔드 Status enum과 일치
}

export interface UserStatisticsResponse {
  success: boolean;
  data?: UserStatistics[];
  message?: string;
}

// 유저 상태 변경 관련 타입 정의
export interface ChangeUserStatusRequest {
  userId: number;
  status: 'active' | 'inactive' | 'pending' | 'withdrawn'; // 백엔드 Status enum과 일치
}

export interface ChangeUserStatusResponse {
  success: boolean;
  message?: string;
}

// 유저 삭제 관련 타입 정의
export interface DeleteUserResponse {
  success: boolean;
  message?: string;
}

// 일괄 상태 변경 관련 타입 정의
export interface BulkChangeUserStatusRequest {
  userIds: number[];
  status: 'active' | 'inactive' | 'pending' | 'withdrawn';
}

export interface BulkChangeUserStatusResponse {
  success: boolean;
  message?: string;
}

// 관리자용 유저 데이터 변경 관련 타입 정의
export interface ChangeUserDataRequest {
  userId: number;
  userName: string;
  userEmail: string;
  userPhone: string;
  userStatus: 'active' | 'inactive' | 'pending' | 'withdrawn';
}

export interface ChangeUserDataResponse {
  success: boolean;
  message?: string;
}

export const userService = {
  // UserProfile 타입 가드
  isUserProfile(obj: unknown): obj is UserProfile {
    return (
      obj !== null &&
      typeof obj === 'object' &&
      'nickName' in obj &&
      'email' in obj &&
      'userStatus' in obj &&
      'createdAt' in obj
    );
  },

  // 사용자 프로필 조회
  async getUserProfile(): Promise<UserProfileResponse> {
    try {
      const response = await apiClient.post<Record<string, unknown>>('/api/v1/users/profile');
      console.log('userService 응답:', response);
      
      // 백엔드 응답 구조 확인
      if (response && typeof response === 'object') {
        // response가 UserProfile 객체인지 확인
        if (this.isUserProfile(response)) {
          return {
            success: true,
            data: response,
            message: '프로필 정보를 성공적으로 불러왔습니다.'
          };
        }
        
        // response.data가 UserProfile 객체인지 확인
        if ('data' in response && this.isUserProfile(response.data)) {
          return {
            success: true,
            data: response.data,
            message: '프로필 정보를 성공적으로 불러왔습니다.'
          };
        }
      }
      
      // 응답이 없는 경우 기본 성공 응답
      return {
        success: true,
        data: undefined,
        message: '프로필 정보를 불러올 수 없습니다.'
      };
    } catch (error: unknown) {
      console.error('사용자 프로필 조회 실패:', error);
      
      // HTTP 상태 코드에 따른 오류 처리
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error as { response?: { status?: number } };
        const status = errorResponse.response?.status;
        if (status === 401) {
          throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
        } else if (status === 403) {
          throw new Error('접근 권한이 없습니다.');
        } else if (status === 500) {
          throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
      }
      
      // 세션 관련 오류 처리
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = error as { message?: string };
        if (errorMessage.message && errorMessage.message.includes('Session was invalidated')) {
          throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
      }
      
      throw new Error('사용자 프로필을 불러올 수 없습니다.');
    }
  },

  // 닉네임 변경
  async updateNickname(nickname: string): Promise<UserProfileResponse> {
    try {
      const response = await apiClient.post<Record<string, unknown>>('/api/v1/users/exchange/nickname', {
        nickname: nickname
      });
      
      console.log('닉네임 변경 응답:', response);
      
      // 백엔드 응답 구조 확인 및 안전한 처리
      if (response && typeof response === 'object' && 'data' in response) {
        const responseData = response.data as Record<string, unknown>;
        // 백엔드에서 RsData 형태로 응답하는 경우
        if ('resultCode' in responseData || 'success' in responseData) {
          return {
            success: true,
            message: (responseData.msg as string) || '닉네임이 성공적으로 변경되었습니다.'
          };
        }
        // 기타 응답 구조는 기본 성공 응답으로 처리
        return {
          success: true,
          message: '닉네임이 성공적으로 변경되었습니다.'
        };
      }
      
      // 응답이 없는 경우 기본 성공 응답
      return {
        success: true,
        message: '닉네임이 성공적으로 변경되었습니다.'
      };
    } catch (error: unknown) {
      console.error('닉네임 변경 실패:', error);
      throw new Error('닉네임 변경에 실패했습니다.');
    }
  },

  // 전화번호 변경
  async updatePhone(phoneNum: string): Promise<UserProfileResponse> {
    try {
      const response = await apiClient.post<Record<string, unknown>>('/api/v1/users/exchange/phone', {
        phoneNum: phoneNum
      });
      
      console.log('전화번호 변경 응답:', response);
      
      // 백엔드 응답 구조 확인 및 안전한 처리
      if (response && typeof response === 'object' && 'data' in response) {
        const responseData = response.data as Record<string, unknown>;
        // 백엔드에서 RsData 형태로 응답하는 경우
        if ('resultCode' in responseData || 'success' in responseData) {
          return {
            success: true,
            message: (responseData.msg as string) || '전화번호가 성공적으로 변경되었습니다.'
          };
        }
        // 기타 응답 구조는 기본 성공 응답으로 처리
        return {
          success: true,
          message: '전화번호가 성공적으로 변경되었습니다.'
        };
      }
      
      // 응답이 없는 경우 기본 성공 응답
      return {
        success: true,
        message: '전화번호가 성공적으로 변경되었습니다.'
      };
    } catch (error: unknown) {
      console.error('전화번호 변경 실패:', error);
      throw new Error('전화번호 변경에 실패했습니다.');
    }
  },

  // 프로필 이미지 업데이트 (MultipartFile)
  async updateProfileImage(profileImage: File): Promise<UserProfileResponse> {
    try {
      const formData = new FormData();
      formData.append('profileImage', profileImage);

      const response = await apiClient.post<Record<string, unknown>>('/api/v1/users/exchange/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('프로필 이미지 변경 응답:', response);
      
      // 백엔드 응답 구조 확인 및 안전한 처리
      if (response && typeof response === 'object' && 'data' in response) {
        const responseData = response.data as Record<string, unknown>;
        // 백엔드에서 RsData 형태로 응답하는 경우
        if ('resultCode' in responseData || 'success' in responseData) {
          return {
            success: true,
            message: (responseData.msg as string) || '프로필 이미지가 성공적으로 변경되었습니다.'
          };
        }
        // 기타 응답 구조는 기본 성공 응답으로 처리
        return {
          success: true,
          message: '프로필 이미지가 성공적으로 변경되었습니다.'
        };
      }
      
      // 응답이 없는 경우 기본 성공 응답
      return {
        success: true,
        message: '프로필 이미지가 성공적으로 변경되었습니다.'
      };
    } catch (error: unknown) {
      console.error('프로필 이미지 변경 실패:', error);
      throw new Error('프로필 이미지 변경에 실패했습니다.');
    }
  },

  // 통합 프로필 데이터 변경 (새로운 엔드포인트 사용)
  async updateProfileData(request: ExchangeProfileDataRequest): Promise<ExchangeProfileDataResponse> {
    try {
      const response = await apiClient.post<Record<string, unknown>>('/api/v1/users/exchange/profile-data', request);
      
      console.log('통합 프로필 데이터 변경 응답:', response);
      
      // 백엔드 응답 구조 확인 및 안전한 처리
      if (response && typeof response === 'object' && 'data' in response) {
        const responseData = response.data as Record<string, unknown>;
        // 백엔드에서 RsData 형태로 응답하는 경우
        if ('resultCode' in responseData || 'success' in responseData) {
          return {
            success: true,
            message: (responseData.msg as string) || '프로필 정보가 성공적으로 변경되었습니다.'
          };
        }
        // 기타 응답 구조는 기본 성공 응답으로 처리
        return {
          success: true,
          message: '프로필 정보가 성공적으로 변경되었습니다.'
        };
      }
      
      // 응답이 없는 경우 기본 성공 응답
      return {
        success: true,
        message: '프로필 정보가 성공적으로 변경되었습니다.'
      };
    } catch (error: unknown) {
      console.error('통합 프로필 데이터 변경 실패:', error);
      throw new Error('프로필 정보 변경에 실패했습니다.');
    }
  },

  // 사용자 프로필 업데이트 (새로운 통합 엔드포인트 사용)
  async updateUserProfile(profile: UserProfile): Promise<UserProfileResponse> {
    try {
      // 변경할 데이터만 추출
      const updateData: ExchangeProfileDataRequest = {};
      
      // 닉네임이 있고 변경사항이 있는 경우만 포함
      if (profile.nickName && profile.nickName.trim() !== '') {
        updateData.nickname = profile.nickName.trim();
      }
      
      // 전화번호가 있고 변경사항이 있는 경우만 포함
      if (profile.phoneNum && profile.phoneNum.trim() !== '') {
        updateData.phoneNum = profile.phoneNum.trim();
      }
      
      // 변경할 데이터가 없는 경우
      if (!updateData.nickname && !updateData.phoneNum) {
        throw new Error('업데이트할 내용이 없습니다.');
      }
      
      console.log('통합 프로필 업데이트 시작:', updateData);
      
      // 새로운 통합 엔드포인트 호출
      const response = await this.updateProfileData(updateData);
      
      console.log('통합 프로필 업데이트 완료:', response);
      
      if (response.success) {
        return {
          success: true,
          message: response.message || '프로필이 성공적으로 업데이트되었습니다.'
        };
      } else {
        throw new Error(response.message || '프로필 업데이트에 실패했습니다.');
      }
    } catch (error: unknown) {
      console.error('사용자 프로필 업데이트 실패:', error);
      throw new Error('프로필 업데이트에 실패했습니다.');
    }
  },

  // 비밀번호 변경
  async changePassword(request: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    try {
      const response = await apiClient.post<Record<string, unknown>>('/api/v1/users/exchange/password', {
        password: request.newPassword
      });
      
      console.log('비밀번호 변경 응답:', response);
      
      // 백엔드 RsData 응답 구조 확인 및 처리
      if (response && typeof response === 'object' && 'data' in response) {
        const responseData = response.data as Record<string, unknown>;
        // RsData 형태: { resultCode: "204", msg: "비밀번호가 변경되었습니다.", data: null }
        if ('resultCode' in responseData && typeof responseData.resultCode === 'string') {
          const resultCode = responseData.resultCode;
          const message = (responseData.msg as string) || '비밀번호가 변경되었습니다.';
          
          // 200번대는 성공
          if (resultCode.startsWith('2')) {
            return {
              success: true,
              message: message
            };
          } else {
            return {
              success: false,
              message: message
            };
          }
        }
        
        // 기타 응답 구조는 기본 성공 응답으로 처리
        return {
          success: true,
          message: '비밀번호가 성공적으로 변경되었습니다.'
        };
      }
      
      // 응답이 없는 경우 기본 성공 응답
      return {
        success: true,
        message: '비밀번호가 성공적으로 변경되었습니다.'
      };
    } catch (error: unknown) {
      console.error('비밀번호 변경 실패:', error);
      throw new Error('비밀번호 변경에 실패했습니다.');
    }
  },

  // 사용자 계정 삭제
  async deleteAccount(): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.delete<{ success: boolean; message?: string }>('/api/v1/users/account');
      return response;
    } catch (error: unknown) {
      console.error('계정 삭제 실패:', error);
      throw new Error('계정 삭제에 실패했습니다.');
    }
  },

  // 관리자용 유저 통계 조회
  async getAllUserStatistics(): Promise<UserStatisticsResponse> {
    try {
      const response = await apiClient.get<{
        resultCode: string;
        msg: string;
        data: UserStatistics[];
      }>('/api/v1/users/statistics/');
      
      console.log('유저 통계 조회 응답:', response);
      
      // 백엔드 RsData 응답 구조 확인 및 처리
      if (response && typeof response === 'object') {
        // RsData 형태: { resultCode: "200", msg: "모든 유저의 정보를 찾았습니다.", data: [...] }
        if ('resultCode' in response && typeof response.resultCode === 'string') {
          const resultCode = response.resultCode;
          const message = response.msg || '유저 정보를 성공적으로 불러왔습니다.';
          const data = response.data || [];
          
          // 200번대는 성공
          if (resultCode.startsWith('2')) {
            return {
              success: true,
              data: data,
              message: message
            };
          } else {
            return {
              success: false,
              message: message
            };
          }
        }
        
        // 직접 배열이 반환되는 경우
        if (Array.isArray(response)) {
          return {
            success: true,
            data: response,
            message: '유저 정보를 성공적으로 불러왔습니다.'
          };
        }
      }
      
      // 응답이 없는 경우
      return {
        success: false,
        message: '유저 정보를 불러올 수 없습니다.'
      };
    } catch (error: unknown) {
      console.error('유저 통계 조회 실패:', error);
      
      // HTTP 상태 코드에 따른 오류 처리
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error as { response?: { status?: number } };
        const status = errorResponse.response?.status;
        if (status === 401) {
          throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
        } else if (status === 403) {
          throw new Error('관리자 권한이 필요합니다.');
        } else if (status === 500) {
          throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
      }
      
      throw new Error('유저 통계 정보를 불러올 수 없습니다.');
    }
  },

  // 유저 상태 변경
  async changeUserStatus(request: ChangeUserStatusRequest): Promise<ChangeUserStatusResponse> {
    try {
      const response = await apiClient.post<{
        resultCode: string;
        msg: string;
        data: unknown;
      }>('/api/v1/users/change/status', {
        userId: request.userId,
        status: request.status
      });
      
      console.log('유저 상태 변경 응답:', response);
      
      // 백엔드 RsData 응답 구조 확인 및 처리
      if (response && typeof response === 'object') {
        // RsData 형태: { resultCode: "201", msg: "상태를 변경하였습니다.", data: null }
        if ('resultCode' in response && typeof response.resultCode === 'string') {
          const resultCode = response.resultCode;
          const message = response.msg || '상태가 성공적으로 변경되었습니다.';
          
          // 200번대는 성공
          if (resultCode.startsWith('2')) {
            return {
              success: true,
              message: message
            };
          } else {
            return {
              success: false,
              message: message
            };
          }
        }
      }
      
      // 응답이 없는 경우
      return {
        success: false,
        message: '상태 변경에 실패했습니다.'
      };
    } catch (error: unknown) {
      console.error('유저 상태 변경 실패:', error);
      
      // HTTP 상태 코드에 따른 오류 처리
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error as { response?: { status?: number } };
        const status = errorResponse.response?.status;
        if (status === 401) {
          throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
        } else if (status === 403) {
          throw new Error('관리자 권한이 필요합니다.');
        } else if (status === 404) {
          throw new Error('유저를 찾을 수 없습니다.');
        } else if (status === 500) {
          throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
      }
      
      throw new Error('유저 상태 변경에 실패했습니다.');
    }
  },

  // 유저 완전 삭제 (관리자용)
  async deleteUser(userId: number): Promise<DeleteUserResponse> {
    try {
      // axios를 사용하여 직접 API 호출
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8090';
      
      const response = await axios.delete(`${API_BASE_URL}/api/v1/users/drop/${userId}`, {
        withCredentials: true,
        timeout: 10000
      });
      
      // 204 상태 코드는 성공으로 간주
      if (response.status === 204) {
        return {
          success: true,
          message: '유저가 성공적으로 삭제되었습니다.'
        };
      } else {
        return {
          success: true,
          message: (response.data as { msg?: string })?.msg || '유저가 성공적으로 삭제되었습니다.'
        };
      }
    } catch (error: unknown) {
      console.error('유저 삭제 실패:', error);
      
      // HTTP 상태 코드에 따른 오류 처리
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error as { response?: { status?: number; data?: unknown } };
        const status = errorResponse.response?.status;
        
        // 204 상태 코드는 성공으로 간주 (No Content)
        if (status === 204) {
          return {
            success: true,
            message: '유저가 성공적으로 삭제되었습니다.'
          };
        } else if (status === 401) {
          throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
        } else if (status === 403) {
          throw new Error('관리자 권한이 필요합니다.');
        } else if (status === 404) {
          throw new Error('유저를 찾을 수 없습니다.');
        } else if (status === 500) {
          throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
      }
      
      // 네트워크 오류나 기타 오류의 경우
      throw new Error('유저 삭제에 실패했습니다.');
    }
  },

  // 관리자용 유저 데이터 변경
  async changeUserData(request: ChangeUserDataRequest): Promise<ChangeUserDataResponse> {
    try {
      const response = await apiClient.patch<{
        resultCode: string;
        msg: string;
        data: unknown;
      }>('/api/v1/users/change/userdata', {
        userId: request.userId,
        userName: request.userName,
        userEmail: request.userEmail,
        userPhone: request.userPhone,
        userStatus: request.userStatus
      });
      
      console.log('유저 데이터 변경 응답:', response);
      
      // 백엔드 RsData 응답 구조 확인 및 처리
      if (response && typeof response === 'object') {
        // RsData 형태: { resultCode: "201", msg: "유저를 업데이트하였습니다", data: null }
        if ('resultCode' in response && typeof response.resultCode === 'string') {
          const resultCode = response.resultCode;
          const message = response.msg || '유저 데이터가 성공적으로 변경되었습니다.';
          
          // 200번대는 성공
          if (resultCode.startsWith('2')) {
            return {
              success: true,
              message: message
            };
          } else {
            return {
              success: false,
              message: message
            };
          }
        }
      }
      
      // 응답이 없는 경우
      return {
        success: false,
        message: '유저 데이터 변경에 실패했습니다.'
      };
    } catch (error: unknown) {
      console.error('유저 데이터 변경 실패:', error);
      
      // HTTP 상태 코드에 따른 오류 처리
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error as { response?: { status?: number } };
        const status = errorResponse.response?.status;
        if (status === 401) {
          throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
        } else if (status === 403) {
          throw new Error('관리자 권한이 필요합니다.');
        } else if (status === 404) {
          throw new Error('유저를 찾을 수 없습니다.');
        } else if (status === 500) {
          throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
      }
      
      throw new Error('유저 데이터 변경에 실패했습니다.');
    }
  },

  // 일괄 유저 상태 변경 (기존 API를 여러 번 호출)
  async bulkChangeUserStatus(request: BulkChangeUserStatusRequest): Promise<BulkChangeUserStatusResponse> {
    try {
      const results = [];
      const errors = [];
      
      // 각 유저에 대해 개별적으로 상태 변경 API 호출
      for (const userId of request.userIds) {
        try {
          const response = await this.changeUserStatus({
            userId: userId,
            status: request.status
          });
          
          if (response.success) {
            results.push({ userId, success: true });
          } else {
            errors.push({ userId, error: response.message || '상태 변경 실패' });
          }
        } catch (error) {
          errors.push({ 
            userId, 
            error: error instanceof Error ? error.message : '알 수 없는 오류' 
          });
        }
      }
      
      // 결과 요약
      const successCount = results.length;
      const errorCount = errors.length;
      
      if (errorCount === 0) {
        return {
          success: true,
          message: `${successCount}명의 유저 상태가 성공적으로 변경되었습니다.`
        };
      } else if (successCount > 0) {
        return {
          success: true,
          message: `${successCount}명 성공, ${errorCount}명 실패. 실패한 유저: ${errors.map(e => e.userId).join(', ')}`
        };
      } else {
        return {
          success: false,
          message: `모든 유저 상태 변경에 실패했습니다. 오류: ${errors.map(e => e.error).join(', ')}`
        };
      }
    } catch (error: unknown) {
      console.error('일괄 유저 상태 변경 실패:', error);
      throw new Error('일괄 유저 상태 변경에 실패했습니다.');
    }
  },

  // 사용자 통계 조회 (테마별)
  async getUserStatistics(theme: string): Promise<{
    success: boolean;
    data?: {
      totalUsers: number;
      activeUsers: number;
      newUsers: number;
      activeUserGrowthRate: number;
      newUserGrowthRate: number;
      complaintRate: number;
    };
    message?: string;
  }> {
    try {
      const response = await apiClient.get<{
        resultCode: string;
        msg: string;
        data: {
          totalUsers: number;
          activeUsers: number;
          newUsers: number;
          activeUserGrowthRate: number;
          newUserGrowthRate: number;
          complaintRate: number;
        };
      }>(`/api/v1/users/statistics/${theme}`);
      
      console.log('사용자 통계 조회 응답:', response);
      
      // 백엔드 RsData 응답 구조 확인 및 처리
      if (response && typeof response === 'object') {
        // RsData 형태: { resultCode: "200", msg: "theme 단위의 유저 통계입니다.", data: {...} }
        if ('resultCode' in response && typeof response.resultCode === 'string') {
          const resultCode = response.resultCode;
          const message = response.msg || '사용자 통계를 성공적으로 불러왔습니다.';
          const data = response.data;
          
          // 200번대는 성공
          if (resultCode.startsWith('2')) {
            return {
              success: true,
              data: data,
              message: message
            };
          } else {
            return {
              success: false,
              message: message
            };
          }
        }
      }
      
      // 응답이 없는 경우
      return {
        success: false,
        message: '사용자 통계를 불러올 수 없습니다.'
      };
    } catch (error: unknown) {
      console.error('사용자 통계 조회 실패:', error);
      
      // HTTP 상태 코드에 따른 오류 처리
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error as { response?: { status?: number } };
        const status = errorResponse.response?.status;
        if (status === 401) {
          throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
        } else if (status === 403) {
          throw new Error('관리자 권한이 필요합니다.');
        } else if (status === 500) {
          throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
      }
      
      throw new Error('사용자 통계 정보를 불러올 수 없습니다.');
    }
  }
};
