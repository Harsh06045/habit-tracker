package com.habittracker.dto;

import java.time.LocalDate;
import java.util.List;

public class HabitStatisticsDto {

    private Long habitId;
    private String habitName;
    private int currentStreak;
    private int bestStreak;
    private int totalCompletions;
    private boolean completedToday;
    private double weeklyCompletionRate;
    private double monthlyCompletionRate;
    private double allTimeCompletionRate;
    private List<LocalDate> recentCompletions;

    public HabitStatisticsDto() {
    }

    public HabitStatisticsDto(Long habitId, String habitName, int currentStreak, int bestStreak,
                              int totalCompletions, boolean completedToday,
                              double weeklyCompletionRate, double monthlyCompletionRate,
                              double allTimeCompletionRate, List<LocalDate> recentCompletions) {
        this.habitId = habitId;
        this.habitName = habitName;
        this.currentStreak = currentStreak;
        this.bestStreak = bestStreak;
        this.totalCompletions = totalCompletions;
        this.completedToday = completedToday;
        this.weeklyCompletionRate = weeklyCompletionRate;
        this.monthlyCompletionRate = monthlyCompletionRate;
        this.allTimeCompletionRate = allTimeCompletionRate;
        this.recentCompletions = recentCompletions;
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

    public int getCurrentStreak() {
        return currentStreak;
    }

    public void setCurrentStreak(int currentStreak) {
        this.currentStreak = currentStreak;
    }

    public int getBestStreak() {
        return bestStreak;
    }

    public void setBestStreak(int bestStreak) {
        this.bestStreak = bestStreak;
    }

    public int getTotalCompletions() {
        return totalCompletions;
    }

    public void setTotalCompletions(int totalCompletions) {
        this.totalCompletions = totalCompletions;
    }

    public boolean isCompletedToday() {
        return completedToday;
    }

    public void setCompletedToday(boolean completedToday) {
        this.completedToday = completedToday;
    }

    public double getWeeklyCompletionRate() {
        return weeklyCompletionRate;
    }

    public void setWeeklyCompletionRate(double weeklyCompletionRate) {
        this.weeklyCompletionRate = weeklyCompletionRate;
    }

    public double getMonthlyCompletionRate() {
        return monthlyCompletionRate;
    }

    public void setMonthlyCompletionRate(double monthlyCompletionRate) {
        this.monthlyCompletionRate = monthlyCompletionRate;
    }

    public double getAllTimeCompletionRate() {
        return allTimeCompletionRate;
    }

    public void setAllTimeCompletionRate(double allTimeCompletionRate) {
        this.allTimeCompletionRate = allTimeCompletionRate;
    }

    public List<LocalDate> getRecentCompletions() {
        return recentCompletions;
    }

    public void setRecentCompletions(List<LocalDate> recentCompletions) {
        this.recentCompletions = recentCompletions;
    }
}
