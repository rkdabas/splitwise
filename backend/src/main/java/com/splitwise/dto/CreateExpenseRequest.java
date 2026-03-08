package com.splitwise.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateExpenseRequest {
    private String title;
    private String description;
    private Long amountCents;
    private String currency;
    private String payerId;
    private String groupId;
    private String splitType;
    private List<String> participantIds;
    private Map<String, Long> exactAmountsCents;
    private Map<String, Integer> percentageShares;
}
