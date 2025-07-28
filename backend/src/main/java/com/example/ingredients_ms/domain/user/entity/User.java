package com.example.ingredients_ms.domain.user.entity;

import com.example.ingredients_ms.domain.cart.entity.Cart;
import com.example.ingredients_ms.domain.complaint.entity.Complaint;
import com.example.ingredients_ms.domain.foodinventory.entity.FoodInventory;
import com.example.ingredients_ms.global.Status;
import com.example.ingredients_ms.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Getter
@Setter
@Table(name="users")
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class User extends BaseEntity {

    @Column(name = "email", length = 255, nullable = false, unique = true)
    private String email;

    @Column(name = "phone_num", length = 255, nullable = false, unique = true)
    private String phoneNum;

    @Column(name = "user_name", length = 255, nullable = false)
    private String userName;

    @Column(name = "nickname", length = 255)
    private String nickname;

    @Column(name = "password", length = 255, nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Enumerated(EnumType.STRING)
    @ElementCollection(fetch = FetchType.LAZY)
    @Builder.Default
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role", nullable = false)
    private Set<Role> roles = new HashSet<>();

    @Column(length = 50)
    private String socialProvider;

    @Column(length = 255)
    private String socialId;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Cart cart;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<FoodInventory> inventories = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Complaint> complaints = new ArrayList<>();

}
