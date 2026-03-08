package com.splitwise.controller;

import com.splitwise.dto.CreateExpenseRequest;
import com.splitwise.dto.ExpenseDto;
import com.splitwise.dto.UserDto;
import com.splitwise.exception.UnauthorizedException;
import com.splitwise.service.AuthService;
import com.splitwise.service.ExpenseService;
import com.splitwise.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;
    private final GroupService groupService;

    @PostMapping
    public ResponseEntity<ExpenseDto> create(@RequestBody CreateExpenseRequest req) {
        UserDto current = AuthService.getCurrentUser();
        if (current == null) throw new UnauthorizedException("Not authenticated");
        if (req.getGroupId() != null && !groupService.get(req.getGroupId()).getMemberIds().contains(current.getId())) {
            throw new UnauthorizedException("Not a member of this group");
        }
        return ResponseEntity.ok(expenseService.create(req));
    }

    @GetMapping
    public ResponseEntity<List<ExpenseDto>> list(@RequestParam String groupId) {
        UserDto current = AuthService.getCurrentUser();
        if (current == null) throw new UnauthorizedException("Not authenticated");
        if (!groupService.get(groupId).getMemberIds().contains(current.getId())) {
            throw new UnauthorizedException("Not a member of this group");
        }
        return ResponseEntity.ok(expenseService.listForGroup(groupId));
    }
}
