package com.example.ingredients_ms.domain.complaint.controller;

import com.example.ingredients_ms.domain.complaint.dto.request.CreateComplaintRequestDto;
import com.example.ingredients_ms.domain.complaint.dto.response.ComplaintDetailResponseDto;
import com.example.ingredients_ms.domain.complaint.dto.response.CreateComplaintResponseDto;
import com.example.ingredients_ms.domain.complaint.service.ComplaintService;
import com.example.ingredients_ms.global.rsdata.RsData;
import com.example.ingredients_ms.global.security.CurrentUser;
import com.example.ingredients_ms.global.security.SecurityUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/complaints")
@RequiredArgsConstructor
@Slf4j
public class ComplaintController {

    private final ComplaintService complaintService;

    // ( 전체 조회 )
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public RsData<List<ComplaintDetailResponseDto>> getComplaints(){

        List<ComplaintDetailResponseDto> responseDto = complaintService.getAllComplaints();

        return new RsData<>("200","모든 민원을 찾았습니다.",responseDto);
    }

    // ( 단건 조회 )
    @GetMapping("/{compliantId}")
    public RsData<ComplaintDetailResponseDto> getComplaint(@PathVariable("compliantId") Long compliantId){
        ComplaintDetailResponseDto responseDto = complaintService.showComplaintDetails(compliantId);
        return new RsData<>("200","해당 민원을 찾았습니다.", responseDto);
    }

    // ( 작성 )
    @PostMapping("/")
    public RsData<CreateComplaintResponseDto> cretaeComplaint(
            @RequestBody CreateComplaintRequestDto requestDto,
            @CurrentUser SecurityUser currentUser){

        CreateComplaintResponseDto responseDto =  complaintService.createComplaint(currentUser.getId(), requestDto);

        return new RsData<>("201","민원이 생성되었습니다.", responseDto);
    }

    // ( 본인거 단건 조회 )
    @GetMapping("/users")
    public RsData<List<ComplaintDetailResponseDto>> getComplaintsByUsers(@CurrentUser SecurityUser currentUser){

        List<ComplaintDetailResponseDto> responseDto = complaintService.getComplaintsByUsers(currentUser.getId());

        return new RsData<>("200", "유저의 민원을 찾았습니다.", responseDto);
    }

    // 컴플레인 업데이트
    @PatchMapping("/{complaintId}")
    public RsData<?> updateComplaint(
            @PathVariable("complaintId") Long complaintId,
            @RequestBody CreateComplaintRequestDto requestDto,
            @CurrentUser SecurityUser currentUser){

        CreateComplaintResponseDto responseDto = complaintService.updateComplaint(complaintId, requestDto, currentUser.getId());

        return new RsData<>("200","민원이 업데이트 되었습니다.", responseDto);
    }

    // 컴플레인 삭제
    @DeleteMapping("/{complaintId}")
    public RsData<?> deleteComplaint(
            @PathVariable("complaintId") Long complaintId,
            @CurrentUser SecurityUser currentUser){

        complaintService.deleteComplaint(complaintId, currentUser.getId());

        return new RsData<>("204", "민원이 삭제되었습니다.");
    }

    // 관리자가 민원 상태를 변경하는 것
    @PatchMapping("/{complaintId}/status/{statusCode}")
    @PreAuthorize("hasRole('ADMIN')")
    public RsData<?> updateComplaintStatus(
            @PathVariable("complaintId") Long complaintId,
            @PathVariable("statusCode") int statusCode,
            @CurrentUser SecurityUser currentUser){

        complaintService.updateComplaintStatus(complaintId, statusCode, currentUser.getAuthentication().toString());

        return new RsData<>("201", "민원 상태가 변경되었습니다.");
    }


}
