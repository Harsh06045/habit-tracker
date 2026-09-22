package com.habittracker.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class CompletionResponseDto {

    private Long habitId;
    private String habitName;
    private LocalDate completionDate;
    private boolean completed;
    private Integer streak;
    private LocalDateTime completedAt;

    public CompletionResponseDto() {
    }

    public CompletionResponseDto(Long habitId, String habitName, LocalDate completionDate, boolean completed, Integer streak, LocalDateTime completedAt) {
        this.habitId = habitId;
        this.habitName = habitName;
        this.completionDate = completionDate;
        this.completed = completed;
        this.streak = streak;
        this.completedAt = completedAt;
    }

    public Long getHabitId() {
        return habitId;
    }

    public void setHabitId(Long habitId) {
        this.habitId = habitId;
    }

    public String getHabitName() {
        return habitName;
    }

    public void setHabitName(String habitName) {
        this.habitName = habitName;
    }

    public LocalDate getCompletionDate() {
        return completionDate;
    }

    public void setCompletionDate(LocalDate completionDate) {
        this.completionDate = completionDate;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public Integer getStreak() {
        return streak;
    }

    public void setStreak(Integer streak) {
        this.streak = streak;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}
