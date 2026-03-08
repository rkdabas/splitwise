package com.splitwise.controller;

import com.splitwise.dto.BalanceDto;
import com.splitwise.dto.UserDto;
import com.splitwise.exception.UnauthorizedException;
import com.splitwise.service.AuthService;
import com.splitwise.service.BalanceService;
import com.splitwise.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/balances")
@RequiredArgsConstructor
public class BalanceController {

    private final BalanceService balanceService;
    private final GroupService groupService;

    @GetMapping
    public ResponseEntity<List<BalanceDto>> get(@RequestParam String groupId) {
        UserDto current = AuthService.getCurrentUser();
        if (current == null) throw new UnauthorizedException("Not authenticated");
        if (!groupService.get(groupId).getMemberIds().contains(current.getId())) {
            throw new UnauthorizedException("Not a member of this group");
        }
        return ResponseEntity.ok(balanceService.get(current.getId(), groupId));
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<BalanceDto>> getForGroup(@PathVariable String groupId) {
        UserDto current = AuthService.getCurrentUser();
        if (current == null) throw new UnauthorizedException("Not authenticated");
        if (!groupService.get(groupId).getMemberIds().contains(current.getId())) {
            throw new UnauthorizedException("Not a member of this group");
        }
        return ResponseEntity.ok(balanceService.getForGroup(groupId));
    }
}
