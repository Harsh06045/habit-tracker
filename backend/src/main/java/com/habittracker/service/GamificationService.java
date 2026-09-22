package com.habittracker.service;

import com.habittracker.dto.BadgeDto;
import com.habittracker.dto.GamificationProfileDto;

import java.util.List;

public interface GamificationService {
    GamificationProfileDto getProfile(Long userId);
    List<BadgeDto> getAllBadgesForUser(Long userId);
    void onHabitCompleted(Long userId, Long habitId, int currentStreak);
    void onHabitUncompleted(Long userId, Long habitId);
}
