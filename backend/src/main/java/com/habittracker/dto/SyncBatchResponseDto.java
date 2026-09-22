package com.habittracker.dto;

import java.util.HashMap;
import java.util.Map;

public class SyncBatchResponseDto {

    private boolean success;
    private int replayedCount;
    private Map<String, Long> idMappings = new HashMap<>();
    private String message;

    public SyncBatchResponseDto() {
    }

    public SyncBatchResponseDto(boolean success, int replayedCount, Map<String, Long> idMappings, String message) {
        this.success = success;
        this.replayedCount = replayedCount;
        this.idMappings = idMappings;
        this.message = message;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public int getReplayedCount() {
        return replayedCount;
    }

    public void setReplayedCount(int replayedCount) {
        this.replayedCount = replayedCount;
    }

    public Map<String, Long> getIdMappings() {
        return idMappings;
    }

    public void setIdMappings(Map<String, Long> idMappings) {
        this.idMappings = idMappings;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
