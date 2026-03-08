package com.splitwise.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SettlementDto {
    private String id;
    private String fromUserId;
    private String toUserId;
    private String groupId;
    private Long amountCents;
    private Long createdAtEpochMs;
}
