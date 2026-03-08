package com.splitwise.service;

import com.splitwise.dto.GroupDto;
import com.splitwise.entity.Group;
import com.splitwise.repository.ExpenseRepository;
import com.splitwise.repository.GroupRepository;
import com.splitwise.repository.SettlementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final ExpenseRepository expenseRepository;
    private final SettlementRepository settlementRepository;
    private final BalanceService balanceService;
    private final IdGenerator idGenerator;

    public List<GroupDto> listForUser(String userId) {
        return groupRepository.findAll().stream()
                .filter(g -> g.getMemberIds() != null && g.getMemberIds().contains(userId))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public GroupDto get(String id) {
        Group g = groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found: " + id));
        return toDto(g);
    }

    @Transactional
    public GroupDto create(String name, String description, String createdByUserId) {
        String id = idGenerator.nextId("g");
        Group g = new Group();
        g.setId(id);
        g.setName(name);
        g.setDescription(description);
        g.setCreatedByUserId(createdByUserId);
        g.setCreatedAtEpochMs(System.currentTimeMillis());
        g.getMemberIds().add(createdByUserId);
        groupRepository.save(g);
        return toDto(g);
    }

    @Transactional
    public GroupDto addMember(String groupId, String userId) {
        Group g = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found: " + groupId));
        if (!g.getMemberIds().contains(userId)) {
            g.getMemberIds().add(userId);
            groupRepository.save(g);
        }
        return toDto(g);
    }

    @Transactional
    public void removeMember(String groupId, String userId) {
        Group g = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found: " + groupId));
        g.getMemberIds().remove(userId);
        groupRepository.save(g);
    }

    @Transactional
    public GroupDto update(String id, String name, String description) {
        Group g = groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found: " + id));
        if (name != null && !name.isBlank()) g.setName(name.trim());
        if (description != null) g.setDescription(description);
        groupRepository.save(g);
        return toDto(g);
    }

    @Transactional
    public void delete(String id) {
        Group g = groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found: " + id));
        expenseRepository.deleteByGroupId(id);
        settlementRepository.deleteByGroupId(id);
        groupRepository.delete(g);
    }

    @Transactional
    public GroupDto markAsDone(String id) {
        Group g = groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found: " + id));
        List<com.splitwise.dto.BalanceDto> balances = balanceService.getForGroup(id);
        if (!balances.isEmpty()) {
            throw new RuntimeException("Cannot mark as done: there is still debt to settle in this group.");
        }
        g.setSettledAtEpochMs(System.currentTimeMillis());
        groupRepository.save(g);
        return toDto(g);
    }

    private GroupDto toDto(Group g) {
        return new GroupDto(
                g.getId(),
                g.getName(),
                g.getDescription(),
                g.getCreatedByUserId(),
                g.getCreatedAtEpochMs(),
                g.getSettledAtEpochMs(),
                g.getMemberIds()
        );
    }
}
