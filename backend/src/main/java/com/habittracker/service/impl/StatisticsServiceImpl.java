package com.habittracker.service.impl;

import com.habittracker.config.CacheConfig;
import com.habittracker.dto.*;
import com.habittracker.entity.Habit;
import com.habittracker.entity.HabitCompletion;
import com.habittracker.exception.ResourceNotFoundException;
import com.habittracker.repository.HabitCompletionRepository;
import com.habittracker.repository.HabitRepository;
import com.habittracker.service.StatisticsService;
import com.habittracker.service.StreakService;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class StatisticsServiceImpl implements StatisticsService {

    private final HabitRepository habitRepository;
    private final HabitCompletionRepository completionRepository;
    private final StreakService streakService;

    public StatisticsServiceImpl(HabitRepository habitRepository,
                                 HabitCompletionRepository completionRepository,
                                 StreakService streakService) {
        this.habitRepository = habitRepository;
        this.completionRepository = completionRepository;
        this.streakService = streakService;
    }

    @Override
    @Cacheable(value = CacheConfig.CACHE_STATS_TODAY, key = "#userId")
    public TodayStatisticsDto getTodayStatistics(Long userId) {
        LocalDate today = LocalDate.now();
        List<Habit> habits = habitRepository.findByUserIdAndActiveTrue(userId);
        int totalHabits = habits.size();
        long completedCount = completionRepository.countByUserIdAndCompletionDate(userId, today);
        double percentage = totalHabits > 0 ? Math.round(((double) completedCount / totalHabits) * 100.0) : 0.0;

        List<HabitProgressDto> progressList = habits.stream().map(h -> {
            boolean done = completionRepository.existsByHabitIdAndCompletionDate(h.getId(), today);
            long completions30 = completionRepository.countByHabitIdAndCompletionDateBetween(h.getId(), today.minusDays(29), today);
            double hPercent = Math.min(100.0, Math.round(((double) completions30 / 30.0) * 100.0));
            long total = completionRepository.countByHabitId(h.getId());

            return new HabitProgressDto(
                    h.getId(),
                    h.getName(),
                    h.getCategory(),
                    h.getIcon(),
                    h.getColor(),
                    h.getCurrentStreak(),
                    h.getLongestStreak(),
                    (int) total,
                    hPercent,
                    done
            );
        }).collect(Collectors.toList());

        return new TodayStatisticsDto(today, totalHabits, (int) completedCount, percentage, progressList);
    }

    @Override
    @Cacheable(value = CacheConfig.CACHE_STATS_WEEK, key = "#userId")
    public WeekStatisticsDto getWeekStatistics(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate monday = today.with(DayOfWeek.MONDAY);
        LocalDate sunday = today.with(DayOfWeek.SUNDAY);

        List<Habit> habits = habitRepository.findByUserIdAndActiveTrue(userId);
        List<DailyStatDto> dailyStats = new ArrayList<>();

        LocalDate current = monday;
        while (!current.isAfter(sunday)) {
            long dayCompleted = completionRepository.countByUserIdAndCompletionDate(userId, current);
            double dayPercent = habits.size() > 0 ? Math.round(((double) dayCompleted / habits.size()) * 100.0) : 0.0;
            String dayName = current.getDayOfWeek().name().substring(0, 3);
            dailyStats.add(new DailyStatDto(current, dayName, habits.size(), (int) dayCompleted, dayPercent));
            current = current.plusDays(1);
        }

        int totalScheduled = habits.size() * 7;
        long totalCompleted = completionRepository.countByUserIdAndCompletionDateBetween(userId, monday, sunday);
        double weekPercent = totalScheduled > 0 ? Math.round(((double) totalCompleted / totalScheduled) * 100.0) : 0.0;

        List<HabitProgressDto> habitsProgress = habits.stream().map(h -> {
            boolean doneToday = completionRepository.existsByHabitIdAndCompletionDate(h.getId(), today);
            long countInWeek = completionRepository.countByHabitIdAndCompletionDateBetween(h.getId(), monday, sunday);
            double rate = Math.round(((double) countInWeek / 7.0) * 100.0);
            long total = completionRepository.countByHabitId(h.getId());

            return new HabitProgressDto(
                    h.getId(),
                    h.getName(),
                    h.getCategory(),
                    h.getIcon(),
                    h.getColor(),
                    h.getCurrentStreak(),
                    h.getLongestStreak(),
                    (int) total,
                    rate,
                    doneToday
            );
        }).collect(Collectors.toList());

        return new WeekStatisticsDto(monday, sunday, totalScheduled, (int) totalCompleted, weekPercent, dailyStats, habitsProgress);
    }

    @Override
    @Cacheable(value = CacheConfig.CACHE_STATS_MONTH, key = "#userId")
    public MonthStatisticsDto getMonthStatistics(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate firstDay = today.withDayOfMonth(1);
        LocalDate lastDay = today.withDayOfMonth(today.lengthOfMonth());
        int daysInMonth = today.lengthOfMonth();

        List<Habit> habits = habitRepository.findByUserIdAndActiveTrue(userId);
        long totalCompleted = completionRepository.countByUserIdAndCompletionDateBetween(userId, firstDay, lastDay);
        int totalPossible = habits.size() * daysInMonth;
        double monthPercent = totalPossible > 0 ? Math.round(((double) totalCompleted / totalPossible) * 100.0) : 0.0;

        int bestStreak = habits.stream().mapToInt(Habit::getLongestStreak).max().orElse(0);
        int currentStreak = habits.stream().mapToInt(Habit::getCurrentStreak).max().orElse(0);

        List<HabitProgressDto> habitsProgress = habits.stream().map(h -> {
            boolean doneToday = completionRepository.existsByHabitIdAndCompletionDate(h.getId(), today);
            long countInMonth = completionRepository.countByHabitIdAndCompletionDateBetween(h.getId(), firstDay, lastDay);
            double rate = Math.round(((double) countInMonth / daysInMonth) * 100.0);
            long total = completionRepository.countByHabitId(h.getId());

            return new HabitProgressDto(
                    h.getId(),
                    h.getName(),
                    h.getCategory(),
                    h.getIcon(),
                    h.getColor(),
                    h.getCurrentStreak(),
                    h.getLongestStreak(),
                    (int) total,
                    rate,
                    doneToday
            );
        }).collect(Collectors.toList());

        String monthTitle = today.getMonth().name().charAt(0) + today.getMonth().name().substring(1).toLowerCase() + " " + today.getYear();
        return new MonthStatisticsDto(today.getYear(), monthTitle, daysInMonth, (int) totalCompleted, monthPercent, bestStreak, currentStreak, habitsProgress);
    }

    @Override
    @Cacheable(value = CacheConfig.CACHE_STATS_HABIT, key = "#habitId + '_' + #userId")
    public HabitStatisticsDto getHabitStatistics(Long habitId, Long userId) {
        Habit habit = habitRepository.findByIdAndUserIdAndActiveTrue(habitId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found with id: " + habitId));

        LocalDate today = LocalDate.now();
        boolean completedToday = completionRepository.existsByHabitIdAndCompletionDate(habitId, today);
        long totalCompletions = completionRepository.countByHabitId(habitId);

        long weekCount = completionRepository.countByHabitIdAndCompletionDateBetween(habitId, today.minusDays(6), today);
        double weeklyRate = Math.round(((double) weekCount / 7.0) * 100.0);

        long monthCount = completionRepository.countByHabitIdAndCompletionDateBetween(habitId, today.minusDays(29), today);
        double monthlyRate = Math.round(((double) monthCount / 30.0) * 100.0);

        long daysSinceStart = Math.max(1, ChronoUnit.DAYS.between(habit.getStartDate(), today) + 1);
        double allTimeRate = Math.min(100.0, Math.round(((double) totalCompletions / daysSinceStart) * 100.0));

        List<LocalDate> recent = completionRepository.findByHabitIdOrderByCompletionDateDesc(habitId).stream()
                .limit(14)
                .map(HabitCompletion::getCompletionDate)
                .collect(Collectors.toList());

        return new HabitStatisticsDto(
                habit.getId(),
                habit.getName(),
                habit.getCurrentStreak(),
                habit.getLongestStreak(),
                (int) totalCompletions,
                completedToday,
                weeklyRate,
                monthlyRate,
                allTimeRate,
                recent
        );
    }
}
