package com.example.ingredients_ms.domain.feedback.service;

import com.example.ingredients_ms.domain.complaint.entity.Complaint;
import com.example.ingredients_ms.domain.complaint.repository.ComplaintRepository;
import com.example.ingredients_ms.domain.feedback.dto.request.CreateComplaintFeedbackRequestDto;
import com.example.ingredients_ms.domain.feedback.dto.request.UpdateComplaintFeedbackRequestDto;
import com.example.ingredients_ms.domain.feedback.dto.response.ComplaintFeedbackResponseDto;
import com.example.ingredients_ms.domain.feedback.entity.ComplaintFeedback;
import com.example.ingredients_ms.domain.feedback.repository.ComplaintFeedbackRepository;
import com.example.ingredients_ms.domain.user.entity.User;
import com.example.ingredients_ms.domain.user.repository.UserRepository;
import com.example.ingredients_ms.global.exeption.BusinessLogicException;
import com.example.ingredients_ms.global.exeption.ExceptionCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ComplaintFeedbackService {

    private final ComplaintFeedbackRepository complaintFeedbackRepository;
    private final UserRepository userRepository;
    private final ComplaintRepository complaintRepository;


    // 피드백 조회
    public List<ComplaintFeedbackResponseDto> getFeedbacks(Long complaintId) {

        // 예외처리
        if(!complaintFeedbackRepository.existsByComplaintId(complaintId)){
            throw new BusinessLogicException(ExceptionCode.FEEDBACK_NOT_FOUND);
        }

        return complaintFeedbackRepository.findByComplaintId(complaintId).stream()
                .map(ComplaintFeedbackResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    // 모든 피드백 조회
    public List<ComplaintFeedbackResponseDto> getAllFeedback(){

        return complaintFeedbackRepository.findAll().stream()
                .map(ComplaintFeedbackResponseDto::fromEntity)
                .collect(Collectors.toList());

    }

    // 피드백 생성
    public ComplaintFeedbackResponseDto createFeedback(CreateComplaintFeedbackRequestDto requestDto, long userId, Long complaintId){

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.COMPLAINT_NOT_FOUND));


        ComplaintFeedback complaintFeedback = ComplaintFeedback.builder()
                .complaint(complaint)
                .responder(user)
                .title(requestDto.getTitle())
                .content(requestDto.getContent())
                .build();

        return ComplaintFeedbackResponseDto.fromEntity(complaintFeedbackRepository.save(complaintFeedback));
    }

    // 피드백 수정
    public ComplaintFeedbackResponseDto updateFeedback(Long feedbackId, UpdateComplaintFeedbackRequestDto requestDto) {

        ComplaintFeedback feedback = complaintFeedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.FEEDBACK_NOT_FOUND));

        feedback.setTitle(requestDto.getTitle());
        feedback.setContent(requestDto.getContent());

        return ComplaintFeedbackResponseDto.fromEntity(complaintFeedbackRepository.save(feedback));
    }

    // 피드백 삭제
    public void deleteFeedback(Long feedbackId){

        if(!complaintFeedbackRepository.existsById(feedbackId)){
            throw new BusinessLogicException(ExceptionCode.FEEDBACK_NOT_FOUND);
        }

        complaintFeedbackRepository.deleteById(feedbackId);
    }



}

