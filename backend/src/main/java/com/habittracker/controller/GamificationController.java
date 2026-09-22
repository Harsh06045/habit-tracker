package com.habittracker.controller;

import com.habittracker.dto.ApiResponse;
import com.habittracker.dto.BadgeDto;
import com.habittracker.dto.GamificationProfileDto;
import com.habittracker.security.UserPrincipal;
import com.habittracker.service.GamificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/gamification")
public class GamificationController {

    private final GamificationService gamificationService;

    public GamificationController(GamificationService gamificationService) {
        this.gamificationService = gamificationService;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<GamificationProfileDto>> getProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        GamificationProfileDto profile = gamificationService.getProfile(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Gamification profile retrieved", profile));
    }

    @GetMapping("/badges")
    public ResponseEntity<ApiResponse<List<BadgeDto>>> getBadges(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<BadgeDto> badges = gamificationService.getAllBadgesForUser(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Badges retrieved", badges));
    }
}
