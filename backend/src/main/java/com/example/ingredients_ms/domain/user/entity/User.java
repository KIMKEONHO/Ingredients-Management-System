package com.example.ingredients_ms.domain.user.entity;

import com.example.ingredients_ms.domain.cart.entity.Cart;
import com.example.ingredients_ms.domain.complaint.entity.Complaint;
import com.example.ingredients_ms.domain.diet.entity.Diet;
import com.example.ingredients_ms.domain.foodinventory.entity.FoodInventory;
import com.example.ingredients_ms.global.Status;
import com.example.ingredients_ms.global.entity.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.ArrayList;
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

    @Column(name = "phone_num", length = 255, nullable = false)
    private String phoneNum;

    @Column(name = "user_name", length = 255, nullable = false)
    private String userName;

    @Column(name = "nickname", length = 255)
    private String nickname;

    @Column(name = "password", length = 255, nullable = false)
    private String password;

    //oauth에서 제공된 user 식별 아이디
    @Column(name = "social_id", length = 255)
    private String socialId;

    //사용된 oauth 이름, kakao, naver.
    @Column(name = "sso_provider", length = 50)
    private String ssoProvider;

    @JsonIgnore
    @Column(name = "refresh_token", length = 512)
    private String refreshToken;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", length = 50, nullable = false)
    private Role role;

    @Column(length = 50)
    private String socialProvider;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Cart cart;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<FoodInventory> inventories = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Complaint> complaints = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Diet>  diets = new ArrayList<>();

    public Set<GrantedAuthority> getAuthorities() {
        return Set.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

}
