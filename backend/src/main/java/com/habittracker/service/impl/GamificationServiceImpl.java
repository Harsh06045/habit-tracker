package com.habittracker.service.impl;

import com.habittracker.config.CacheConfig;
import com.habittracker.dto.BadgeDto;
import com.habittracker.dto.GamificationProfileDto;
import com.habittracker.entity.GamificationProfile;
import com.habittracker.entity.Habit;
import com.habittracker.entity.User;
import com.habittracker.entity.UserBadge;
import com.habittracker.exception.ResourceNotFoundException;
import com.habittracker.repository.*;
import com.habittracker.service.GamificationService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class GamificationServiceImpl implements GamificationService {

    public static final int POINTS_HABIT_COMPLETED = 10;
    public static final int POINTS_STREAK_7_BONUS = 50;
    public static final int POINTS_STREAK_30_BONUS = 200;
    public static final int POINTS_PERFECT_DAY_BONUS = 25;

    private static final Map<String, BadgeDefinition> SYSTEM_BADGES = new LinkedHashMap<>();

    static {
        SYSTEM_BADGES.put("FIRST_STEP", new BadgeDefinition(
                "FIRST_STEP", "First Step", "Completed your first habit!", "footprints"
        ));
        SYSTEM_BADGES.put("STREAK_7", new BadgeDefinition(
                "STREAK_7", "7-Day Streak Champion", "Maintained a habit streak for 7 consecutive days!", "flame"
        ));
        SYSTEM_BADGES.put("STREAK_30", new BadgeDefinition(
                "STREAK_30", "Habit Master (30 Days)", "Reached an unbroken 30-day streak!", "trophy"
        ));
        SYSTEM_BADGES.put("PERFECT_DAY", new BadgeDefinition(
                "PERFECT_DAY", "Daily Perfection", "Completed every routine habit scheduled for today!", "sparkles"
        ));
        SYSTEM_BADGES.put("CENTURY_CLUB", new BadgeDefinition(
                "CENTURY_CLUB", "Century Club", "Completed habits over 100 times!", "award"
        ));
    }

    private final GamificationProfileRepository profileRepository;
    private final UserBadgeRepository badgeRepository;
    private final UserRepository userRepository;
    private final HabitRepository habitRepository;
    private final HabitCompletionRepository completionRepository;

    public GamificationServiceImpl(GamificationProfileRepository profileRepository,
                                   UserBadgeRepository badgeRepository,
                                   UserRepository userRepository,
                                   HabitRepository habitRepository,
                                   HabitCompletionRepository completionRepository) {
        this.profileRepository = profileRepository;
        this.badgeRepository = badgeRepository;
        this.userRepository = userRepository;
        this.habitRepository = habitRepository;
        this.completionRepository = completionRepository;
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = CacheConfig.CACHE_GAMIFICATION, key = "#userId")
    public GamificationProfileDto getProfile(Long userId) {
        GamificationProfile profile = getOrCreateProfile(userId);
        List<BadgeDto> allBadges = getAllBadgesForUser(userId);

        LevelInfo levelInfo = calculateLevel(profile.getTotalPoints());

        return new GamificationProfileDto(
                profile.getTotalPoints(),
                levelInfo.level,
                levelInfo.title,
                levelInfo.nextLevelPoints,
                levelInfo.progressPercentage,
                profile.getCompletedHabitCount(),
                profile.getLongestStreakAchieved(),
                (int) allBadges.stream().filter(BadgeDto::isUnlocked).count(),
                allBadges
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<BadgeDto> getAllBadgesForUser(Long userId) {
        Map<String, UserBadge> userUnlocked = badgeRepository.findByUserIdOrderByUnlockedAtAsc(userId).stream()
                .collect(Collectors.toMap(UserBadge::getBadgeCode, b -> b, (a, b) -> a));

        List<BadgeDto> badges = new ArrayList<>();
        for (BadgeDefinition def : SYSTEM_BADGES.values()) {
            boolean unlocked = userUnlocked.containsKey(def.code);
            LocalDateTime unlockedAt = unlocked ? userUnlocked.get(def.code).getUnlockedAt() : null;
            badges.add(new BadgeDto(def.code, def.name, def.description, def.icon, unlocked, unlockedAt));
        }
        return badges;
    }

    @Override
    @CacheEvict(value = CacheConfig.CACHE_GAMIFICATION, key = "#userId")
    public void onHabitCompleted(Long userId, Long habitId, int currentStreak) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        GamificationProfile profile = getOrCreateProfile(userId);

        // 1. Base points
        int pointsToAdd = POINTS_HABIT_COMPLETED;
        profile.setCompletedHabitCount(profile.getCompletedHabitCount() + 1);

        if (currentStreak > profile.getLongestStreakAchieved()) {
            profile.setLongestStreakAchieved(currentStreak);
        }

        // 2. First Step Badge
        if (!badgeRepository.existsByUserIdAndBadgeCode(userId, "FIRST_STEP")) {
            unlockBadge(user, "FIRST_STEP");
            pointsToAdd += 10;
        }

        // 3. 7-Day Streak Bonus & Badge
        if (currentStreak >= 7 && !badgeRepository.existsByUserIdAndBadgeCode(userId, "STREAK_7")) {
            unlockBadge(user, "STREAK_7");
            pointsToAdd += POINTS_STREAK_7_BONUS;
        }

        // 4. 30-Day Streak Bonus & Badge
        if (currentStreak >= 30 && !badgeRepository.existsByUserIdAndBadgeCode(userId, "STREAK_30")) {
            unlockBadge(user, "STREAK_30");
            pointsToAdd += POINTS_STREAK_30_BONUS;
        }

        // 5. Perfect Day Bonus (All habits scheduled today are completed)
        LocalDate today = LocalDate.now();
        List<Habit> userHabits = habitRepository.findByUserIdAndActiveTrue(userId);
        if (!userHabits.isEmpty()) {
            boolean allDone = true;
            for (Habit h : userHabits) {
                if (!completionRepository.existsByHabitIdAndCompletionDate(h.getId(), today)) {
                    allDone = false;
                    break;
                }
            }
            if (allDone) {
                pointsToAdd += POINTS_PERFECT_DAY_BONUS;
                if (!badgeRepository.existsByUserIdAndBadgeCode(userId, "PERFECT_DAY")) {
                    unlockBadge(user, "PERFECT_DAY");
                }
            }
        }

        // 6. Century Club (100 completions)
        if (profile.getCompletedHabitCount() >= 100 && !badgeRepository.existsByUserIdAndBadgeCode(userId, "CENTURY_CLUB")) {
            unlockBadge(user, "CENTURY_CLUB");
            pointsToAdd += 150;
        }

        profile.setTotalPoints(profile.getTotalPoints() + pointsToAdd);

        LevelInfo levelInfo = calculateLevel(profile.getTotalPoints());
        profile.setCurrentLevel(levelInfo.level);
        profile.setLevelTitle(levelInfo.title);
        profile.setUpdatedAt(LocalDateTime.now());

        profileRepository.save(profile);
    }

    @Override
    @CacheEvict(value = CacheConfig.CACHE_GAMIFICATION, key = "#userId")
    public void onHabitUncompleted(Long userId, Long habitId) {
        profileRepository.findByUserId(userId).ifPresent(profile -> {
            profile.setTotalPoints(Math.max(0, profile.getTotalPoints() - POINTS_HABIT_COMPLETED));
            profile.setCompletedHabitCount(Math.max(0, profile.getCompletedHabitCount() - 1));

            LevelInfo levelInfo = calculateLevel(profile.getTotalPoints());
            profile.setCurrentLevel(levelInfo.level);
            profile.setLevelTitle(levelInfo.title);
            profile.setUpdatedAt(LocalDateTime.now());

            profileRepository.save(profile);
        });
    }

    private GamificationProfile getOrCreateProfile(Long userId) {
        return profileRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
            GamificationProfile newProfile = new GamificationProfile(user);
            return profileRepository.save(newProfile);
        });
    }

    private void unlockBadge(User user, String badgeCode) {
        BadgeDefinition def = SYSTEM_BADGES.get(badgeCode);
        if (def != null && !badgeRepository.existsByUserIdAndBadgeCode(user.getId(), badgeCode)) {
            UserBadge badge = new UserBadge(user, def.code, def.name, def.description, def.icon);
            badgeRepository.save(badge);
        }
    }

    private LevelInfo calculateLevel(int points) {
        if (points < 100) {
            double prog = Math.round(((double) points / 100.0) * 100.0);
            return new LevelInfo(1, "Novice Explorer", 100, prog);
        } else if (points < 300) {
            double prog = Math.round(((double) (points - 100) / 200.0) * 100.0);
            return new LevelInfo(2, "Habit Builder", 300, prog);
        } else if (points < 700) {
            double prog = Math.round(((double) (points - 300) / 400.0) * 100.0);
            return new LevelInfo(3, "Consistency Master", 700, prog);
        } else if (points < 1500) {
            double prog = Math.round(((double) (points - 700) / 800.0) * 100.0);
            return new LevelInfo(4, "Routine Champion", 1500, prog);
        } else {
            return new LevelInfo(5, "Habit Legend", points + 1000, 100.0);
        }
    }

    private static class BadgeDefinition {
        String code;
        String name;
        String description;
        String icon;

        BadgeDefinition(String code, String name, String description, String icon) {
            this.code = code;
            this.name = name;
            this.description = description;
            this.icon = icon;
        }
    }

    private static class LevelInfo {
        int level;
        String title;
        int nextLevelPoints;
        double progressPercentage;

        LevelInfo(int level, String title, int nextLevelPoints, double progressPercentage) {
            this.level = level;
            this.title = title;
            this.nextLevelPoints = nextLevelPoints;
            this.progressPercentage = progressPercentage;
        }
    }
}
