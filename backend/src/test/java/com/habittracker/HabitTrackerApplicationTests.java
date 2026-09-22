package com.habittracker;

import com.habittracker.dto.*;
import com.habittracker.exception.BadRequestException;
import com.habittracker.exception.ResourceNotFoundException;
import com.habittracker.service.AuthService;
import com.habittracker.service.HabitService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev")
class HabitTrackerApplicationTests {

    @Autowired
    private HabitService habitService;

    @Autowired
    private AuthService authService;

    @Test
    void testAuthenticationFlow() {
        // 1. Register new user
        RegisterRequestDto registerDto = new RegisterRequestDto("Alice Smith", "alice@example.com", "Secret123");
        AuthResponseDto registerResponse = authService.register(registerDto);

        assertNotNull(registerResponse);
        assertNotNull(registerResponse.getAccessToken());
        assertNotNull(registerResponse.getRefreshToken());
        assertEquals("Bearer", registerResponse.getTokenType());
        assertEquals("alice@example.com", registerResponse.getUser().getEmail());

        // 2. Duplicate registration should throw BadRequestException
        assertThrows(BadRequestException.class, () -> authService.register(registerDto));

        // 3. Login with correct credentials
        LoginRequestDto loginDto = new LoginRequestDto("alice@example.com", "Secret123");
        AuthResponseDto loginResponse = authService.login(loginDto);
        assertNotNull(loginResponse);
        assertNotNull(loginResponse.getAccessToken());
        assertNotNull(loginResponse.getRefreshToken());

        // 4. Login with wrong password should fail
        LoginRequestDto badLogin = new LoginRequestDto("alice@example.com", "WrongPassword");
        assertThrows(BadRequestException.class, () -> authService.login(badLogin));

        // 5. Refresh token
        RefreshTokenRequestDto refreshDto = new RefreshTokenRequestDto(loginResponse.getRefreshToken());
        AuthResponseDto refreshedResponse = authService.refreshToken(refreshDto);
        assertNotNull(refreshedResponse);
        assertNotNull(refreshedResponse.getAccessToken());
        assertNotNull(refreshedResponse.getRefreshToken());

        // 6. Logout and verify invalidation
        authService.logout(refreshedResponse.getRefreshToken());
        assertThrows(BadRequestException.class, () -> authService.refreshToken(new RefreshTokenRequestDto(refreshedResponse.getRefreshToken())));
    }

    @Test
    void testMultiUserHabitIsolation() {
        // Register User 1
        AuthResponseDto user1 = authService.register(new RegisterRequestDto("User One", "user1@isolation.com", "Password123"));
        Long user1Id = user1.getUser().getId();

        // Register User 2
        AuthResponseDto user2 = authService.register(new RegisterRequestDto("User Two", "user2@isolation.com", "Password123"));
        Long user2Id = user2.getUser().getId();

        // User 1 creates Habit 1
        HabitRequestDto habitDto1 = new HabitRequestDto();
        habitDto1.setName("User 1 Morning Run");
        habitDto1.setCategory("Fitness");
        habitDto1.setFrequency("DAILY");
        HabitResponseDto habit1 = habitService.createHabit(user1Id, habitDto1);

        // User 2 creates Habit 2
        HabitRequestDto habitDto2 = new HabitRequestDto();
        habitDto2.setName("User 2 Evening Yoga");
        habitDto2.setCategory("Wellness");
        habitDto2.setFrequency("DAILY");
        HabitResponseDto habit2 = habitService.createHabit(user2Id, habitDto2);

        // Verify User 1 habit list has Habit 1 and NOT Habit 2
        List<HabitResponseDto> user1Habits = habitService.getAllHabitsForUser(user1Id);
        assertTrue(user1Habits.stream().anyMatch(h -> h.getId().equals(habit1.getId())));
        assertFalse(user1Habits.stream().anyMatch(h -> h.getId().equals(habit2.getId())));

        // Verify User 2 habit list has Habit 2 and NOT Habit 1
        List<HabitResponseDto> user2Habits = habitService.getAllHabitsForUser(user2Id);
        assertTrue(user2Habits.stream().anyMatch(h -> h.getId().equals(habit2.getId())));
        assertFalse(user2Habits.stream().anyMatch(h -> h.getId().equals(habit1.getId())));

        // Verify User 1 cannot access User 2's habit
        assertThrows(ResourceNotFoundException.class, () -> habitService.getHabitByIdAndUser(habit2.getId(), user1Id));
        assertThrows(ResourceNotFoundException.class, () -> habitService.completeHabit(habit2.getId(), user1Id, LocalDate.now()));
        assertThrows(ResourceNotFoundException.class, () -> habitService.deleteHabit(habit2.getId(), user1Id));

        // User 2 completes their own habit -> streak is 1
        CompletionResponseDto user2Completion = habitService.completeHabit(habit2.getId(), user2Id, LocalDate.now());
        assertEquals(1, user2Completion.getStreak());

        // User 1's habit streak remains 0
        HabitResponseDto user1Fetched = habitService.getHabitByIdAndUser(habit1.getId(), user1Id);
        assertEquals(0, user1Fetched.getStreak());
        assertFalse(user1Fetched.isCompletedToday());
    }

