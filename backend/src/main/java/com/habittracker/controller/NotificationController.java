package com.habittracker.controller;

import com.habittracker.dto.ApiResponse;
import com.habittracker.dto.NotificationResponseDto;
import com.habittracker.security.UserPrincipal;
import com.habittracker.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponseDto>>> getUserNotifications(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<NotificationResponseDto> notifications = notificationService.getUserNotifications(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Notifications retrieved successfully", notifications));
    }

    @PostMapping("/send-reminder/{habitId}")
    public ResponseEntity<ApiResponse<NotificationResponseDto>> sendHabitReminder(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long habitId) {
        NotificationResponseDto reminder = notificationService.sendHabitReminder(userPrincipal.getId(), habitId);
        return ResponseEntity.ok(ApiResponse.ok("Habit reminder triggered successfully", reminder));
    }
}
