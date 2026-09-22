package com.habittracker.dto;

import java.time.LocalDateTime;
import java.time.LocalTime;

public class NotificationResponseDto {

    private Long id;
    private Long habitId;
    private String habitName;
    private String title;
    private String message;
    private LocalTime scheduledTime;
    private boolean sent;
    private LocalDateTime sentAt;

    public NotificationResponseDto() {
    }

    public NotificationResponseDto(Long id, Long habitId, String habitName, String title,
                                   String message, LocalTime scheduledTime, boolean sent, LocalDateTime sentAt) {
        this.id = id;
        this.habitId = habitId;
        this.habitName = habitName;
        this.title = title;
        this.message = message;
        this.scheduledTime = scheduledTime;
        this.sent = sent;
        this.sentAt = sentAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalTime getScheduledTime() {
        return scheduledTime;
    }

    public void setScheduledTime(LocalTime scheduledTime) {
        this.scheduledTime = scheduledTime;
    }

    public boolean isSent() {
        return sent;
    }

    public void setSent(boolean sent) {
        this.sent = sent;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }
}