    @Test
    void testFullHabitLifecycle() {
        // 1. Verify pre-seeded habits from DataInitializer
        List<HabitResponseDto> initialHabits = habitService.getAllHabits();
        assertNotNull(initialHabits);
        assertTrue(initialHabits.size() >= 2, "Expected at least 2 pre-seeded habits");

        // 2. CREATE a new habit
        HabitRequestDto newHabit = new HabitRequestDto();
        newHabit.setName("Evening Meditation");
        newHabit.setDescription("10 minutes of calm breathing");
        newHabit.setCategory("Mindfulness");
        newHabit.setColor("#25B76B");
        newHabit.setIcon("leaf");
        newHabit.setTargetCount(10);
        newHabit.setTargetUnit("min");
        newHabit.setFrequency("DAILY");
        newHabit.setReminderTime(LocalTime.of(21, 0));
        newHabit.setStartDate(LocalDate.now());

        HabitResponseDto created = habitService.createHabit(newHabit);
        assertNotNull(created);
        assertNotNull(created.getId());
        assertEquals("Evening Meditation", created.getName());
        assertEquals(0, created.getStreak());

        Long habitId = created.getId();

        // 3. READ habit by ID
        HabitResponseDto fetched = habitService.getHabitById(habitId);
        assertNotNull(fetched);
        assertEquals("Evening Meditation", fetched.getName());
        assertEquals("Mindfulness", fetched.getCategory());

        // 4. COMPLETE habit
        CompletionResponseDto completion = habitService.completeHabit(habitId, LocalDate.now());
        assertNotNull(completion);
        assertTrue(completion.isCompleted());
        assertEquals(1, completion.getStreak());

        // Verify habit reflects completion and updated streak
        HabitResponseDto updatedStatus = habitService.getHabitById(habitId);
        assertEquals(1, updatedStatus.getStreak());
        assertTrue(updatedStatus.isCompletedToday());

        // 5. UNCOMPLETE habit
        CompletionResponseDto uncomplete = habitService.uncompleteHabit(habitId, LocalDate.now());
        assertNotNull(uncomplete);
        assertFalse(uncomplete.isCompleted());
        assertEquals(0, uncomplete.getStreak());

        // 6. UPDATE habit
        newHabit.setName("Deep Night Meditation");
        newHabit.setTargetCount(20);
        HabitResponseDto updated = habitService.updateHabit(habitId, newHabit);
        assertNotNull(updated);
        assertEquals("Deep Night Meditation", updated.getName());
        assertEquals(20, updated.getTargetCount());

        // 7. DELETE habit
        habitService.deleteHabit(habitId);
        List<HabitResponseDto> remaining = habitService.getAllHabits();
        assertFalse(remaining.stream().anyMatch(h -> h.getId().equals(habitId)));
    }

    @Autowired
    private com.habittracker.service.StreakService streakService;

