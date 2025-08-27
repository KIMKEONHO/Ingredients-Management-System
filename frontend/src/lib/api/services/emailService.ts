import { apiClient } from '../client';

export interface EmailDto {
  mail: string;
  verifyCode?: string;
}

export interface EmailResponse {
  success: boolean;
  message?: string;
}

export const emailService = {
  // 인증코드 메일 발송
  async sendVerificationCode(email: string): Promise<EmailResponse> {
    try {
      const response = await apiClient.post('/api/v1/email/send', {
        mail: email
      });
      
      console.log('이메일 인증코드 발송 응답:', response);
      
      // 백엔드 RsData 응답 구조 확인 및 처리
      if (response.data && typeof response.data === 'object') {
        const responseData = response.data as Record<string, unknown>;
        if ('resultCode' in responseData && typeof responseData.resultCode === 'string') {
          const resultCode = responseData.resultCode;
          const message = (responseData.msg as string) || '인증 메일이 발송되었습니다.';
          
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
        return responseData as EmailResponse;
      }
      
      return {
        success: true,
        message: '인증 메일이 발송되었습니다.'
      };
    } catch (error: unknown) {
      console.error('이메일 인증코드 발송 실패:', error);
      throw new Error('인증 메일 발송에 실패했습니다.');
    }
  },

  // 인증코드 검증
  async verifyCode(email: string, verifyCode: string): Promise<EmailResponse> {
    try {
      const response = await apiClient.post('/api/v1/email/verify', {
        mail: email,
        verifyCode: verifyCode
      });
      
      console.log('이메일 인증코드 검증 응답:', response);
      
      // 백엔드 RsData 응답 구조 확인 및 처리
      if (response.data && typeof response.data === 'object') {
        const responseData = response.data as Record<string, unknown>;
        if ('resultCode' in responseData && typeof responseData.resultCode === 'string') {
          const resultCode = responseData.resultCode;
          const message = (responseData.msg as string) || '인증되었습니다.';
          
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
        return responseData as EmailResponse;
      }
      
      return {
        success: true,
        message: '인증되었습니다.'
      };
    } catch (error: unknown) {
      console.error('이메일 인증코드 검증 실패:', error);
      throw new Error('인증코드 검증에 실패했습니다.');
    }
  }
};
