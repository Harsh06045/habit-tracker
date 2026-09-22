package com.habittracker.dto;

import jakarta.validation.constraints.NotBlank;

public class DeviceTokenDto {

    @NotBlank(message = "Token is required")
    private String token;

    private String platform = "WEB";

    public DeviceTokenDto() {
    }

    public DeviceTokenDto(String token, String platform) {
        this.token = token;
        this.platform = platform;
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
}
