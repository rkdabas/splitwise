package com.splitwise.controller;

import com.splitwise.dto.CreateGroupRequest;
import com.splitwise.dto.GroupDto;
import com.splitwise.dto.UpdateGroupRequest;
import com.splitwise.dto.UserDto;
import com.splitwise.exception.UnauthorizedException;
import com.splitwise.service.AuthService;
import com.splitwise.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @GetMapping
    public ResponseEntity<List<GroupDto>> list() {
        UserDto current = AuthService.getCurrentUser();
        if (current == null) throw new UnauthorizedException("Not authenticated");
        return ResponseEntity.ok(groupService.listForUser(current.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroupDto> get(@PathVariable String id) {
        UserDto current = AuthService.getCurrentUser();
        if (current == null) throw new UnauthorizedException("Not authenticated");
        GroupDto g = groupService.get(id);
        if (!g.getMemberIds().contains(current.getId())) {
            throw new UnauthorizedException("Not a member of this group");
        }
        return ResponseEntity.ok(g);
    }

    @PostMapping
    public ResponseEntity<GroupDto> create(@RequestBody CreateGroupRequest req) {
        UserDto current = AuthService.getCurrentUser();
        if (current == null) throw new UnauthorizedException("Not authenticated");
        return ResponseEntity.ok(groupService.create(req.getName(), req.getDescription(), current.getId()));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<GroupDto> update(@PathVariable String id, @RequestBody UpdateGroupRequest req) {
        UserDto current = AuthService.getCurrentUser();
        if (current == null) throw new UnauthorizedException("Not authenticated");
        GroupDto g = groupService.get(id);
        if (!g.getMemberIds().contains(current.getId())) {
            throw new UnauthorizedException("Not a member of this group");
        }
        return ResponseEntity.ok(groupService.update(id, req.getName(), req.getDescription()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        UserDto current = AuthService.getCurrentUser();
        if (current == null) throw new UnauthorizedException("Not authenticated");
        GroupDto g = groupService.get(id);
        if (!g.getMemberIds().contains(current.getId())) {
            throw new UnauthorizedException("Not a member of this group");
        }
        groupService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/mark-done")
    public ResponseEntity<GroupDto> markAsDone(@PathVariable String id) {
        UserDto current = AuthService.getCurrentUser();
        if (current == null) throw new UnauthorizedException("Not authenticated");
        GroupDto g = groupService.get(id);
        if (!g.getMemberIds().contains(current.getId())) {
            throw new UnauthorizedException("Not a member of this group");
        }
        return ResponseEntity.ok(groupService.markAsDone(id));
    }

    @PostMapping("/{groupId}/members")
    public ResponseEntity<GroupDto> addMember(@PathVariable String groupId, @RequestBody Map<String, String> body) {
        UserDto current = AuthService.getCurrentUser();
        if (current == null) throw new UnauthorizedException("Not authenticated");
        GroupDto g = groupService.get(groupId);
        if (!g.getMemberIds().contains(current.getId())) {
            throw new UnauthorizedException("Not a member of this group");
        }
        String userId = body.get("userId");
        if (userId == null) throw new RuntimeException("userId required");
        return ResponseEntity.ok(groupService.addMember(groupId, userId));
    }

    @DeleteMapping("/{groupId}/members/{userId}")
    public ResponseEntity<Void> removeMember(@PathVariable String groupId, @PathVariable String userId) {
        UserDto current = AuthService.getCurrentUser();
        if (current == null) throw new UnauthorizedException("Not authenticated");
        GroupDto g = groupService.get(groupId);
        if (!g.getMemberIds().contains(current.getId())) {
            throw new UnauthorizedException("Not a member of this group");
        }
        groupService.removeMember(groupId, userId);
        return ResponseEntity.noContent().build();
    }
}
