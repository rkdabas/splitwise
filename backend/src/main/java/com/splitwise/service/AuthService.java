package com.splitwise.service;

import com.splitwise.config.JwtService;
import com.splitwise.dto.LoginResponse;
import com.splitwise.dto.UserDto;
import com.splitwise.entity.User;
import com.splitwise.exception.UnauthorizedException;
import com.splitwise.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginResponse login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));
        if (user.getPasswordHash() == null || user.getPasswordHash().isEmpty()) {
            throw new UnauthorizedException("Invalid email or password");
        }
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }
        UserDto dto = new UserDto(user.getId(), user.getName(), user.getEmail());
        String token = jwtService.generateToken(dto);
        return new LoginResponse(dto, token);
    }

    public LoginResponse signup(String name, String email, String password) {
        UserDto user = userService.create(name, email, password);
        String token = jwtService.generateToken(user);
        return new LoginResponse(user, token);
    }

    public UserDto me(String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            throw new UnauthorizedException("Missing or invalid token");
        }
        String t = token.substring(7).trim();
        if (t.isEmpty()) {
            throw new UnauthorizedException("Missing or invalid token");
        }
        UserDto dto = jwtService.parseToken(t);
        if (dto == null) {
            throw new UnauthorizedException("Invalid or expired token");
        }
        return dto;
    }

    public static UserDto getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserDto)) {
            return null;
        }
        return (UserDto) auth.getPrincipal();
    }
}
