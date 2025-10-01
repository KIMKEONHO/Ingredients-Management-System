-- 사용자 활동 로그 테이블 생성
CREATE TABLE user_activities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    metadata TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_activities_user_id (user_id),
    INDEX idx_user_activities_activity_type (activity_type),
    INDEX idx_user_activities_created_at (created_at),
    INDEX idx_user_activities_user_activity_type (user_id, activity_type)
);

-- 활동 타입별 인덱스 추가
CREATE INDEX idx_user_activities_login ON user_activities(activity_type, created_at) WHERE activity_type = 'LOGIN';
CREATE INDEX idx_user_activities_recipe_view ON user_activities(activity_type, created_at) WHERE activity_type = 'RECIPE_VIEW';
CREATE INDEX idx_user_activities_recipe_create ON user_activities(activity_type, created_at) WHERE activity_type = 'RECIPE_CREATE';
