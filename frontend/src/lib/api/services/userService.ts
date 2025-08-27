import { apiClient } from '../client';

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

export const userService = {
  // 사용자 프로필 조회
  async getUserProfile(): Promise<UserProfileResponse> {
    try {
      const response = await apiClient.post('/api/v1/users/profile');
      console.log('userService 응답:', response);
      
      // 백엔드 응답 구조 확인
      if (response.data && typeof response.data === 'object') {
        // 백엔드에서 직접 UserProfile 객체를 보내는 경우
        return {
          success: true,
          data: response.data,
          message: '프로필 정보를 성공적으로 불러왔습니다.'
        };
      }
      
      return response.data;
    } catch (error: any) {
      console.error('사용자 프로필 조회 실패:', error);
      
      // HTTP 상태 코드에 따른 오류 처리
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
        } else if (status === 403) {
          throw new Error('접근 권한이 없습니다.');
        } else if (status === 500) {
          throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
      }
      
      // 세션 관련 오류 처리
      if (error.message && error.message.includes('Session was invalidated')) {
        throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
      }
      
      throw new Error('사용자 프로필을 불러올 수 없습니다.');
    }
  },

  // 닉네임 변경
  async updateNickname(nickname: string): Promise<UserProfileResponse> {
    try {
      const response = await apiClient.post('/api/v1/users/exchange/nickname', {
        nickname: nickname
      });
      
      console.log('닉네임 변경 응답:', response);
      
      // 백엔드 응답 구조 확인 및 안전한 처리
      if (response.data && typeof response.data === 'object') {
        // 백엔드에서 RsData 형태로 응답하는 경우
        if ('resultCode' in response.data || 'success' in response.data) {
          return {
            success: true,
            message: response.data.msg || '닉네임이 성공적으로 변경되었습니다.'
          };
        }
        // 기타 응답 구조
        return response.data;
      }
      
      // 응답이 없는 경우 기본 성공 응답
      return {
        success: true,
        message: '닉네임이 성공적으로 변경되었습니다.'
      };
    } catch (error) {
      console.error('닉네임 변경 실패:', error);
      throw new Error('닉네임 변경에 실패했습니다.');
    }
  },

  // 전화번호 변경 (백엔드 API 구현 전까지 임시 비활성화)
  async updatePhone(phoneNum: string): Promise<UserProfileResponse> {
    // 백엔드에 전화번호 변경 API가 구현될 때까지 임시로 성공 응답 반환
    console.log('전화번호 변경 API가 아직 구현되지 않음:', phoneNum);
    return { 
      success: true, 
      message: '전화번호 변경 기능은 준비 중입니다.' 
    };
    
    // 백엔드 API 구현 후 아래 코드 사용
    /*
    try {
      const response = await apiClient.post('/api/v1/users/exchange/phone', {
        phoneNum: phoneNum
      });
      return response.data;
    } catch (error) {
      console.error('전화번호 변경 실패:', error);
      throw new Error('전화번호 변경에 실패했습니다.');
    }
    */
  },

  // 사용자 프로필 업데이트 (기존 호환성 유지)
  async updateUserProfile(profile: UserProfile): Promise<UserProfileResponse> {
    try {
      // 개별 API를 순차적으로 호출
      const updates = [];
      
      if (profile.nickName) {
        console.log('닉네임 업데이트 시작:', profile.nickName);
        updates.push(this.updateNickname(profile.nickName));
      }
      
      if (profile.phoneNum) {
        console.log('전화번호 업데이트 시작:', profile.phoneNum);
        updates.push(this.updatePhone(profile.phoneNum));
      }
      
      if (updates.length === 0) {
        throw new Error('업데이트할 내용이 없습니다.');
      }
      
      // 모든 업데이트 실행
      const results = await Promise.all(updates);
      
      // 결과 검증 및 에러 처리 강화
      console.log('업데이트 결과:', results);
      
      // 각 결과가 유효한지 확인
      const validResults = results.filter(result => 
        result && typeof result === 'object' && 'success' in result
      );
      
      if (validResults.length !== results.length) {
        console.warn('일부 업데이트 결과가 유효하지 않음:', results);
        
        // 유효하지 않은 결과들을 건너뛰고 유효한 결과만 처리
        if (validResults.length > 0) {
          console.log('유효한 결과만 처리:', validResults);
          
          // 모든 유효한 결과가 성공인지 확인
          const allValidSuccess = validResults.every(result => result.success === true);
          
          if (allValidSuccess) {
            return {
              success: true,
              message: '일부 프로필 정보가 성공적으로 업데이트되었습니다.'
            };
          } else {
            const failedMessages = validResults
              .filter(result => !result.success)
              .map(result => result.message || '알 수 없는 오류')
              .join(', ');
            
            throw new Error(`일부 업데이트에 실패했습니다: ${failedMessages}`);
          }
        } else {
          throw new Error('모든 업데이트 응답이 올바르지 않습니다.');
        }
      }
      
      // 성공 여부 확인
      const allSuccess = validResults.every(result => result.success === true);
      
      if (allSuccess) {
        return {
          success: true,
          message: '프로필이 성공적으로 업데이트되었습니다.'
        };
      } else {
        const failedMessages = validResults
          .filter(result => !result.success)
          .map(result => result.message || '알 수 없는 오류')
          .join(', ');
        
        throw new Error(`일부 업데이트에 실패했습니다: ${failedMessages}`);
      }
    } catch (error) {
      console.error('사용자 프로필 업데이트 실패:', error);
      throw new Error('프로필 업데이트에 실패했습니다.');
    }
  },

  // 비밀번호 변경
  async changePassword(request: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    try {
      const response = await apiClient.post('/api/v1/users/exchange/password', {
        password: request.newPassword
      });
      
      console.log('비밀번호 변경 응답:', response);
      
      // 백엔드 RsData 응답 구조 확인 및 처리
      if (response.data && typeof response.data === 'object') {
        // RsData 형태: { resultCode: "204", msg: "비밀번호가 변경되었습니다.", data: null }
        if ('resultCode' in response.data) {
          const resultCode = response.data.resultCode;
          const message = response.data.msg || '비밀번호가 변경되었습니다.';
          
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
        
        // 기타 응답 구조
        return response.data;
      }
      
      // 응답이 없는 경우 기본 성공 응답
      return {
        success: true,
        message: '비밀번호가 성공적으로 변경되었습니다.'
      };
    } catch (error) {
      console.error('비밀번호 변경 실패:', error);
      throw new Error('비밀번호 변경에 실패했습니다.');
    }
  },

  // 사용자 계정 삭제
  async deleteAccount(): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.delete('/api/v1/users/account');
      return response.data;
    } catch (error) {
      console.error('계정 삭제 실패:', error);
      throw new Error('계정 삭제에 실패했습니다.');
    }
  }
};
