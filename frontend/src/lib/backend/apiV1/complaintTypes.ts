// 민원 관련 타입 정의
export interface ComplaintDetailResponseDto {
  complaintId: number;
  category: 'REQUEST' | 'COMPLAINT'; // Spring Boot에서 enum은 이름으로 직렬화됨
  title: string;
  content: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED'; // Spring Boot에서 enum은 이름으로 직렬화됨
  createdAt: string; // LocalDateTime을 문자열로 받음 (예: "2024-08-28T10:30:00")
  userName: string;
}

export interface RsDataComplaintDetailResponseDto {
  resultCode?: string;
  msg?: string;
  data?: ComplaintDetailResponseDto;
}

export interface RsDataListComplaintDetailResponseDto {
  resultCode?: string;
  msg?: string;
  data?: ComplaintDetailResponseDto[];
}

// 프론트엔드에서 사용할 민원 타입 (백엔드 데이터를 변환한 형태)
export interface Complaint {
  id: string;
  title: string;
  content: string;
  status: 'received' | 'processing' | 'completed' | 'pending' | 'rejected';
  submissionDate: string;
  deadline: string;
  category: '식자재 요청' | '민원';
  daysLeft?: number;
  userName?: string;
}

// 카테고리 매핑 함수 (백엔드 enum 이름을 프론트엔드 표시명으로 변환)
export const mapBackendCategoryToFrontend = (backendCategory: 'REQUEST' | 'COMPLAINT'): '식자재 요청' | '민원' => {
  switch (backendCategory) {
    case 'REQUEST':
      return '식자재 요청';
    case 'COMPLAINT':
      return '민원';
    default:
      return '민원';
  }
};

// 상태 매핑 함수 (백엔드 enum 이름을 프론트엔드 상태로 변환)
export const mapBackendStatusToFrontend = (backendStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED'): 'received' | 'processing' | 'completed' | 'pending' | 'rejected' => {
  switch (backendStatus) {
    case 'PENDING':
      return 'pending';
    case 'IN_PROGRESS':
      return 'processing';
    case 'COMPLETED':
      return 'completed';
    case 'REJECTED':
      return 'rejected';
    default:
      return 'received';
  }
};

// 백엔드 데이터를 프론트엔드 형태로 변환하는 함수
export const transformComplaintData = (backendData: ComplaintDetailResponseDto[]): Complaint[] => {
  if (!Array.isArray(backendData)) {
    return [];
  }
  
  console.log('백엔드에서 받은 원본 데이터:', backendData);
  
  return backendData.map((item, index) => {
    console.log(`민원 ${index + 1} 원본 데이터:`, {
      complaintId: item.complaintId,
      category: item.category,
      status: item.status,
      title: item.title,
      userName: item.userName
    });
    
    // 백엔드에서 받은 createdAt을 접수일자로 사용
    const submissionDate = new Date(item.createdAt);
    
    // 접수일자 기준으로 2주 후 처리기한 설정
    const deadline = new Date(submissionDate);
    deadline.setDate(deadline.getDate() + 14);
    
    // 현재 날짜와 처리기한 사이의 일수 계산
    const today = new Date();
    const timeDiff = deadline.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    // 현재 연도 가져오기
    const currentYear = new Date().getFullYear();
    
    const transformedItem = {
      id: `C${currentYear}-${String(item.complaintId).padStart(4, '0')}`,
      title: item.title,
      content: item.content,
      status: mapBackendStatusToFrontend(item.status),
      submissionDate: submissionDate.toLocaleDateString('ko-KR').replace(/\./g, '.').replace(/\s/g, ''),
      deadline: deadline.toLocaleDateString('ko-KR').replace(/\./g, '.').replace(/\s/g, ''),
      category: mapBackendCategoryToFrontend(item.category),
      daysLeft: daysLeft > 0 ? daysLeft : 0,
      userName: item.userName
    };
    
    console.log(`민원 ${index + 1} 변환된 데이터:`, {
      id: transformedItem.id,
      category: transformedItem.category,
      status: transformedItem.status,
      title: transformedItem.title,
      userName: transformedItem.userName
    });
    
    return transformedItem;
  });
};
