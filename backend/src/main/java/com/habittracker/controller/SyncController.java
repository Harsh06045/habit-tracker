package com.habittracker.controller;

import com.habittracker.dto.ApiResponse;
import com.habittracker.dto.SyncBatchRequestDto;
import com.habittracker.dto.SyncBatchResponseDto;
import com.habittracker.security.UserPrincipal;
import com.habittracker.service.SyncService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/sync")
public class SyncController {

    private final SyncService syncService;

    public SyncController(SyncService syncService) {
        this.syncService = syncService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SyncBatchResponseDto>> processSync(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody SyncBatchRequestDto batchRequest) {
        SyncBatchResponseDto response = syncService.processBatchSync(userPrincipal.getId(), batchRequest);
        return ResponseEntity.ok(ApiResponse.ok("Sync processed successfully", response));
    }
}
