package com.splitwise.service;

import com.splitwise.dto.CreateExpenseRequest;
import com.splitwise.dto.ExpenseDto;
import com.splitwise.entity.Expense;
import com.splitwise.entity.ExpenseSplitEmbeddable;
import com.splitwise.entity.SplitType;
import com.splitwise.repository.ExpenseRepository;
import com.splitwise.split.SplitStrategy;
import com.splitwise.split.SplitStrategyFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final IdGenerator idGenerator;
    private final SplitStrategyFactory splitStrategyFactory;

    @Transactional
    public ExpenseDto create(CreateExpenseRequest req) {
        if (req.getAmountCents() == null || req.getAmountCents() <= 0) {
            throw new RuntimeException("Invalid amount");
        }
        if (req.getParticipantIds() == null || req.getParticipantIds().isEmpty()) {
            throw new RuntimeException("At least one participant required");
        }
        SplitType type = SplitType.valueOf(req.getSplitType());
        SplitStrategy strategy = splitStrategyFactory.get(type);
        List<ExpenseSplitEmbeddable> splits = strategy.computeSplits(
                req.getPayerId(),
                req.getParticipantIds(),
                req.getAmountCents(),
                req.getExactAmountsCents() != null ? req.getExactAmountsCents() : Map.of(),
                req.getPercentageShares() != null ? req.getPercentageShares() : Map.of()
        );

        String id = idGenerator.nextId("e");
        Expense e = new Expense();
        e.setId(id);
        e.setTitle(req.getTitle());
        e.setDescription(req.getDescription());
        e.setAmountCents(req.getAmountCents());
        e.setCurrency(req.getCurrency() != null ? req.getCurrency() : "INR");
        e.setPayerId(req.getPayerId());
        e.setGroupId(req.getGroupId());
        e.setSplitType(type);
        e.setCreatedAtEpochMs(System.currentTimeMillis());
        e.setSplits(splits);
        expenseRepository.save(e);
        return toDto(e);
    }

    public List<ExpenseDto> listForGroup(String groupId) {
        return expenseRepository.findByGroupIdOrderByCreatedAtEpochMsDesc(groupId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private ExpenseDto toDto(Expense e) {
        List<ExpenseDto.SplitDto> splitDtos = e.getSplits() != null ? e.getSplits().stream()
                .map(s -> new ExpenseDto.SplitDto(s.getUserId(), s.getAmountCents()))
                .collect(Collectors.toList()) : List.of();
        return new ExpenseDto(
                e.getId(),
                e.getTitle(),
                e.getDescription(),
                e.getAmountCents(),
                e.getCurrency(),
                e.getPayerId(),
                e.getGroupId(),
                e.getSplitType().name(),
                e.getCreatedAtEpochMs(),
                splitDtos
        );
    }
}
