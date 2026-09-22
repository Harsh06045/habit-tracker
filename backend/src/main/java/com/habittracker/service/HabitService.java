package com.habittracker.service;

import com.habittracker.dto.CompletionResponseDto;
import com.habittracker.dto.HabitRequestDto;
import com.habittracker.dto.HabitResponseDto;

import java.time.LocalDate;
import java.util.List;

public interface HabitService {

    HabitResponseDto createHabit(Long userId, HabitRequestDto requestDto);

    List<HabitResponseDto> getAllHabitsForUser(Long userId);

    HabitResponseDto getHabitByIdAndUser(Long id, Long userId);

    HabitResponseDto updateHabit(Long id, Long userId, HabitRequestDto requestDto);

    void deleteHabit(Long id, Long userId);

    CompletionResponseDto completeHabit(Long id, Long userId, LocalDate date);

    CompletionResponseDto uncompleteHabit(Long id, Long userId, LocalDate date);

    // Overloads for backwards compatibility & non-scoped testing
    HabitResponseDto createHabit(HabitRequestDto requestDto);

    List<HabitResponseDto> getAllHabits();

    HabitResponseDto getHabitById(Long id);

    HabitResponseDto updateHabit(Long id, HabitRequestDto requestDto);

    void deleteHabit(Long id);

    CompletionResponseDto completeHabit(Long id, LocalDate date);

    CompletionResponseDto uncompleteHabit(Long id, LocalDate date);
}
