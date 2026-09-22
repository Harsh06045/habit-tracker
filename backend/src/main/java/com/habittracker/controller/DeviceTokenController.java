package com.habittracker.controller;

import com.habittracker.dto.ApiResponse;
import com.habittracker.dto.DeviceTokenDto;
import com.habittracker.dto.DeviceTokenResponseDto;
import com.habittracker.entity.DeviceToken;
import com.habittracker.security.UserPrincipal;
import com.habittracker.service.DeviceTokenService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/devices/token")
public class DeviceTokenController {

    private final DeviceTokenService deviceTokenService;

    public DeviceTokenController(DeviceTokenService deviceTokenService) {
        this.deviceTokenService = deviceTokenService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DeviceTokenResponseDto>> registerToken(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody DeviceTokenDto dto) {
        DeviceToken token = deviceTokenService.registerToken(userPrincipal.getId(), dto);
        DeviceTokenResponseDto response = new DeviceTokenResponseDto(
                token.getId(),
                token.getToken(),
                token.getPlatform(),
                token.getCreatedAt()
        );
        return new ResponseEntity<>(ApiResponse.ok("Device token registered successfully", response), HttpStatus.CREATED);
    }

    @DeleteMapping("/{token}")
    public ResponseEntity<ApiResponse<Void>> removeToken(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String token) {
        deviceTokenService.removeToken(userPrincipal.getId(), token);
        return ResponseEntity.ok(ApiResponse.ok("Device token removed successfully", null));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DeviceTokenResponseDto>>> getUserTokens(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<DeviceTokenResponseDto> tokens = deviceTokenService.getUserTokens(userPrincipal.getId()).stream()
                .map(t -> new DeviceTokenResponseDto(t.getId(), t.getToken(), t.getPlatform(), t.getCreatedAt()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok("Device tokens retrieved successfully", tokens));
    }
}

