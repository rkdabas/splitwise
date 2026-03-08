package com.splitwise.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupDto {
    private String id;
    private String name;
    private String description;
    private String createdByUserId;
    private Long createdAtEpochMs;
    private Long settledAtEpochMs;
    private List<String> memberIds;
}
