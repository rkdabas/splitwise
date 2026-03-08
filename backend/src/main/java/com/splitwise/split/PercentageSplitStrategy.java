package com.splitwise.split;

import com.splitwise.entity.ExpenseSplitEmbeddable;
import com.splitwise.entity.SplitType;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class PercentageSplitStrategy implements SplitStrategy {

    @Override
    public SplitType getType() {
        return SplitType.PERCENTAGE;
    }

    @Override
    public List<ExpenseSplitEmbeddable> computeSplits(String payerId, List<String> participantIds,
                                                      long amountCents, Map<String, Long> exactAmountsCents,
                                                      Map<String, Integer> percentageShares) {
        if (participantIds == null || percentageShares == null) {
            return List.of();
        }
        List<ExpenseSplitEmbeddable> splits = new ArrayList<>();
        for (String uid : participantIds) {
            int pct = percentageShares.getOrDefault(uid, 0);
            long share = (amountCents * pct) / 100;
            long net = uid.equals(payerId) ? share - amountCents : share;
            splits.add(new ExpenseSplitEmbeddable(uid, net));
        }
        return splits;
    }
}
