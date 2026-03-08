package com.splitwise.controller;

import com.splitwise.dto.CreateSettlementRequest;
import com.splitwise.dto.SettlementDto;
import com.splitwise.dto.UserDto;
import com.splitwise.exception.UnauthorizedException;
import com.splitwise.service.AuthService;
import com.splitwise.service.GroupService;
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
    private final GroupService groupService;

    @PostMapping
    public ResponseEntity<SettlementDto> create(@RequestBody CreateSettlementRequest req) {
        UserDto current = AuthService.getCurrentUser();
        if (current == null) throw new UnauthorizedException("Not authenticated");
        if (req.getGroupId() != null && !groupService.get(req.getGroupId()).getMemberIds().contains(current.getId())) {
            throw new UnauthorizedException("Not a member of this group");
        }
        return ResponseEntity.ok(settlementService.create(
                req.getFromUserId(),
                req.getToUserId(),
                req.getAmountCents(),
                req.getGroupId()
        ));
    }

    @GetMapping
    public ResponseEntity<List<SettlementDto>> list(@RequestParam String groupId) {
        UserDto current = AuthService.getCurrentUser();
        if (current == null) throw new UnauthorizedException("Not authenticated");
        if (!groupService.get(groupId).getMemberIds().contains(current.getId())) {
            throw new UnauthorizedException("Not a member of this group");
        }
        return ResponseEntity.ok(settlementService.listForGroup(groupId));
    }
}