    @Autowired
    private com.habittracker.service.StatisticsService statisticsService;

    @Autowired
    private com.habittracker.repository.HabitCompletionRepository completionRepository;

    @Test
    void testStreakEngineActiveAndBrokenStreaks() {
        // Register user
        AuthResponseDto user = authService.register(new RegisterRequestDto("Streak Tester", "streak@example.com", "Password123"));
        Long userId = user.getUser().getId();

        // 1. Test Active 5-day Streak: Sep 18, Sep 19, Sep 20, Sep 21, Sep 22
        HabitRequestDto hDto = new HabitRequestDto();
        hDto.setName("Daily Reading");
        HabitResponseDto habit = habitService.createHabit(userId, hDto);
        Long habitId = habit.getId();

        LocalDate today = LocalDate.now();
        habitService.completeHabit(habitId, userId, today.minusDays(4));
        habitService.completeHabit(habitId, userId, today.minusDays(3));
        habitService.completeHabit(habitId, userId, today.minusDays(2));
        habitService.completeHabit(habitId, userId, today.minusDays(1));
        habitService.completeHabit(habitId, userId, today);

        int currentStreak = streakService.calculateCurrentStreak(habitId);
        int bestStreak = streakService.calculateBestStreak(habitId);
        assertEquals(5, currentStreak, "5 consecutive days completed should yield current streak 5");
        assertEquals(5, bestStreak, "Best streak should be 5");

        // 2. Test Broken Streak: Complete D-3, D-2, Miss D-1, Complete D
        HabitRequestDto hDtoBroken = new HabitRequestDto();
        hDtoBroken.setName("Morning Jogging");
        HabitResponseDto habitBroken = habitService.createHabit(userId, hDtoBroken);
        Long brokenId = habitBroken.getId();

        habitService.completeHabit(brokenId, userId, today.minusDays(3));
        habitService.completeHabit(brokenId, userId, today.minusDays(2));
        // Day -1 was MISSED!
        habitService.completeHabit(brokenId, userId, today);

        int brokenCurrentStreak = streakService.calculateCurrentStreak(brokenId);
        int brokenBestStreak = streakService.calculateBestStreak(brokenId);
        assertEquals(1, brokenCurrentStreak, "Streak should reset to 1 after gap on yesterday");
        assertEquals(2, brokenBestStreak, "Best streak should be 2 from D-3 and D-2");
    }

    @Test
    void testStatisticsService() {
        AuthResponseDto user = authService.register(new RegisterRequestDto("Stats User", "stats@example.com", "Password123"));
        Long userId = user.getUser().getId();

        HabitRequestDto h1 = new HabitRequestDto();
        h1.setName("Walking");
        HabitResponseDto habit1 = habitService.createHabit(userId, h1);

        HabitRequestDto h2 = new HabitRequestDto();
        h2.setName("Running");
        HabitResponseDto habit2 = habitService.createHabit(userId, h2);

        // Complete habit1 today
        habitService.completeHabit(habit1.getId(), userId, LocalDate.now());

        // 1. Today Statistics
        TodayStatisticsDto todayStats = statisticsService.getTodayStatistics(userId);
        assertNotNull(todayStats);
        assertEquals(2, todayStats.getTotalHabits());
        assertEquals(1, todayStats.getCompletedHabits());
        assertEquals(50.0, todayStats.getCompletionPercentage());
        assertEquals(2, todayStats.getHabits().size());

        // 2. Week Statistics
        WeekStatisticsDto weekStats = statisticsService.getWeekStatistics(userId);
        assertNotNull(weekStats);
        assertEquals(14, weekStats.getTotalScheduled()); // 2 habits * 7 days
        assertTrue(weekStats.getTotalCompleted() >= 1);
        assertEquals(7, weekStats.getDailyBreakdown().size());

        // 3. Month Statistics
        MonthStatisticsDto monthStats = statisticsService.getMonthStatistics(userId);
        assertNotNull(monthStats);
        assertTrue(monthStats.getTotalCompleted() >= 1);
        assertNotNull(monthStats.getMonth());

        // 4. Individual Habit Statistics
        HabitStatisticsDto h1Stats = statisticsService.getHabitStatistics(habit1.getId(), userId);
        assertNotNull(h1Stats);
        assertEquals("Walking", h1Stats.getHabitName());
        assertEquals(1, h1Stats.getCurrentStreak());
        assertTrue(h1Stats.isCompletedToday());
    }

