package com.splitwise.controller;

import com.splitwise.dto.CreateExpenseRequest;
import com.splitwise.dto.ExpenseDto;
import com.splitwise.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<ExpenseDto> create(@RequestBody CreateExpenseRequest req) {
        return ResponseEntity.ok(expenseService.create(req));
    }

    @GetMapping
    public ResponseEntity<List<ExpenseDto>> list(@RequestParam String groupId) {
        return ResponseEntity.ok(expenseService.listForGroup(groupId));
    }
}
