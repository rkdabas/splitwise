package com.splitwise.controller;

import com.splitwise.dto.CreateUserRequest;
import com.splitwise.dto.UserDto;
import com.splitwise.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserDto>> list() {
        return ResponseEntity.ok(userService.list());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> get(@PathVariable String id) {
        return ResponseEntity.ok(userService.get(id));
    }

    @PostMapping
    public ResponseEntity<UserDto> create(@RequestBody CreateUserRequest req) {
        return ResponseEntity.ok(userService.create(req.getName(), req.getEmail(), req.getPassword()));
    }

    @PostMapping("/guest")
    public ResponseEntity<UserDto> createGuest(@RequestBody CreateUserRequest req) {
        return ResponseEntity.ok(userService.createGuest(req.getName()));
    }

    @PatchMapping("/{id}/name")
    public ResponseEntity<UserDto> updateName(@PathVariable String id, @RequestBody CreateUserRequest req) {
        return ResponseEntity.ok(userService.updateName(id, req.getName()));
    }
}