    @Autowired
    private com.habittracker.service.DeviceTokenService deviceTokenService;

    @Autowired
    private com.habittracker.service.NotificationService notificationService;

    @Autowired
    private com.habittracker.service.SyncService syncService;

    @Test
    void testDeviceTokensAndHabitReminders() {
        AuthResponseDto user = authService.register(new RegisterRequestDto("Reminder User", "reminder@example.com", "Password123"));
        Long userId = user.getUser().getId();

        // 1. Register device token
        DeviceTokenDto tokenDto = new DeviceTokenDto("web_token_abc_123", "WEB");
        var savedToken = deviceTokenService.registerToken(userId, tokenDto);
        assertNotNull(savedToken.getId());
        assertEquals("web_token_abc_123", savedToken.getToken());

        var tokens = deviceTokenService.getUserTokens(userId);
        assertEquals(1, tokens.size());

        // 2. Create habit with reminder at 7:00 AM
        HabitRequestDto habitDto = new HabitRequestDto();
        habitDto.setName("Workout");
        habitDto.setCategory("Fitness");
        habitDto.setReminderTime(LocalTime.of(7, 0));
        HabitResponseDto habit = habitService.createHabit(userId, habitDto);

        // 3. Trigger reminder notification
        NotificationResponseDto reminder = notificationService.sendHabitReminder(userId, habit.getId());
        assertNotNull(reminder);
        assertEquals("🔔 Time for your Workout!", reminder.getTitle());
        assertTrue(reminder.getMessage().contains("Workout"));
        assertTrue(reminder.isSent());
        assertEquals(LocalTime.of(7, 0), reminder.getScheduledTime());

        // 4. Retrieve user notifications
        List<NotificationResponseDto> notifications = notificationService.getUserNotifications(userId);
        assertTrue(notifications.stream().anyMatch(n -> n.getTitle().equals("🔔 Time for your Workout!")));

        // 5. Remove device token
        deviceTokenService.removeToken(userId, "web_token_abc_123");
        assertEquals(0, deviceTokenService.getUserTokens(userId).size());
    }

    @Test
    void testOfflineSyncBatchEngine() {
        AuthResponseDto user = authService.register(new RegisterRequestDto("Sync User", "sync@example.com", "Password123"));
        Long userId = user.getUser().getId();

        // Simulate offline queue replay
        SyncBatchRequestDto batch = new SyncBatchRequestDto();

        // 1. Offline create "Drink Water"
        HabitRequestDto h1 = new HabitRequestDto();
        h1.setName("Drink Water");
        h1.setCategory("Health");
        SyncOperationDto op1 = new SyncOperationDto("CREATE_HABIT", "temp-water-1", null, null, h1, System.currentTimeMillis());

        // 2. Offline complete "Drink Water" using temporary ID
        SyncOperationDto op2 = new SyncOperationDto("COMPLETE_HABIT", "temp-water-1", null, LocalDate.now(), null, System.currentTimeMillis() + 10);

        // 3. Offline create "Read 10 Pages"
        HabitRequestDto h2 = new HabitRequestDto();
        h2.setName("Read 10 Pages");
        SyncOperationDto op3 = new SyncOperationDto("CREATE_HABIT", "temp-read-2", null, null, h2, System.currentTimeMillis() + 20);

        // 4. Offline edit "Read 10 Pages" -> "Read 20 Pages"
        HabitRequestDto h2Edit = new HabitRequestDto();
        h2Edit.setName("Read 20 Pages");
        SyncOperationDto op4 = new SyncOperationDto("EDIT_HABIT", "temp-read-2", null, null, h2Edit, System.currentTimeMillis() + 30);

        // 5. Offline delete "Read 20 Pages"
        SyncOperationDto op5 = new SyncOperationDto("DELETE_HABIT", "temp-read-2", null, null, null, System.currentTimeMillis() + 40);

        batch.getOperations().addAll(List.of(op1, op2, op3, op4, op5));

        // Replay batch sync
        SyncBatchResponseDto syncResult = syncService.processBatchSync(userId, batch);
        assertTrue(syncResult.isSuccess());
        assertEquals(5, syncResult.getReplayedCount());
        assertTrue(syncResult.getIdMappings().containsKey("temp-water-1"));
        assertTrue(syncResult.getIdMappings().containsKey("temp-read-2"));

        // Verify "Drink Water" exists, resolved from temporary ID, and completed
        Long waterId = syncResult.getIdMappings().get("temp-water-1");
        HabitResponseDto waterHabit = habitService.getHabitByIdAndUser(waterId, userId);
        assertNotNull(waterHabit);
        assertEquals("Drink Water", waterHabit.getName());
        assertEquals(1, waterHabit.getStreak());
        assertTrue(waterHabit.isCompletedToday());

        // Verify "Read 20 Pages" was deleted
        List<HabitResponseDto> habits = habitService.getAllHabitsForUser(userId);
        assertFalse(habits.stream().anyMatch(h -> h.getName().contains("Read")));
    }

