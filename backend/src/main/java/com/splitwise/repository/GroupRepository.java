package com.splitwise.repository;

import com.splitwise.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GroupRepository extends JpaRepository<Group, String> {

    List<Group> findAll(); // use in service: filter by memberIds.contains(userId)
}
