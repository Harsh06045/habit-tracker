package com.habittracker.service.impl;

import com.habittracker.dto.NotificationResponseDto;
import com.habittracker.entity.Habit;
import com.habittracker.entity.Notification;
import com.habittracker.entity.User;
import com.habittracker.exception.ResourceNotFoundException;
import com.habittracker.repository.HabitRepository;
import com.habittracker.repository.NotificationRepository;
import com.habittracker.repository.UserRepository;
import com.habittracker.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final HabitRepository habitRepository;
    private final UserRepository userRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository,
                                   HabitRepository habitRepository,
                                   UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.habitRepository = habitRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponseDto> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByScheduledTimeAsc(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public NotificationResponseDto sendHabitReminder(Long userId, Long habitId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Habit habit = habitRepository.findByIdAndUserIdAndActiveTrue(habitId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found with id: " + habitId + " for this user"));

        LocalTime reminderTime = (habit.getReminderTime() != null)
                ? habit.getReminderTime()
                : LocalTime.now();

        String title = "🔔 Time for your " + habit.getName() + "!";
        String message = "Stay on track with your daily goal. Don't break your " + habit.getName() + " streak!";

        Notification notification = new Notification(user, habit, title, message, reminderTime);
        notification.setSent(true);
        notification.setSentAt(LocalDateTime.now());

        Notification saved = notificationRepository.save(notification);
        return mapToDto(saved);
    }

    @Override
    public NotificationResponseDto scheduleHabitReminder(Long userId, Long habitId, LocalTime reminderTime) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Habit habit = habitRepository.findByIdAndUserIdAndActiveTrue(habitId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found with id: " + habitId + " for this user"));

        String title = "🔔 Time for your " + habit.getName() + "!";
        String message = "Reminder to complete " + habit.getName() + " today.";

        Notification notification = new Notification(user, habit, title, message, reminderTime);
        notification.setSent(false);

        Notification saved = notificationRepository.save(notification);
        return mapToDto(saved);
    }

    private NotificationResponseDto mapToDto(Notification notification) {
        NotificationResponseDto dto = new NotificationResponseDto();
        dto.setId(notification.getId());
        if (notification.getHabit() != null) {
            dto.setHabitId(notification.getHabit().getId());
            dto.setHabitName(notification.getHabit().getName());
        }
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setScheduledTime(notification.getScheduledTime());
        dto.setSent(notification.isSent());
        dto.setSentAt(notification.getSentAt());
        return dto;
    }
}
