package com.splitwise.split;

import com.splitwise.entity.ExpenseSplitEmbeddable;
import com.splitwise.entity.SplitType;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class EqualSplitStrategy implements SplitStrategy {

    @Override
    public SplitType getType() {
        return SplitType.EQUAL;
    }

    @Override
    public List<ExpenseSplitEmbeddable> computeSplits(String payerId, List<String> participantIds,
                                                      long amountCents, Map<String, Long> exactAmountsCents,
                                                      Map<String, Integer> percentageShares) {
        if (participantIds == null || participantIds.isEmpty()) {
            return List.of();
        }
        long share = amountCents / participantIds.size();
        long remainder = amountCents % participantIds.size();
        List<ExpenseSplitEmbeddable> splits = new ArrayList<>();
        for (int i = 0; i < participantIds.size(); i++) {
            long amt = share + (i < remainder ? 1 : 0);
            String uid = participantIds.get(i);
            long net = uid.equals(payerId) ? amt - amountCents : amt;
            splits.add(new ExpenseSplitEmbeddable(uid, net));
        }
        return splits;
    }
}
