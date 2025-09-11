package com.example.ingredients_ms.domain.complaint.service;

import com.example.ingredients_ms.domain.complaint.dto.request.CreateComplaintRequestDto;
import com.example.ingredients_ms.domain.complaint.dto.response.ComplaintDetailResponseDto;
import com.example.ingredients_ms.domain.complaint.dto.response.CreateComplaintResponseDto;
import com.example.ingredients_ms.domain.complaint.entity.Category;
import com.example.ingredients_ms.domain.complaint.entity.Complaint;
import com.example.ingredients_ms.domain.complaint.entity.ComplaintStatus;
import com.example.ingredients_ms.domain.complaint.repository.ComplaintRepository;
import com.example.ingredients_ms.domain.user.entity.User;
import com.example.ingredients_ms.domain.user.repository.UserRepository;
import com.example.ingredients_ms.global.exeption.BusinessLogicException;
import com.example.ingredients_ms.global.exeption.ExceptionCode;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    @Transactional
    public CreateComplaintResponseDto createComplaint(Long userId, CreateComplaintRequestDto requestDto){

        Optional<User> opUser = userRepository.findById(userId);

        if(opUser.isEmpty()){
            throw new BusinessLogicException(ExceptionCode.USER_NOT_FOUND);
        }

        User user = opUser.get();
        Category category = Category.fromCode(requestDto.getCategoryCode());

        Complaint complaint = Complaint.builder()
                .title(requestDto.getTitle())
                .content(requestDto.getContent())
                .user(user)
                .status(ComplaintStatus.PENDING)
                .category(category)
                .build();

        complaintRepository.save(complaint);

        return CreateComplaintResponseDto.builder()
                .title(requestDto.getTitle())
                .content(requestDto.getContent())
                .build();
    }

    // 컴플레인 상세보기
    public ComplaintDetailResponseDto showComplaintDetails(Long complaintId){

        Complaint complaint = findComplaint(complaintId);

        return ComplaintDetailResponseDto.builder()
                .complaintId(complaintId)
                .title(complaint.getTitle())
                .content(complaint.getContent())
                .createdAt(complaint.getCreatedAt())
                .build();
    }

    // 유저의 모든 컴플레인 조회
    public List<ComplaintDetailResponseDto> getComplaintsByUsers(Long userId){

        List<Complaint> complaints = complaintRepository.findByUserId(userId);

        return complaints.stream()
                .map(complaint -> ComplaintDetailResponseDto.builder()
                        .title(complaint.getTitle())
                        .content(complaint.getContent())
                        .complaintId(complaint.getId())
                        .status(complaint.getStatus())
                        .createdAt(complaint.getCreatedAt())
                        .build())
                .toList();
    }

    // 모든 컴플레인 조회
    @Transactional
    public List<ComplaintDetailResponseDto> getAllComplaints(){
        List<Complaint> complaints = complaintRepository.findAll();
        return complaints.stream()
                .map(complaint -> ComplaintDetailResponseDto.builder()
                        .title(complaint.getTitle())
                        .content(complaint.getContent())
                        .complaintId(complaint.getId())
                        .status(complaint.getStatus())
                        .category(complaint.getCategory())
                        .createdAt(complaint.getCreatedAt())
                        .userName(complaint.getUser().getUserName())
                        .build())
                .toList();
    }

    @Transactional
    public CreateComplaintResponseDto updateComplaint(Long complaintId, CreateComplaintRequestDto requestDto, Long userId){
        Complaint complaint = findComplaint(complaintId);

        if(isOwner(complaint, userId)){
            complaint.setTitle(requestDto.getTitle());
            complaint.setContent(requestDto.getContent());
            complaintRepository.save(complaint);
        }else {
            throw new BusinessLogicException(ExceptionCode.NOT_OWNER);
        }

        return CreateComplaintResponseDto.builder()
                .title(complaint.getTitle())
                .content(complaint.getContent())
                .build();
    }

    // 컴플레인 찾기
    public Complaint findComplaint(Long complaintId){
        Optional<Complaint> complaint = complaintRepository.findById(complaintId);
        if(complaint.isEmpty()){
            throw new BusinessLogicException(ExceptionCode.COMPLAINT_NOT_FOUND);
        }
        return complaint.get();
    }

    public boolean isOwner(Complaint complaint, Long userId){
        if(complaint.getUser().getId().equals(userId)){
            return true;
        }else{
            return false;
        }
    }

    @Transactional
    public void deleteComplaint(Long complaintId, Long userId){
        Complaint complaint = findComplaint(complaintId);
        if(isOwner(complaint, userId)){
            complaintRepository.delete(complaint);
        }else {
            throw new BusinessLogicException(ExceptionCode.NOT_OWNER);
        }
    }

    @Transactional
    public void updateComplaintStatus(Long complaintId, int statusCode, String role) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.ID_NOT_FOUND));

        log.info("role : {}", role );

        ComplaintStatus status = ComplaintStatus.fromCode(statusCode);
        complaint.setStatus(status);

        complaintRepository.save(complaint);
    }


}
