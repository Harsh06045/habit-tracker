package com.habittracker.dto;

import java.util.ArrayList;
import java.util.List;

public class GamificationProfileDto {

    private int totalPoints;
    private int level;
    private String levelTitle;
    private int nextLevelPoints;
    private double progressToNextLevel;
    private int completedHabitCount;
    private int longestStreakAchieved;
    private int badgesCount;
    private List<BadgeDto> badges = new ArrayList<>();

    public GamificationProfileDto() {
    }

    public GamificationProfileDto(int totalPoints, int level, String levelTitle, int nextLevelPoints,
                                  double progressToNextLevel, int completedHabitCount,
                                  int longestStreakAchieved, int badgesCount, List<BadgeDto> badges) {
        this.totalPoints = totalPoints;
        this.level = level;
        this.levelTitle = levelTitle;
        this.nextLevelPoints = nextLevelPoints;
        this.progressToNextLevel = progressToNextLevel;
        this.completedHabitCount = completedHabitCount;
        this.longestStreakAchieved = longestStreakAchieved;
        this.badgesCount = badgesCount;
        this.badges = badges;
    }

    public int getTotalPoints() {
        return totalPoints;
    }

    public void setTotalPoints(int totalPoints) {
        this.totalPoints = totalPoints;
    }

    public int getLevel() {
        return level;
    }

    public void setLevel(int level) {
        this.level = level;
    }

    public String getLevelTitle() {
        return levelTitle;
    }

    public void setLevelTitle(String levelTitle) {
        this.levelTitle = levelTitle;
    }

    public int getNextLevelPoints() {
        return nextLevelPoints;
    }

    public void setNextLevelPoints(int nextLevelPoints) {
        this.nextLevelPoints = nextLevelPoints;
    }

    public double getProgressToNextLevel() {
        return progressToNextLevel;
    }

    public void setProgressToNextLevel(double progressToNextLevel) {
        this.progressToNextLevel = progressToNextLevel;
    }

    public int getCompletedHabitCount() {
        return completedHabitCount;
    }

    public void setCompletedHabitCount(int completedHabitCount) {
        this.completedHabitCount = completedHabitCount;
    }

    public int getLongestStreakAchieved() {
        return longestStreakAchieved;
    }

    public void setLongestStreakAchieved(int longestStreakAchieved) {
        this.longestStreakAchieved = longestStreakAchieved;
    }

    public int getBadgesCount() {
        return badgesCount;
    }

    public void setBadgesCount(int badgesCount) {
        this.badgesCount = badgesCount;
    }

    public List<BadgeDto> getBadges() {
        return badges;
    }

    public void setBadges(List<BadgeDto> badges) {
        this.badges = badges;
    }
}
