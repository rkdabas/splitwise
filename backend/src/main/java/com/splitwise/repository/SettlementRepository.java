package com.splitwise.repository;

import com.splitwise.entity.Settlement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SettlementRepository extends JpaRepository<Settlement, String> {

    List<Settlement> findByGroupIdOrderByCreatedAtEpochMsDesc(String groupId);

    void deleteByGroupId(String groupId);
}
