package com.habittracker.dto;

public class HabitProgressDto {

    private Long id;
    private String name;
    private String category;
    private String icon;
    private String color;
    private int streak;
    private int longestStreak;
    private int totalCompletions;
    private double completionPercentage;
    private boolean completedToday;

    public HabitProgressDto() {
    }

    public HabitProgressDto(Long id, String name, String category, String icon, String color,
                            int streak, int longestStreak, int totalCompletions,
                            double completionPercentage, boolean completedToday) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.icon = icon;
        this.color = color;
        this.streak = streak;
        this.longestStreak = longestStreak;
        this.totalCompletions = totalCompletions;
        this.completionPercentage = completionPercentage;
        this.completedToday = completedToday;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public int getStreak() {
        return streak;
    }

    public void setStreak(int streak) {
        this.streak = streak;
    }

    public int getLongestStreak() {
        return longestStreak;
    }

    public void setLongestStreak(int longestStreak) {
        this.longestStreak = longestStreak;
    }

    public int getTotalCompletions() {
        return totalCompletions;
    }

    public void setTotalCompletions(int totalCompletions) {
        this.totalCompletions = totalCompletions;
    }

    public double getCompletionPercentage() {
        return completionPercentage;
    }

    public void setCompletionPercentage(double completionPercentage) {
        this.completionPercentage = completionPercentage;
    }

    public boolean isCompletedToday() {
        return completedToday;
    }

    public void setCompletedToday(boolean completedToday) {
        this.completedToday = completedToday;
    }
}
