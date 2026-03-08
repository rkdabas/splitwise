package com.splitwise.service;

import com.splitwise.dto.BalanceDto;
import com.splitwise.entity.Expense;
import com.splitwise.entity.ExpenseSplitEmbeddable;
import com.splitwise.entity.Settlement;
import com.splitwise.repository.ExpenseRepository;
import com.splitwise.repository.SettlementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class BalanceService {

    private final ExpenseRepository expenseRepository;
    private final SettlementRepository settlementRepository;

    /**
     * Balances for a specific user in a group: list of (fromUserId, toUserId, amountCents) where amountCents > 0 means fromUserId owes toUserId.
     */
    public List<BalanceDto> get(String userId, String groupId) {
        List<Expense> expenses = expenseRepository.findByGroupIdOrderByCreatedAtEpochMsDesc(groupId);
        List<Settlement> settlements = settlementRepository.findByGroupIdOrderByCreatedAtEpochMsDesc(groupId);

        Map<String, Map<String, Long>> net = new ConcurrentHashMap<>();

        for (Expense e : expenses) {
            for (ExpenseSplitEmbeddable split : e.getSplits()) {
                long amt = split.getAmountCents();
                if (amt == 0) continue;
                String debtor = amt > 0 ? split.getUserId() : e.getPayerId();
                String creditor = amt > 0 ? e.getPayerId() : split.getUserId();
                long absAmt = Math.abs(amt);
                net.computeIfAbsent(debtor, k -> new ConcurrentHashMap<>()).merge(creditor, absAmt, Long::sum);
                net.computeIfAbsent(creditor, k -> new ConcurrentHashMap<>()).merge(debtor, -absAmt, Long::sum);
            }
        }

        for (Settlement s : settlements) {
            net.computeIfAbsent(s.getFromUserId(), k -> new ConcurrentHashMap<>()).merge(s.getToUserId(), -s.getAmountCents(), Long::sum);
            net.computeIfAbsent(s.getToUserId(), k -> new ConcurrentHashMap<>()).merge(s.getFromUserId(), s.getAmountCents(), Long::sum);
        }

        List<BalanceDto> result = new ArrayList<>();
        Map<String, Long> userNet = net.get(userId);
        if (userNet != null) {
            userNet.forEach((otherId, amountCents) -> {
                if (amountCents > 0) {
                    result.add(new BalanceDto(userId, otherId, groupId, amountCents));
                } else if (amountCents < 0) {
                    result.add(new BalanceDto(otherId, userId, groupId, -amountCents));
                }
            });
        }
        return result;
    }

    /**
     * All balances in a group (simplified: same structure as get but for the whole group).
     */
    public List<BalanceDto> getForGroup(String groupId) {
        List<Expense> expenses = expenseRepository.findByGroupIdOrderByCreatedAtEpochMsDesc(groupId);
        List<Settlement> settlements = settlementRepository.findByGroupIdOrderByCreatedAtEpochMsDesc(groupId);

        Map<String, Map<String, Long>> net = new ConcurrentHashMap<>();

        for (Expense e : expenses) {
            for (ExpenseSplitEmbeddable split : e.getSplits()) {
                long amt = split.getAmountCents();
                if (amt == 0) continue;
                String debtor = amt > 0 ? split.getUserId() : e.getPayerId();
                String creditor = amt > 0 ? e.getPayerId() : split.getUserId();
                long absAmt = Math.abs(amt);
                net.computeIfAbsent(debtor, k -> new ConcurrentHashMap<>()).merge(creditor, absAmt, Long::sum);
                net.computeIfAbsent(creditor, k -> new ConcurrentHashMap<>()).merge(debtor, -absAmt, Long::sum);
            }
        }

        for (Settlement s : settlements) {
            net.computeIfAbsent(s.getFromUserId(), k -> new ConcurrentHashMap<>()).merge(s.getToUserId(), -s.getAmountCents(), Long::sum);
            net.computeIfAbsent(s.getToUserId(), k -> new ConcurrentHashMap<>()).merge(s.getFromUserId(), s.getAmountCents(), Long::sum);
        }

        List<BalanceDto> result = new ArrayList<>();
        net.forEach((fromId, toMap) -> toMap.forEach((toId, amountCents) -> {
            if (amountCents > 0) {
                result.add(new BalanceDto(fromId, toId, groupId, amountCents));
            }
        }));
        return result;
    }
}
