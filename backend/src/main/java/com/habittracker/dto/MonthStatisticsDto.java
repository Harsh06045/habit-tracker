package com.habittracker.dto;

import java.util.List;

public class MonthStatisticsDto {

    private int year;
    private String month;
    private int daysInMonth;
    private int totalCompleted;
    private double completionPercentage;
    private int bestStreak;
    private int currentStreak;
    private List<HabitProgressDto> habits;

    public MonthStatisticsDto() {
    }

    public MonthStatisticsDto(int year, String month, int daysInMonth, int totalCompleted,
                              double completionPercentage, int bestStreak, int currentStreak,
                              List<HabitProgressDto> habits) {
        this.year = year;
        this.month = month;
        this.daysInMonth = daysInMonth;
        this.totalCompleted = totalCompleted;
        this.completionPercentage = completionPercentage;
        this.bestStreak = bestStreak;
        this.currentStreak = currentStreak;
        this.habits = habits;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public int getDaysInMonth() {
        return daysInMonth;
    }

    public void setDaysInMonth(int daysInMonth) {
        this.daysInMonth = daysInMonth;
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

    public int getBestStreak() {
        return bestStreak;
    }

    public void setBestStreak(int bestStreak) {
        this.bestStreak = bestStreak;
    }

    public int getCurrentStreak() {
        return currentStreak;
    }

    public void setCurrentStreak(int currentStreak) {
        this.currentStreak = currentStreak;
    }

    public List<HabitProgressDto> getHabits() {
        return habits;
    }

    public void setHabits(List<HabitProgressDto> habits) {
        this.habits = habits;
    }
}
