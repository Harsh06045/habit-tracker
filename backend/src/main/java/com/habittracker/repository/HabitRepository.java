package com.habittracker.repository;

import com.habittracker.entity.Habit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HabitRepository extends JpaRepository<Habit, Long> {
    List<Habit> findByActiveTrueOrderByCreatedAtDesc();
    List<Habit> findByUserIdAndActiveTrue(Long userId);
    List<Habit> findByUserIdAndActiveTrueOrderByCreatedAtDesc(Long userId);
    Optional<Habit> findByIdAndActiveTrue(Long id);
    Optional<Habit> findByIdAndUserIdAndActiveTrue(Long id, Long userId);
}
