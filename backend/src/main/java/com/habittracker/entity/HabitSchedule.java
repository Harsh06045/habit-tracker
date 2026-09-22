package com.habittracker.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "habit_schedules")
public class HabitSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "habit_id", nullable = false, unique = true)
    private Habit habit;

    @Column(name = "frequency_type", nullable = false)
    private String frequencyType = "DAILY"; // DAILY, WEEKDAYS, WEEKLY, CUSTOM

    @Column(name = "days_of_week")
    private String daysOfWeek = "MON,TUE,WED,THU,FRI,SAT,SUN";

    @Column(name = "target_per_period")
    private Integer targetPerPeriod = 1;

    public HabitSchedule() {
    }

    public HabitSchedule(String frequencyType, String daysOfWeek) {
        this.frequencyType = frequencyType;
        this.daysOfWeek = daysOfWeek;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Habit getHabit() {
        return habit;
    }

    public void setHabit(Habit habit) {
        this.habit = habit;
    }

    public String getFrequencyType() {
        return frequencyType;
    }

    public void setFrequencyType(String frequencyType) {
        this.frequencyType = frequencyType;
    }

    public String getDaysOfWeek() {
        return daysOfWeek;
    }

    public void setDaysOfWeek(String daysOfWeek) {
        this.daysOfWeek = daysOfWeek;
    }

    public Integer getTargetPerPeriod() {
        return targetPerPeriod;
    }

    public void setTargetPerPeriod(Integer targetPerPeriod) {
        this.targetPerPeriod = targetPerPeriod;
    }
}
