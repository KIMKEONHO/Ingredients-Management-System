package com.example.ingredients_ms.domain.complaint.repository;

import com.example.ingredients_ms.domain.complaint.entity.Complaint;
import com.example.ingredients_ms.domain.complaint.entity.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    List<Complaint> findByUserId(Long id);
    long countByStatus(ComplaintStatus status);
    
    // 통계용 메서드
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
