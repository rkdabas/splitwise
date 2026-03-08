package com.splitwise.service;

import com.splitwise.dto.UserDto;
import com.splitwise.entity.User;
import com.splitwise.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final IdGenerator idGenerator;
    private final PasswordEncoder passwordEncoder;

    public List<UserDto> list() {
        return userRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public UserDto get(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        return toDto(user);
    }

    @Transactional
    public UserDto create(String name, String email, String password) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already registered");
        }
        String id = idGenerator.nextId("u");
        User user = new User();
        user.setId(id);
        user.setName(name);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        userRepository.save(user);
        return toDto(user);
    }

    @Transactional
    public UserDto createGuest(String name) {
        String id = idGenerator.nextId("u");
        User user = new User();
        user.setId(id);
        user.setName(name);
        user.setEmail("guest_" + id);
        user.setPasswordHash(null);
        userRepository.save(user);
        return toDto(user);
    }

    @Transactional
    public UserDto updateName(String id, String name) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        user.setName(name);
        userRepository.save(user);
        return toDto(user);
    }

    public UserDto toDto(User u) {
        return new UserDto(u.getId(), u.getName(), u.getEmail());
    }
}
