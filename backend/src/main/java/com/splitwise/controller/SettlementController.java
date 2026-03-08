package com.splitwise.controller;

import com.splitwise.dto.CreateSettlementRequest;
import com.splitwise.dto.SettlementDto;
import com.splitwise.service.SettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/settlements")
@RequiredArgsConstructor
public class SettlementController {

    private final SettlementService settlementService;

    @PostMapping
    public ResponseEntity<SettlementDto> create(@RequestBody CreateSettlementRequest req) {
        return ResponseEntity.ok(settlementService.create(
                req.getFromUserId(),
                req.getToUserId(),
                req.getAmountCents(),
                req.getGroupId()
        ));
    }

    @GetMapping
    public ResponseEntity<List<SettlementDto>> list(@RequestParam String groupId) {
        return ResponseEntity.ok(settlementService.listForGroup(groupId));
    }
}
