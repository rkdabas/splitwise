package com.splitwise.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseSplitEmbeddable {

    @Column(name = "user_id")
    private String userId;

    @Column(name = "amount_cents")
    private long amountCents;
}
