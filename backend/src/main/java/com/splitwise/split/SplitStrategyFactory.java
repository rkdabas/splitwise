package com.splitwise.split;

import com.splitwise.entity.SplitType;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SplitStrategyFactory {

    private final List<SplitStrategy> strategies;

    public SplitStrategyFactory(List<SplitStrategy> strategies) {
        this.strategies = strategies;
    }

    public SplitStrategy get(SplitType type) {
        return strategies.stream()
                .filter(s -> s.getType() == type)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown split type: " + type));
    }
}
