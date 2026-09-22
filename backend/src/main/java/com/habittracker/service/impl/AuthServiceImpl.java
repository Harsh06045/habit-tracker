package com.habittracker.service.impl;

import com.habittracker.dto.AuthResponseDto;
import com.habittracker.dto.LoginRequestDto;
import com.habittracker.dto.RefreshTokenRequestDto;
import com.habittracker.dto.RegisterRequestDto;
import com.habittracker.dto.UserDto;
import com.habittracker.entity.RefreshToken;
import com.habittracker.entity.User;
import com.habittracker.exception.BadRequestException;
import com.habittracker.repository.RefreshTokenRepository;
import com.habittracker.repository.UserRepository;
import com.habittracker.security.JwtService;
import com.habittracker.service.AuthService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthServiceImpl(UserRepository userRepository,
                           RefreshTokenRepository refreshTokenRepository,
                           PasswordEncoder passwordEncoder,
                           JwtService jwtService) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Override
    public AuthResponseDto register(RegisterRequestDto request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email is already registered: " + email);
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        String accessToken = jwtService.generateAccessToken(savedUser.getId(), savedUser.getEmail(), savedUser.getName());
        String refreshTokenStr = UUID.randomUUID().toString();

        RefreshToken refreshToken = new RefreshToken(
                refreshTokenStr,
                savedUser,
                Instant.now().plusMillis(jwtService.getRefreshTokenExpiration())
        );
        refreshTokenRepository.save(refreshToken);

        UserDto userDto = new UserDto(savedUser.getId(), savedUser.getName(), savedUser.getEmail(), savedUser.getCreatedAt());
        return new AuthResponseDto(accessToken, refreshTokenStr, jwtService.getAccessTokenExpiration(), userDto);
    }

    @Override
    public AuthResponseDto login(LoginRequestDto request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid email or password");
        }

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getName());
        String refreshTokenStr = UUID.randomUUID().toString();

        RefreshToken refreshToken = new RefreshToken(
                refreshTokenStr,
                user,
                Instant.now().plusMillis(jwtService.getRefreshTokenExpiration())
        );
        refreshTokenRepository.save(refreshToken);

        UserDto userDto = new UserDto(user.getId(), user.getName(), user.getEmail(), user.getCreatedAt());
        return new AuthResponseDto(accessToken, refreshTokenStr, jwtService.getAccessTokenExpiration(), userDto);
    }

    @Override
    public AuthResponseDto refreshToken(RefreshTokenRequestDto request) {
        String token = request.getRefreshToken();
        RefreshToken refreshTokenEntity = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));

        if (refreshTokenEntity.isRevoked() || refreshTokenEntity.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshTokenEntity);
            throw new BadRequestException("Refresh token has expired or been revoked");
        }

        User user = refreshTokenEntity.getUser();
        String newAccessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getName());

        // Token rotation: update with new refresh token
        String newRefreshTokenStr = UUID.randomUUID().toString();
        refreshTokenEntity.setToken(newRefreshTokenStr);
        refreshTokenEntity.setExpiryDate(Instant.now().plusMillis(jwtService.getRefreshTokenExpiration()));
        refreshTokenRepository.save(refreshTokenEntity);

        UserDto userDto = new UserDto(user.getId(), user.getName(), user.getEmail(), user.getCreatedAt());
        return new AuthResponseDto(newAccessToken, newRefreshTokenStr, jwtService.getAccessTokenExpiration(), userDto);
    }

    @Override
    public void logout(String refreshToken) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            refreshTokenRepository.findByToken(refreshToken).ifPresent(refreshTokenRepository::delete);
        }
        SecurityContextHolder.clearContext();
    }
}
