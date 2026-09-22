package com.habittracker.service;

import com.habittracker.dto.SyncBatchRequestDto;
import com.habittracker.dto.SyncBatchResponseDto;

public interface SyncService {
    SyncBatchResponseDto processBatchSync(Long userId, SyncBatchRequestDto batchRequest);
}
