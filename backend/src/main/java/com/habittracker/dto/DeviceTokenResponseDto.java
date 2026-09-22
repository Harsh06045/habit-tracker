package com.habittracker.dto;

import java.time.LocalDateTime;

public class DeviceTokenResponseDto {
    private Long id;
    private String token;
    private String platform;
    private LocalDateTime createdAt;

    public DeviceTokenResponseDto() {
    }

    public DeviceTokenResponseDto(Long id, String token, String platform, LocalDateTime createdAt) {
        this.id = id;
        this.token = token;
        this.platform = platform;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getPlatform() {
        return platform;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
