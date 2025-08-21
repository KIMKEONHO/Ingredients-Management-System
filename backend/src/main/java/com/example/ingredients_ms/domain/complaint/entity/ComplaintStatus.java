package com.example.ingredients_ms.domain.complaint.entity;

// Complaint.java 내부 또는 별도 파일
public enum ComplaintStatus {

    // 보류, 진행 중, 완료, 거부됨
    PENDING(1),
    IN_PROGRESS(2),
    COMPLETED(3),
    REJECTED(4);

    private final int code;

    ComplaintStatus(int code) {
        this.code = code;
    }

    public int getCode() {
        return code;
    }

    public static ComplaintStatus fromCode(int code) {
        for (ComplaintStatus status : ComplaintStatus.values()) {
            if (status.getCode() == code) {
                return status;
            }
        }
        throw new IllegalArgumentException("Invalid status code: " + code);
    }
}