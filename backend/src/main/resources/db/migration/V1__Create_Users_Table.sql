CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_num VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    nickname VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    social_id VARCHAR(255),
    sso_provider VARCHAR(50),
    profile VARCHAR(512),
    refresh_token VARCHAR(512),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    role VARCHAR(50) NOT NULL,
    social_provider VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_users_email (email),
    INDEX idx_users_social_id (social_id, sso_provider),
    INDEX idx_users_phone_name (phone_num, user_name),
    INDEX idx_users_role (role),
    INDEX idx_users_status (status)
);