package com.habittracker.service;

import java.time.LocalDate;

public interface StreakService {
    int calculateCurrentStreak(Long habitId);
    int calculateCurrentStreak(Long habitId, LocalDate asOfDate);
    int calculateBestStreak(Long habitId);
    void updateHabitStreaks(Long habitId);
}
