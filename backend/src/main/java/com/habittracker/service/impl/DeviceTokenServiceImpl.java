package com.habittracker.service.impl;

import com.habittracker.dto.DeviceTokenDto;
import com.habittracker.entity.DeviceToken;
import com.habittracker.entity.User;
import com.habittracker.exception.ResourceNotFoundException;
import com.habittracker.repository.DeviceTokenRepository;
import com.habittracker.repository.UserRepository;
import com.habittracker.service.DeviceTokenService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class DeviceTokenServiceImpl implements DeviceTokenService {

    private final DeviceTokenRepository deviceTokenRepository;
    private final UserRepository userRepository;

    public DeviceTokenServiceImpl(DeviceTokenRepository deviceTokenRepository, UserRepository userRepository) {
        this.deviceTokenRepository = deviceTokenRepository;
        this.userRepository = userRepository;
    }

    @Override
    public DeviceToken registerToken(Long userId, DeviceTokenDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Optional<DeviceToken> existingToken = deviceTokenRepository.findByToken(dto.getToken());
        if (existingToken.isPresent()) {
            DeviceToken tokenEntity = existingToken.get();
            tokenEntity.setUser(user);
            tokenEntity.setPlatform(dto.getPlatform() != null ? dto.getPlatform() : "WEB");
            tokenEntity.setCreatedAt(LocalDateTime.now());
            return deviceTokenRepository.save(tokenEntity);
        }

        DeviceToken newToken = new DeviceToken(
                user,
                dto.getToken(),
                dto.getPlatform() != null ? dto.getPlatform() : "WEB"
        );
        return deviceTokenRepository.save(newToken);
    }

    @Override
    public void removeToken(Long userId, String token) {
        deviceTokenRepository.findByToken(token).ifPresent(deviceToken -> {
            if (deviceToken.getUser() != null && deviceToken.getUser().getId().equals(userId)) {
                deviceTokenRepository.delete(deviceToken);
            }
        });
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeviceToken> getUserTokens(Long userId) {
        return deviceTokenRepository.findByUserId(userId);
    }
}
