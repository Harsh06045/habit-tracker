package com.habittracker.dto;

import java.time.LocalDateTime;

public class BadgeDto {

    private String code;
    private String name;
    private String description;
    private String icon;
    private boolean unlocked;
    private LocalDateTime unlockedAt;

    public BadgeDto() {
    }

    public BadgeDto(String code, String name, String description, String icon, boolean unlocked, LocalDateTime unlockedAt) {
        this.code = code;
        this.name = name;
        this.description = description;
        this.icon = icon;
        this.unlocked = unlocked;
        this.unlockedAt = unlockedAt;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public boolean isUnlocked() {
        return unlocked;
    }

    public void setUnlocked(boolean unlocked) {
        this.unlocked = unlocked;
    }

    public LocalDateTime getUnlockedAt() {
        return unlockedAt;
    }

    public void setUnlockedAt(LocalDateTime unlockedAt) {
        this.unlockedAt = unlockedAt;
    }
}
