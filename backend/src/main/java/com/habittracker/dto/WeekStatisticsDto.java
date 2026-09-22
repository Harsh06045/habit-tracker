package com.habittracker.dto;

import java.time.LocalDate;
import java.util.List;

public class WeekStatisticsDto {

    private LocalDate startDate;
    private LocalDate endDate;
    private int totalScheduled;
    private int totalCompleted;
    private double completionPercentage;
    private List<DailyStatDto> dailyBreakdown;
    private List<HabitProgressDto> habits;

    public WeekStatisticsDto() {
    }

    public WeekStatisticsDto(LocalDate startDate, LocalDate endDate, int totalScheduled, int totalCompleted,
                             double completionPercentage, List<DailyStatDto> dailyBreakdown,
                             List<HabitProgressDto> habits) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.totalScheduled = totalScheduled;
        this.totalCompleted = totalCompleted;
        this.completionPercentage = completionPercentage;
        this.dailyBreakdown = dailyBreakdown;
        this.habits = habits;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public int getTotalScheduled() {
        return totalScheduled;
    }

    public void setTotalScheduled(int totalScheduled) {
        this.totalScheduled = totalScheduled;
    }

    public int getTotalCompleted() {
        return totalCompleted;
    }

    public void setTotalCompleted(int totalCompleted) {
        this.totalCompleted = totalCompleted;
    }

    public double getCompletionPercentage() {
        return completionPercentage;
    }

    public void setCompletionPercentage(double completionPercentage) {
        this.completionPercentage = completionPercentage;
    }

    public List<DailyStatDto> getDailyBreakdown() {
        return dailyBreakdown;
    }

    public void setDailyBreakdown(List<DailyStatDto> dailyBreakdown) {
        this.dailyBreakdown = dailyBreakdown;
    }

    public List<HabitProgressDto> getHabits() {
        return habits;
    }

    public void setHabits(List<HabitProgressDto> habits) {
        this.habits = habits;
    }
}
