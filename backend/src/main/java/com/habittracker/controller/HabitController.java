package com.habittracker.controller;

import com.habittracker.dto.ApiResponse;
import com.habittracker.dto.CompletionResponseDto;
import com.habittracker.dto.HabitRequestDto;
import com.habittracker.dto.HabitResponseDto;
import com.habittracker.security.UserPrincipal;
import com.habittracker.service.HabitService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/habits")
public class HabitController {

    private final HabitService habitService;

    public HabitController(HabitService habitService) {
        this.habitService = habitService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<HabitResponseDto>> createHabit(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody HabitRequestDto requestDto) {
        HabitResponseDto habit = (userPrincipal != null)
                ? habitService.createHabit(userPrincipal.getId(), requestDto)
                : habitService.createHabit(requestDto);
        return new ResponseEntity<>(ApiResponse.ok("Habit created successfully", habit), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<HabitResponseDto>>> getAllHabits(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<HabitResponseDto> habits = (userPrincipal != null)
                ? habitService.getAllHabitsForUser(userPrincipal.getId())
                : habitService.getAllHabits();
        return ResponseEntity.ok(ApiResponse.ok("Habits retrieved successfully", habits));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HabitResponseDto>> getHabitById(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        HabitResponseDto habit = (userPrincipal != null)
                ? habitService.getHabitByIdAndUser(id, userPrincipal.getId())
                : habitService.getHabitById(id);
        return ResponseEntity.ok(ApiResponse.ok("Habit retrieved successfully", habit));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<HabitResponseDto>> updateHabit(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody HabitRequestDto requestDto) {
        HabitResponseDto habit = (userPrincipal != null)
                ? habitService.updateHabit(id, userPrincipal.getId(), requestDto)
                : habitService.updateHabit(id, requestDto);
        return ResponseEntity.ok(ApiResponse.ok("Habit updated successfully", habit));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteHabit(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        if (userPrincipal != null) {
            habitService.deleteHabit(id, userPrincipal.getId());
        } else {
            habitService.deleteHabit(id);
        }
        return ResponseEntity.ok(ApiResponse.ok("Habit deleted successfully", null));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<CompletionResponseDto>> completeHabit(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        CompletionResponseDto completion = (userPrincipal != null)
                ? habitService.completeHabit(id, userPrincipal.getId(), date)
                : habitService.completeHabit(id, date);
        return ResponseEntity.ok(ApiResponse.ok("Habit marked as completed", completion));
    }

    @DeleteMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<CompletionResponseDto>> uncompleteHabit(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        CompletionResponseDto completion = (userPrincipal != null)
                ? habitService.uncompleteHabit(id, userPrincipal.getId(), date)
                : habitService.uncompleteHabit(id, date);
        return ResponseEntity.ok(ApiResponse.ok("Habit marked as incomplete", completion));
    }
}
