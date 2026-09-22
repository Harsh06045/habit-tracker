package com.habittracker.repository;

import com.habittracker.entity.HabitSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HabitScheduleRepository extends JpaRepository<HabitSchedule, Long> {
    Optional<HabitSchedule> findByHabitId(Long habitId);
}
