package com.habittracker.dto;

import java.time.LocalDate;
import java.util.List;

public class TodayStatisticsDto {

    private LocalDate date;
    private int totalHabits;
    private int completedHabits;
    private double completionPercentage;
    private List<HabitProgressDto> habits;

    public TodayStatisticsDto() {
    }

    public TodayStatisticsDto(LocalDate date, int totalHabits, int completedHabits,
                              double completionPercentage, List<HabitProgressDto> habits) {
        this.date = date;
        this.totalHabits = totalHabits;
        this.completedHabits = completedHabits;
        this.completionPercentage = completionPercentage;
        this.habits = habits;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public int getTotalHabits() {
        return totalHabits;
    }

    public void setTotalHabits(int totalHabits) {
        this.totalHabits = totalHabits;
    }

    public int getCompletedHabits() {
        return completedHabits;
    }

    public void setCompletedHabits(int completedHabits) {
        this.completedHabits = completedHabits;
    }

    public double getCompletionPercentage() {
        return completionPercentage;
    }

    public void setCompletionPercentage(double completionPercentage) {
        this.completionPercentage = completionPercentage;
    }

    public List<HabitProgressDto> getHabits() {
        return habits;
    }

    public void setHabits(List<HabitProgressDto> habits) {
        this.habits = habits;
    }
}
