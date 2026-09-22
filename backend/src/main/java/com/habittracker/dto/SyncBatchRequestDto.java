package com.habittracker.dto;

import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

public class SyncBatchRequestDto {

    @NotNull
    private List<SyncOperationDto> operations = new ArrayList<>();

    public SyncBatchRequestDto() {
    }

    public SyncBatchRequestDto(List<SyncOperationDto> operations) {
        this.operations = operations;
    }

    public List<SyncOperationDto> getOperations() {
        return operations;
    }

    public void setOperations(List<SyncOperationDto> operations) {
        this.operations = operations;
    }
}
