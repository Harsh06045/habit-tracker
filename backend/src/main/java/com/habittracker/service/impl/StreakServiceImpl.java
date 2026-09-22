package com.habittracker.service.impl;

import com.habittracker.entity.Habit;
import com.habittracker.entity.HabitCompletion;
import com.habittracker.repository.HabitCompletionRepository;
import com.habittracker.repository.HabitRepository;
import com.habittracker.service.StreakService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class StreakServiceImpl implements StreakService {

    private final HabitCompletionRepository completionRepository;
    private final HabitRepository habitRepository;

    public StreakServiceImpl(HabitCompletionRepository completionRepository,
                             HabitRepository habitRepository) {
        this.completionRepository = completionRepository;
        this.habitRepository = habitRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public int calculateCurrentStreak(Long habitId) {
        return calculateCurrentStreak(habitId, LocalDate.now());
    }

    @Override
    @Transactional(readOnly = true)
    public int calculateCurrentStreak(Long habitId, LocalDate asOfDate) {
        if (asOfDate == null) {
            asOfDate = LocalDate.now();
        }

        boolean completedToday = completionRepository.existsByHabitIdAndCompletionDate(habitId, asOfDate);
        LocalDate checkDate;
        int streak = 0;

        if (completedToday) {
            streak = 1;
            checkDate = asOfDate.minusDays(1);
        } else {
            // Check yesterday: if completed yesterday, today is pending and streak is still alive
            boolean completedYesterday = completionRepository.existsByHabitIdAndCompletionDate(habitId, asOfDate.minusDays(1));
            if (!completedYesterday) {
                // Broken streak
                return 0;
            }
            streak = 1;
            checkDate = asOfDate.minusDays(2);
        }

        // Count consecutive days backward
        while (completionRepository.existsByHabitIdAndCompletionDate(habitId, checkDate)) {
            streak++;
            checkDate = checkDate.minusDays(1);
        }

        return streak;
    }

    @Override
    @Transactional(readOnly = true)
    public int calculateBestStreak(Long habitId) {
        List<HabitCompletion> completions = completionRepository.findByHabitIdOrderByCompletionDateAsc(habitId);
        if (completions.isEmpty()) {
            return 0;
        }

        List<LocalDate> sortedDates = completions.stream()
                .map(HabitCompletion::getCompletionDate)
                .distinct()
                .sorted()
                .collect(Collectors.toList());

        if (sortedDates.isEmpty()) {
            return 0;
        }

        int maxStreak = 1;
        int currentStreak = 1;

        for (int i = 1; i < sortedDates.size(); i++) {
            LocalDate prev = sortedDates.get(i - 1);
            LocalDate curr = sortedDates.get(i);

            if (curr.equals(prev.plusDays(1))) {
                currentStreak++;
                if (currentStreak > maxStreak) {
                    maxStreak = currentStreak;
                }
            } else {
                currentStreak = 1;
            }
        }

        return maxStreak;
    }

    @Override
    public void updateHabitStreaks(Long habitId) {
        Habit habit = habitRepository.findById(habitId).orElse(null);
        if (habit == null) return;

        int currentStreak = calculateCurrentStreak(habitId);
        int bestStreak = calculateBestStreak(habitId);

        habit.setCurrentStreak(currentStreak);
        habit.setLongestStreak(Math.max(habit.getLongestStreak(), bestStreak));
        habitRepository.save(habit);
    }
}
