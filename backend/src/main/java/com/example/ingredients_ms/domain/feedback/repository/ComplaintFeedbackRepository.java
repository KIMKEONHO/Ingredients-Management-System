package com.example.ingredients_ms.domain.feedback.repository;

import com.example.ingredients_ms.domain.feedback.entity.ComplaintFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintFeedbackRepository extends JpaRepository<ComplaintFeedback, Long> {
    Optional<ComplaintFeedback> findByComplaintId(Long complaintId);


    boolean existsByComplaintId(Long complaintId);
}
