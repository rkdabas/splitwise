package com.splitwise.service;

import com.splitwise.dto.LoginResponse;
import com.splitwise.dto.UserDto;
import com.splitwise.entity.User;
import com.splitwise.exception.UnauthorizedException;
import com.splitwise.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public LoginResponse login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));
        if (user.getPasswordHash() == null || user.getPasswordHash().isEmpty()) {
            throw new UnauthorizedException("Invalid email or password");
        }
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }
        String token = Base64.getEncoder().encodeToString(UUID.randomUUID().toString().getBytes());
        UserDto dto = new UserDto(user.getId(), user.getName(), user.getEmail());
        AuthTokenStore.put(token, dto);
        return new LoginResponse(dto, token);
    }

    public UserDto me(String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            throw new UnauthorizedException("Missing or invalid token");
        }
        String t = token.substring(7).trim();
        if (t.isEmpty()) {
            throw new UnauthorizedException("Missing or invalid token");
        }
        return AuthTokenStore.getUserDto(t);
    }
}
