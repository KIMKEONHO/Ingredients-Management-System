package com.example.ingredients_ms.domain.complaint.service;

import com.example.ingredients_ms.domain.complaint.entity.ComplaintStatus;
import com.example.ingredients_ms.domain.complaint.repository.ComplaintRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ComplaintStatisticsService {

    private final ComplaintRepository complaintRepository;

    public double getComplaintRate() {
        long totalComplaints = complaintRepository.count();

        if (totalComplaints == 0) {
            return 0.0; // 민원이 하나도 없으면 0% 처리율
        }

        long resolvedComplaints = complaintRepository.countByStatus(ComplaintStatus.COMPLETED);

        return (double) resolvedComplaints / totalComplaints * 100.0;
    }


}
