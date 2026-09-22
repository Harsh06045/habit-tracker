package com.habittracker.dto;

public class LogoutRequestDto {

    private String refreshToken;

    public LogoutRequestDto() {
    }

    public LogoutRequestDto(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
}
