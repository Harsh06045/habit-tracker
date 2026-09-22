package com.habittracker.service.impl;

import com.habittracker.config.CacheConfig;
import com.habittracker.dto.CompletionResponseDto;
import com.habittracker.dto.HabitRequestDto;
import com.habittracker.dto.HabitResponseDto;
import com.habittracker.entity.Habit;
import com.habittracker.entity.HabitCompletion;
import com.habittracker.entity.HabitSchedule;
import com.habittracker.entity.User;
import com.habittracker.exception.BadRequestException;
import com.habittracker.exception.ResourceNotFoundException;
import com.habittracker.repository.HabitCompletionRepository;
import com.habittracker.repository.HabitRepository;
import com.habittracker.repository.HabitScheduleRepository;
import com.habittracker.repository.UserRepository;
import com.habittracker.service.GamificationService;
import com.habittracker.service.HabitService;
import com.habittracker.service.StreakService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class HabitServiceImpl implements HabitService {

    private final HabitRepository habitRepository;
    private final HabitScheduleRepository scheduleRepository;
    private final HabitCompletionRepository completionRepository;
    private final UserRepository userRepository;
    private final StreakService streakService;
    private final GamificationService gamificationService;

    public HabitServiceImpl(HabitRepository habitRepository,
                            HabitScheduleRepository scheduleRepository,
                            HabitCompletionRepository completionRepository,
                            UserRepository userRepository,
                            StreakService streakService,
                            GamificationService gamificationService) {
        this.habitRepository = habitRepository;
        this.scheduleRepository = scheduleRepository;
        this.completionRepository = completionRepository;
        this.userRepository = userRepository;
        this.streakService = streakService;
        this.gamificationService = gamificationService;
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.CACHE_STATS_TODAY, key = "#userId"),
            @CacheEvict(value = CacheConfig.CACHE_STATS_WEEK, key = "#userId"),
            @CacheEvict(value = CacheConfig.CACHE_STATS_MONTH, key = "#userId"),
            @CacheEvict(value = CacheConfig.CACHE_USER_HABITS, key = "#userId")
    })
    public HabitResponseDto createHabit(Long userId, HabitRequestDto requestDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Habit habit = new Habit();
        habit.setUser(user);
        habit.setName(requestDto.getName());
        habit.setDescription(requestDto.getDescription());
        habit.setCategory(requestDto.getCategory() != null ? requestDto.getCategory() : "General");
        habit.setColor(requestDto.getColor() != null ? requestDto.getColor() : "#FF6B00");
        habit.setIcon(requestDto.getIcon() != null ? requestDto.getIcon() : "sparkles");
        habit.setTargetCount(requestDto.getTargetCount() != null ? requestDto.getTargetCount() : 15);
        habit.setTargetUnit(requestDto.getTargetUnit() != null ? requestDto.getTargetUnit() : "min");
        habit.setReminderTime(requestDto.getReminderTime());
        habit.setStartDate(requestDto.getStartDate() != null ? requestDto.getStartDate() : LocalDate.now());
        habit.setCurrentStreak(0);
        habit.setLongestStreak(0);
        habit.setActive(true);

        Habit savedHabit = habitRepository.save(habit);

        HabitSchedule schedule = new HabitSchedule();
        schedule.setHabit(savedHabit);
        schedule.setFrequencyType(requestDto.getFrequency() != null ? requestDto.getFrequency() : "DAILY");
        schedule.setDaysOfWeek(requestDto.getDaysOfWeek() != null ? requestDto.getDaysOfWeek() : "MON,TUE,WED,THU,FRI,SAT,SUN");
        scheduleRepository.save(schedule);

        savedHabit.setSchedule(schedule);
        return mapToDto(savedHabit);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = CacheConfig.CACHE_USER_HABITS, key = "#userId")
    public List<HabitResponseDto> getAllHabitsForUser(Long userId) {
        return habitRepository.findByUserIdAndActiveTrueOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public HabitResponseDto getHabitByIdAndUser(Long id, Long userId) {
        Habit habit = habitRepository.findByIdAndUserIdAndActiveTrue(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found with id: " + id));
        return mapToDto(habit);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.CACHE_STATS_TODAY, key = "#userId"),
            @CacheEvict(value = CacheConfig.CACHE_STATS_WEEK, key = "#userId"),
            @CacheEvict(value = CacheConfig.CACHE_STATS_MONTH, key = "#userId"),
            @CacheEvict(value = CacheConfig.CACHE_STATS_HABIT, key = "#id + '_' + #userId"),
            @CacheEvict(value = CacheConfig.CACHE_USER_HABITS, key = "#userId")
    })
    public HabitResponseDto updateHabit(Long id, Long userId, HabitRequestDto requestDto) {
        Habit habit = habitRepository.findByIdAndUserIdAndActiveTrue(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found with id: " + id));

        habit.setName(requestDto.getName());
        habit.setDescription(requestDto.getDescription());
        if (requestDto.getCategory() != null) habit.setCategory(requestDto.getCategory());
        if (requestDto.getColor() != null) habit.setColor(requestDto.getColor());
        if (requestDto.getIcon() != null) habit.setIcon(requestDto.getIcon());
        if (requestDto.getTargetCount() != null) habit.setTargetCount(requestDto.getTargetCount());
        if (requestDto.getTargetUnit() != null) habit.setTargetUnit(requestDto.getTargetUnit());
        habit.setReminderTime(requestDto.getReminderTime());
        if (requestDto.getStartDate() != null) habit.setStartDate(requestDto.getStartDate());

        if (habit.getSchedule() != null) {
            if (requestDto.getFrequency() != null) {
                habit.getSchedule().setFrequencyType(requestDto.getFrequency());
            }
            if (requestDto.getDaysOfWeek() != null) {
                habit.getSchedule().setDaysOfWeek(requestDto.getDaysOfWeek());
            }
            scheduleRepository.save(habit.getSchedule());
        }

        Habit updated = habitRepository.save(habit);
        return mapToDto(updated);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.CACHE_STATS_TODAY, key = "#userId"),
            @CacheEvict(value = CacheConfig.CACHE_STATS_WEEK, key = "#userId"),
            @CacheEvict(value = CacheConfig.CACHE_STATS_MONTH, key = "#userId"),
            @CacheEvict(value = CacheConfig.CACHE_STATS_HABIT, key = "#id + '_' + #userId"),
            @CacheEvict(value = CacheConfig.CACHE_USER_HABITS, key = "#userId"),
            @CacheEvict(value = CacheConfig.CACHE_GAMIFICATION, key = "#userId")
    })
    public void deleteHabit(Long id, Long userId) {
        Habit habit = habitRepository.findByIdAndUserIdAndActiveTrue(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found with id: " + id));
        habit.setActive(false);
        habitRepository.save(habit);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.CACHE_STATS_TODAY, key = "#userId"),
            @CacheEvict(value = CacheConfig.CACHE_STATS_WEEK, key = "#userId"),
            @CacheEvict(value = CacheConfig.CACHE_STATS_MONTH, key = "#userId"),
            @CacheEvict(value = CacheConfig.CACHE_STATS_HABIT, key = "#id + '_' + #userId"),
            @CacheEvict(value = CacheConfig.CACHE_USER_HABITS, key = "#userId"),
            @CacheEvict(value = CacheConfig.CACHE_GAMIFICATION, key = "#userId")
    })
    public CompletionResponseDto completeHabit(Long id, Long userId, LocalDate date) {
        Habit habit = habitRepository.findByIdAndUserIdAndActiveTrue(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found with id: " + id));

        LocalDate completionDate = (date != null) ? date : LocalDate.now();

        if (completionRepository.existsByHabitIdAndCompletionDate(id, completionDate)) {
            throw new BadRequestException("Habit already completed for date: " + completionDate);
        }

        HabitCompletion completion = new HabitCompletion(habit, completionDate);
        completionRepository.save(completion);

        streakService.updateHabitStreaks(id);
        Habit updatedHabit = habitRepository.findById(id).orElse(habit);

        // Phase 11 Gamification: award points, streak bonuses, and check badges
        gamificationService.onHabitCompleted(userId, id, updatedHabit.getCurrentStreak());

        return new CompletionResponseDto(
                updatedHabit.getId(),
                updatedHabit.getName(),
                completionDate,
                true,
                updatedHabit.getCurrentStreak(),
                completion.getCompletedAt()
        );
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.CACHE_STATS_TODAY, key = "#userId"),
            @CacheEvict(value = CacheConfig.CACHE_STATS_WEEK, key = "#userId"),
            @CacheEvict(value = CacheConfig.CACHE_STATS_MONTH, key = "#userId"),
            @CacheEvict(value = CacheConfig.CACHE_STATS_HABIT, key = "#id + '_' + #userId"),
            @CacheEvict(value = CacheConfig.CACHE_USER_HABITS, key = "#userId"),
            @CacheEvict(value = CacheConfig.CACHE_GAMIFICATION, key = "#userId")
    })
    public CompletionResponseDto uncompleteHabit(Long id, Long userId, LocalDate date) {
        Habit habit = habitRepository.findByIdAndUserIdAndActiveTrue(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found with id: " + id));

        LocalDate completionDate = (date != null) ? date : LocalDate.now();

        HabitCompletion completion = completionRepository.findByHabitIdAndCompletionDate(id, completionDate)
                .orElseThrow(() -> new BadRequestException("Habit was not completed for date: " + completionDate));

        completionRepository.delete(completion);

        streakService.updateHabitStreaks(id);
        Habit updatedHabit = habitRepository.findById(id).orElse(habit);

        // Phase 11 Gamification: deduct points and adjust level
        gamificationService.onHabitUncompleted(userId, id);

        return new CompletionResponseDto(
                updatedHabit.getId(),
                updatedHabit.getName(),
                completionDate,
                false,
                updatedHabit.getCurrentStreak(),
                LocalDateTime.now()
        );
    }

    // Backwards-compatible methods defaulting to primary user
    private Long getDefaultUserId() {
        return userRepository.findAll().stream()
                .findFirst()
                .map(User::getId)
                .orElse(1L);
    }

    @Override
    public HabitResponseDto createHabit(HabitRequestDto requestDto) {
        return createHabit(getDefaultUserId(), requestDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HabitResponseDto> getAllHabits() {
        return getAllHabitsForUser(getDefaultUserId());
    }

    @Override
    @Transactional(readOnly = true)
    public HabitResponseDto getHabitById(Long id) {
        Habit habit = habitRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found with id: " + id));
        return mapToDto(habit);
    }

    @Override
    public HabitResponseDto updateHabit(Long id, HabitRequestDto requestDto) {
        Habit habit = habitRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found with id: " + id));
        Long userId = habit.getUser() != null ? habit.getUser().getId() : getDefaultUserId();
        return updateHabit(id, userId, requestDto);
    }

    @Override
    public void deleteHabit(Long id) {
        Habit habit = habitRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found with id: " + id));
        habit.setActive(false);
        habitRepository.save(habit);
    }

    @Override
    public CompletionResponseDto completeHabit(Long id, LocalDate date) {
        Habit habit = habitRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found with id: " + id));
        Long userId = habit.getUser() != null ? habit.getUser().getId() : getDefaultUserId();
        return completeHabit(id, userId, date);
    }

    @Override
    public CompletionResponseDto uncompleteHabit(Long id, LocalDate date) {
        Habit habit = habitRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found with id: " + id));
        Long userId = habit.getUser() != null ? habit.getUser().getId() : getDefaultUserId();
        return uncompleteHabit(id, userId, date);
    }

    private HabitResponseDto mapToDto(Habit habit) {
        HabitResponseDto dto = new HabitResponseDto();
        dto.setId(habit.getId());
        dto.setName(habit.getName());
        dto.setDescription(habit.getDescription());
        dto.setCategory(habit.getCategory());
        dto.setColor(habit.getColor());
        dto.setIcon(habit.getIcon());
        dto.setTargetCount(habit.getTargetCount());
        dto.setTargetUnit(habit.getTargetUnit());
        dto.setStartDate(habit.getStartDate());
        dto.setReminderTime(habit.getReminderTime());
        dto.setStreak(habit.getCurrentStreak());
        dto.setLongestStreak(habit.getLongestStreak());
        dto.setCreatedAt(habit.getCreatedAt());
        dto.setUpdatedAt(habit.getUpdatedAt());

        if (habit.getSchedule() != null) {
            dto.setFrequency(habit.getSchedule().getFrequencyType());
            dto.setDaysOfWeek(habit.getSchedule().getDaysOfWeek());
        }

        boolean completedToday = completionRepository.existsByHabitIdAndCompletionDate(habit.getId(), LocalDate.now());
        dto.setCompletedToday(completedToday);

        long total = completionRepository.countByHabitId(habit.getId());
        dto.setTotalCompletions((int) total);

        return dto;
    }
}
