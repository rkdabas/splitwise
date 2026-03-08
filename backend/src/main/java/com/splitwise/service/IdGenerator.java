package com.splitwise.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * In-memory ID generator to avoid SQLite schema issues with id_sequence table.
 * Produces ids like u_1, g_1, e_1, s_1. Counters reset on app restart.
 */
@Service
public class IdGenerator {

    private final Map<String, AtomicLong> sequences = new ConcurrentHashMap<>();

    public String nextId(String prefix) {
        long next = sequences.computeIfAbsent(prefix, k -> new AtomicLong(0)).incrementAndGet();
        return prefix + "_" + next;
    }
}
