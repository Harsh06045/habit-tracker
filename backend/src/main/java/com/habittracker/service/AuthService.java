package com.habittracker.service;

import com.habittracker.dto.AuthResponseDto;
import com.habittracker.dto.LoginRequestDto;
import com.habittracker.dto.RefreshTokenRequestDto;
import com.habittracker.dto.RegisterRequestDto;

public interface AuthService {
    AuthResponseDto register(RegisterRequestDto request);
    AuthResponseDto login(LoginRequestDto request);
    AuthResponseDto refreshToken(RefreshTokenRequestDto request);
    void logout(String refreshToken);
}
