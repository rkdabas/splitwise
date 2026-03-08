package com.splitwise.controller;

import com.splitwise.dto.LoginRequest;
import com.splitwise.dto.LoginResponse;
import com.splitwise.dto.UserDto;
import com.splitwise.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req) {
        LoginResponse res = authService.login(req.getEmail(), req.getPassword());
        return ResponseEntity.ok(res);
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> me(@RequestHeader(value = "Authorization", required = false) String auth) {
        UserDto user = authService.me(auth);
        return ResponseEntity.ok(user);
    }
}
