package com.splitwise.repository;

import com.splitwise.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, String> {

    List<Expense> findByGroupIdOrderByCreatedAtEpochMsDesc(String groupId);

    void deleteByGroupId(String groupId);
}
