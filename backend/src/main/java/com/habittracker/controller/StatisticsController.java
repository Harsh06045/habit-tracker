package com.habittracker.controller;

import com.habittracker.dto.*;
import com.habittracker.security.UserPrincipal;
import com.habittracker.service.StatisticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class StatisticsController {

    private final StatisticsService statisticsService;

    public StatisticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    @GetMapping("/api/v1/statistics/today")
    public ResponseEntity<ApiResponse<TodayStatisticsDto>> getTodayStatistics(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        TodayStatisticsDto stats = statisticsService.getTodayStatistics(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Today's statistics retrieved successfully", stats));
    }

    @GetMapping("/api/v1/statistics/week")
    public ResponseEntity<ApiResponse<WeekStatisticsDto>> getWeekStatistics(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        WeekStatisticsDto stats = statisticsService.getWeekStatistics(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Weekly statistics retrieved successfully", stats));
    }

    @GetMapping("/api/v1/statistics/month")
    public ResponseEntity<ApiResponse<MonthStatisticsDto>> getMonthStatistics(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        MonthStatisticsDto stats = statisticsService.getMonthStatistics(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Monthly statistics retrieved successfully", stats));
    }

    @GetMapping("/api/v1/habits/{id}/statistics")
    public ResponseEntity<ApiResponse<HabitStatisticsDto>> getHabitStatistics(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        HabitStatisticsDto stats = statisticsService.getHabitStatistics(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Habit statistics retrieved successfully", stats));
    }
}
