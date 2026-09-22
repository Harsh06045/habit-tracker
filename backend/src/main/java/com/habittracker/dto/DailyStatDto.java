package com.habittracker.dto;

import java.time.LocalDate;

public class DailyStatDto {

    private LocalDate date;
    private String dayName;
    private int totalHabits;
    private int completedHabits;
    private double completionPercentage;

    public DailyStatDto() {
    }

    public DailyStatDto(LocalDate date, String dayName, int totalHabits, int completedHabits, double completionPercentage) {
        this.date = date;
        this.dayName = dayName;
        this.totalHabits = totalHabits;
        this.completedHabits = completedHabits;
        this.completionPercentage = completionPercentage;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getDayName() {
        return dayName;
    }

    public void setDayName(String dayName) {
        this.dayName = dayName;
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
}
