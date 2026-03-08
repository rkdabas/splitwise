package com.splitwise.service;

import com.splitwise.dto.SettlementDto;
import com.splitwise.entity.Settlement;
import com.splitwise.repository.SettlementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SettlementService {

    private final SettlementRepository settlementRepository;
    private final IdGenerator idGenerator;

    @Transactional
    public SettlementDto create(String fromUserId, String toUserId, long amountCents, String groupId) {
        if (amountCents <= 0) {
            throw new RuntimeException("Amount must be positive");
        }
        String id = idGenerator.nextId("s");
        Settlement s = new Settlement();
        s.setId(id);
        s.setFromUserId(fromUserId);
        s.setToUserId(toUserId);
        s.setGroupId(groupId);
        s.setAmountCents(amountCents);
        s.setCreatedAtEpochMs(System.currentTimeMillis());
        settlementRepository.save(s);
        return toDto(s);
    }

    public List<SettlementDto> listForGroup(String groupId) {
        return settlementRepository.findByGroupIdOrderByCreatedAtEpochMsDesc(groupId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private SettlementDto toDto(Settlement s) {
        return new SettlementDto(
                s.getId(),
                s.getFromUserId(),
                s.getToUserId(),
                s.getGroupId(),
                s.getAmountCents(),
                s.getCreatedAtEpochMs()
        );
    }
}
