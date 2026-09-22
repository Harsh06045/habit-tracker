package com.habittracker.dto;

import java.time.LocalDate;

public class SyncOperationDto {

    private String type; // CREATE_HABIT, COMPLETE_HABIT, UNCOMPLETE_HABIT, EDIT_HABIT, DELETE_HABIT
    private String tempId;
    private Long habitId;
    private LocalDate date;
    private HabitRequestDto habitData;
    private Long timestamp;

    public SyncOperationDto() {
    }

    public SyncOperationDto(String type, String tempId, Long habitId, LocalDate date, HabitRequestDto habitData, Long timestamp) {
        this.type = type;
        this.tempId = tempId;
        this.habitId = habitId;
        this.date = date;
        this.habitData = habitData;
        this.timestamp = timestamp;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTempId() {
        return tempId;
    }

    public void setTempId(String tempId) {
        this.tempId = tempId;
    }

    public Long getHabitId() {
        return habitId;
    }

    public void setHabitId(Long habitId) {
        this.habitId = habitId;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public HabitRequestDto getHabitData() {
        return habitData;
    }

    public void setHabitData(HabitRequestDto habitData) {
        this.habitData = habitData;
    }

    public Long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Long timestamp) {
        this.timestamp = timestamp;
    }
}
