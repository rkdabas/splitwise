package com.splitwise.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseDto {
    private String id;
    private String title;
    private String description;
    private Long amountCents;
    private String currency;
    private String payerId;
    private String groupId;
    private String splitType;
    private Long createdAtEpochMs;
    private List<SplitDto> splits;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SplitDto {
        private String userId;
        private Long amountCents;
    }
}
