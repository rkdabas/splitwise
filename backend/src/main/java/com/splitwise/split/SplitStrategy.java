package com.splitwise.split;

import com.splitwise.entity.ExpenseSplitEmbeddable;
import com.splitwise.entity.SplitType;

import java.util.List;

public interface SplitStrategy {

    SplitType getType();

    List<ExpenseSplitEmbeddable> computeSplits(String payerId, List<String> participantIds, long amountCents,
                                                java.util.Map<String, Long> exactAmountsCents,
                                                java.util.Map<String, Integer> percentageShares);
}
