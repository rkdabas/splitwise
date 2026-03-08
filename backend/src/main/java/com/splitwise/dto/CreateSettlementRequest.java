package com.splitwise.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateSettlementRequest {
    private String fromUserId;
    private String toUserId;
    private Long amountCents;
    private String groupId;
}
