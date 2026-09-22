package com.habittracker.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "gamification_profiles")
public class GamificationProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "total_points", nullable = false)
    private Integer totalPoints = 0;

    @Column(name = "current_level", nullable = false)
    private Integer currentLevel = 1;

    @Column(name = "level_title", nullable = false, length = 100)
    private String levelTitle = "Novice Explorer";

    @Column(name = "completed_habit_count", nullable = false)
    private Integer completedHabitCount = 0;

    @Column(name = "longest_streak_achieved", nullable = false)
    private Integer longestStreakAchieved = 0;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public GamificationProfile() {
    }

    public GamificationProfile(User user) {
        this.user = user;
        this.totalPoints = 0;
        this.currentLevel = 1;
        this.levelTitle = "Novice Explorer";
        this.completedHabitCount = 0;
        this.longestStreakAchieved = 0;
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Integer getTotalPoints() {
        return totalPoints;
    }

    public void setTotalPoints(Integer totalPoints) {
        this.totalPoints = totalPoints;
    }

    public Integer getCurrentLevel() {
        return currentLevel;
    }

    public void setCurrentLevel(Integer currentLevel) {
        this.currentLevel = currentLevel;
    }

    public String getLevelTitle() {
        return levelTitle;
    }

    public void setLevelTitle(String levelTitle) {
        this.levelTitle = levelTitle;
    }

    public Integer getCompletedHabitCount() {
        return completedHabitCount;
    }

    public void setCompletedHabitCount(Integer completedHabitCount) {
        this.completedHabitCount = completedHabitCount;
    }

    public Integer getLongestStreakAchieved() {
        return longestStreakAchieved;
    }

    public void setLongestStreakAchieved(Integer longestStreakAchieved) {
        this.longestStreakAchieved = longestStreakAchieved;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
