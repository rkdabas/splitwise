package com.splitwise.controller;

import com.splitwise.dto.BalanceDto;
import com.splitwise.service.BalanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/balances")
@RequiredArgsConstructor
public class BalanceController {

    private final BalanceService balanceService;

    @GetMapping
    public ResponseEntity<List<BalanceDto>> get(@RequestParam String userId, @RequestParam String groupId) {
        return ResponseEntity.ok(balanceService.get(userId, groupId));
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<BalanceDto>> getForGroup(@PathVariable String groupId) {
        return ResponseEntity.ok(balanceService.getForGroup(groupId));
    }
}
