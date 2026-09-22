package com.habittracker.service;

import com.habittracker.dto.HabitStatisticsDto;
import com.habittracker.dto.MonthStatisticsDto;
import com.habittracker.dto.TodayStatisticsDto;
import com.habittracker.dto.WeekStatisticsDto;

public interface StatisticsService {
    TodayStatisticsDto getTodayStatistics(Long userId);
    WeekStatisticsDto getWeekStatistics(Long userId);
    MonthStatisticsDto getMonthStatistics(Long userId);
    HabitStatisticsDto getHabitStatistics(Long habitId, Long userId);
}