    @Autowired
    private com.habittracker.service.GamificationService gamificationService;

    @Autowired
    private org.springframework.cache.CacheManager cacheManager;

    @Test
    void testGamificationPointsAndBadges() {
        AuthResponseDto user = authService.register(new RegisterRequestDto("Gamer User", "gamer@example.com", "Password123"));
        Long userId = user.getUser().getId();

        // Initial profile: 0 points, Level 1
        GamificationProfileDto profile = gamificationService.getProfile(userId);
        assertEquals(0, profile.getTotalPoints());
        assertEquals(1, profile.getLevel());
        assertEquals("Novice Explorer", profile.getLevelTitle());

        // Create habit
        HabitRequestDto h = new HabitRequestDto();
        h.setName("Morning Stretching");
        HabitResponseDto habit = habitService.createHabit(userId, h);

        // Complete habit -> base points + first step badge + perfect day bonus
        habitService.completeHabit(habit.getId(), userId, LocalDate.now());

        GamificationProfileDto updated = gamificationService.getProfile(userId);
        assertTrue(updated.getTotalPoints() >= 20);
        assertTrue(updated.getBadgesCount() >= 1);

        var badges = gamificationService.getAllBadgesForUser(userId);
        assertTrue(badges.stream().anyMatch(b -> b.getCode().equals("FIRST_STEP") && b.isUnlocked()));

        // Uncomplete habit -> 10 points deducted
        habitService.uncompleteHabit(habit.getId(), userId, LocalDate.now());
        GamificationProfileDto uncompleted = gamificationService.getProfile(userId);
        assertEquals(updated.getTotalPoints() - 10, uncompleted.getTotalPoints());
    }

    @Test
    void testCacheEvictionOnHabitMutation() {
        AuthResponseDto user = authService.register(new RegisterRequestDto("Cache User", "cache@example.com", "Password123"));
        Long userId = user.getUser().getId();

        HabitRequestDto h = new HabitRequestDto();
        h.setName("Hydration");
        HabitResponseDto habit = habitService.createHabit(userId, h);

        // 1. First stats call fills cache
        TodayStatisticsDto stats1 = statisticsService.getTodayStatistics(userId);
        assertNotNull(stats1);

        // 2. Cache should contain stats_today for userId
        var cache = cacheManager.getCache(com.habittracker.config.CacheConfig.CACHE_STATS_TODAY);
        assertNotNull(cache);
        assertNotNull(cache.get(userId));

        // 3. Mutating habit should evict cache
        habitService.completeHabit(habit.getId(), userId, LocalDate.now());
        assertNull(cache.get(userId), "Cache should be invalidated after habit completion");
    }
}


