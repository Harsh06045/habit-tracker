package com.habittracker.service;

import com.habittracker.dto.DeviceTokenDto;
import com.habittracker.entity.DeviceToken;

import java.util.List;

public interface DeviceTokenService {
    DeviceToken registerToken(Long userId, DeviceTokenDto dto);
    void removeToken(Long userId, String token);
    List<DeviceToken> getUserTokens(Long userId);
}
