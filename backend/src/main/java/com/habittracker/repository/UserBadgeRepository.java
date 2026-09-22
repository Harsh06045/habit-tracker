package com.habittracker.repository;

import com.habittracker.entity.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {
    List<UserBadge> findByUserIdOrderByUnlockedAtAsc(Long userId);
    Optional<UserBadge> findByUserIdAndBadgeCode(Long userId, String badgeCode);
    boolean existsByUserIdAndBadgeCode(Long userId, String badgeCode);
}
