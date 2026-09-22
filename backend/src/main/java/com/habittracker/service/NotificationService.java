package com.habittracker.service;

import com.habittracker.dto.NotificationResponseDto;

import java.time.LocalTime;
import java.util.List;

public interface NotificationService {
    List<NotificationResponseDto> getUserNotifications(Long userId);
    NotificationResponseDto sendHabitReminder(Long userId, Long habitId);
    NotificationResponseDto scheduleHabitReminder(Long userId, Long habitId, LocalTime reminderTime);
}
