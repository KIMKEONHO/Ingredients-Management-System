package com.example.ingredients_ms.domain.feedback.controller;

import com.example.ingredients_ms.domain.feedback.dto.request.CreateComplaintFeedbackRequestDto;
import com.example.ingredients_ms.domain.feedback.dto.request.UpdateComplaintFeedbackRequestDto;
import com.example.ingredients_ms.domain.feedback.dto.response.ComplaintFeedbackResponseDto;
import com.example.ingredients_ms.domain.feedback.service.ComplaintFeedbackService;
import com.example.ingredients_ms.global.rsdata.RsData;
import com.example.ingredients_ms.global.security.CurrentUser;
import com.example.ingredients_ms.global.security.SecurityUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/feedback")
@Tag(name = "민원 피드백 API", description = "민원 및 요청에 대한 피드백의 관리를 위한 API")
@RequiredArgsConstructor
public class ComplaintFeedbackController {

    private final ComplaintFeedbackService complaintFeedbackService;

    @Operation(summary = "피드백 조회", description = "특정 문의의 모든 피드백내용을 조회합니다.")
    @GetMapping("/{complaintId}")
    public RsData<ComplaintFeedbackResponseDto> getFeedback(@PathVariable Long complaintId) {
        ComplaintFeedbackResponseDto feedbackResponse = complaintFeedbackService.getFeedback(complaintId);
        return new RsData<>("200", "피드백 조회에 성공하였습니다.", feedbackResponse);
    }

    @Operation(summary = "피드백 목록 조회", description = "작성된 모든 피드백의 목록을 조회합니다.")
    @GetMapping("/")
    public RsData<List<ComplaintFeedbackResponseDto>> getAllFeedback() {
        List<ComplaintFeedbackResponseDto> responseDtos = complaintFeedbackService.getAllFeedback();
        return new RsData<>("200", "모든 피드백의 조회에 성공하였습니다.",responseDtos);
    }

    @PostMapping("/{complaintId}")
    public RsData<?> createFeedback(
            @PathVariable Long complaintId,
            @RequestBody CreateComplaintFeedbackRequestDto requestDto,
            @CurrentUser SecurityUser currentUser){
        ComplaintFeedbackResponseDto responseDto = complaintFeedbackService.createFeedback(requestDto,currentUser.getId(),complaintId);
        return new RsData<>("200","피드백이 성공적으로 추가되었습니다.",responseDto);
    }

    @PutMapping("/{feedbackId}")
    public RsData<ComplaintFeedbackResponseDto> updateFeedback(
            @PathVariable Long feedbackId,
            @RequestBody UpdateComplaintFeedbackRequestDto requestDto){
        ComplaintFeedbackResponseDto responseDto = complaintFeedbackService.updateFeedback(feedbackId, requestDto);
        return new RsData<>("200", "피드백이 성공적으로 수정되었습니다.", responseDto);
    }

    @DeleteMapping("/{feedbackId}")
    public RsData<ComplaintFeedbackResponseDto> deleteFeedback(@PathVariable Long feedbackId){

        complaintFeedbackService.deleteFeedback(feedbackId);
        return new RsData<>("200", "피드백이 성공적으로 삭제되었습니다.");

    }



}
