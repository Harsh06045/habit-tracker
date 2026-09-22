package com.habittracker.repository;

import com.habittracker.entity.HabitCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HabitCompletionRepository extends JpaRepository<HabitCompletion, Long> {
    Optional<HabitCompletion> findByHabitIdAndCompletionDate(Long habitId, LocalDate completionDate);
    boolean existsByHabitIdAndCompletionDate(Long habitId, LocalDate completionDate);
    void deleteByHabitIdAndCompletionDate(Long habitId, LocalDate completionDate);
    List<HabitCompletion> findByHabitIdOrderByCompletionDateDesc(Long habitId);
    List<HabitCompletion> findByHabitIdOrderByCompletionDateAsc(Long habitId);
    long countByHabitId(Long habitId);

    List<HabitCompletion> findByHabitIdAndCompletionDateBetweenOrderByCompletionDateAsc(Long habitId, LocalDate startDate, LocalDate endDate);
    long countByHabitIdAndCompletionDateBetween(Long habitId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT c FROM HabitCompletion c WHERE c.habit.user.id = :userId AND c.completionDate = :date")
    List<HabitCompletion> findByUserIdAndCompletionDate(@Param("userId") Long userId, @Param("date") LocalDate date);

    @Query("SELECT c FROM HabitCompletion c WHERE c.habit.user.id = :userId AND c.completionDate BETWEEN :startDate AND :endDate")
    List<HabitCompletion> findByUserIdAndCompletionDateBetween(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(c) FROM HabitCompletion c WHERE c.habit.user.id = :userId AND c.completionDate = :date")
    long countByUserIdAndCompletionDate(@Param("userId") Long userId, @Param("date") LocalDate date);

    @Query("SELECT COUNT(c) FROM HabitCompletion c WHERE c.habit.user.id = :userId AND c.completionDate BETWEEN :startDate AND :endDate")
    long countByUserIdAndCompletionDateBetween(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
