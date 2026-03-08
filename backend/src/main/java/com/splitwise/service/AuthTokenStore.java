package com.splitwise.service;

import com.splitwise.dto.UserDto;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory store for issued tokens. Maps token -> UserDto for /auth/me.
 */
public final class AuthTokenStore {

    private static final Map<String, UserDto> TOKENS = new ConcurrentHashMap<>();

    public static void put(String token, UserDto user) {
        TOKENS.put(token, user);
    }

    public static UserDto getUserDto(String token) {
        UserDto dto = TOKENS.get(token);
        if (dto == null) {
            throw new com.splitwise.exception.UnauthorizedException("Invalid or expired token");
        }
        return dto;
    }
}
