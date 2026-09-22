package com.habittracker.config;

import com.habittracker.entity.Habit;
import com.habittracker.entity.HabitCompletion;
import com.habittracker.entity.HabitSchedule;
import com.habittracker.entity.User;
import com.habittracker.repository.HabitCompletionRepository;
import com.habittracker.repository.HabitRepository;
import com.habittracker.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final HabitRepository habitRepository;
    private final HabitCompletionRepository completionRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           HabitRepository habitRepository,
                           HabitCompletionRepository completionRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.habitRepository = habitRepository;
        this.completionRepository = completionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0 || habitRepository.count() > 0) {
            return;
        }

        // 1. Create Default User (Credentials: saboor@habittracker.com / password123)
        User user = new User("Saboor", "saboor@habittracker.com");
        user.setPasswordHash(passwordEncoder.encode("password123"));
        user = userRepository.save(user);

        // 2. Habit 1: Read Book (streak: 7, completed: true)
        Habit habit1 = new Habit();
        habit1.setUser(user);
        habit1.setName("Read Book");
        habit1.setDescription("Read 20 focused pages every day.");
        habit1.setCategory("Learning");
        habit1.setColor("#FF6B00");
        habit1.setIcon("book");
        habit1.setTargetCount(20);
        habit1.setTargetUnit("min");
        habit1.setCurrentStreak(7);
        habit1.setLongestStreak(7);
        habit1.setReminderTime(LocalTime.of(20, 0));
        habit1.setStartDate(LocalDate.now().minusDays(7));
        habit1.setSchedule(new HabitSchedule("DAILY", "MON,TUE,WED,THU,FRI,SAT,SUN"));
        habit1 = habitRepository.save(habit1);

        // Mark completed for today
        completionRepository.save(new HabitCompletion(habit1, LocalDate.now()));

        // 3. Habit 2: Workout (streak: 4, completed: false)
        Habit habit2 = new Habit();
        habit2.setUser(user);
        habit2.setName("Workout");
        habit2.setDescription("Strength or mobility training.");
        habit2.setCategory("Fitness");
        habit2.setColor("#DF68C6");
        habit2.setIcon("barbell");
        habit2.setTargetCount(30);
        habit2.setTargetUnit("min");
        habit2.setCurrentStreak(4);
        habit2.setLongestStreak(6);
        habit2.setReminderTime(LocalTime.of(6, 30));
        habit2.setStartDate(LocalDate.now().minusDays(4));
        habit2.setSchedule(new HabitSchedule("DAILY", "MON,TUE,WED,THU,FRI,SAT,SUN"));
        habitRepository.save(habit2);

        // 4. Habit 3: Drink a glass of milk
        Habit habit3 = new Habit();
        habit3.setUser(user);
        habit3.setName("Drink a glass of milk");
        habit3.setDescription("Healthy morning nutrition.");
        habit3.setCategory("Health");
        habit3.setColor("#C9773B");
        habit3.setIcon("water");
        habit3.setTargetCount(5);
        habit3.setTargetUnit("min");
        habit3.setCurrentStreak(3);
        habit3.setLongestStreak(5);
        habit3.setReminderTime(LocalTime.of(7, 30));
        habit3.setStartDate(LocalDate.now().minusDays(3));
        habit3.setSchedule(new HabitSchedule("DAILY", "MON,TUE,WED,THU,FRI,SAT,SUN"));
        habit3 = habitRepository.save(habit3);
        completionRepository.save(new HabitCompletion(habit3, LocalDate.now()));

        // 5. Habit 4: Meditate to relax
        Habit habit4 = new Habit();
        habit4.setUser(user);
        habit4.setName("Meditate to relax");
        habit4.setDescription("Calm mindful breathing.");
        habit4.setCategory("Mindfulness");
        habit4.setColor("#25B76B");
        habit4.setIcon("leaf");
        habit4.setTargetCount(15);
        habit4.setTargetUnit("min");
        habit4.setCurrentStreak(6);
        habit4.setLongestStreak(10);
        habit4.setReminderTime(LocalTime.of(7, 0));
        habit4.setStartDate(LocalDate.now().minusDays(6));
        habit4.setSchedule(new HabitSchedule("DAILY", "MON,TUE,WED,THU,FRI,SAT,SUN"));
        habit4 = habitRepository.save(habit4);
        completionRepository.save(new HabitCompletion(habit4, LocalDate.now()));
    }
}
