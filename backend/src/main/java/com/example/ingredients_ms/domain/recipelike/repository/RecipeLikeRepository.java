package com.example.ingredients_ms.domain.recipelike.repository;

import com.example.ingredients_ms.domain.recipe.entity.Recipe;
import com.example.ingredients_ms.domain.recipelike.entity.RecipeLike;
import com.example.ingredients_ms.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RecipeLikeRepository extends JpaRepository<RecipeLike, Long> {



    /**
     * 특정 사용자와 레시피에 대한 '좋아요' 정보를 조회합니다.
     * isActive 상태와 관계없이 조회하여, 이전에 좋아요를 눌렀다가 취소한 이력이 있는지 확인하는 데 사용됩니다.
     *
     * @param user   사용자 엔티티
     * @param recipe 레시피 엔티티
     * @return Optional<RecipeLike>
     */
    Optional<RecipeLike> findByUserAndRecipe(User user, Recipe recipe);


    /**
     * 특정 레시피의 활성화된('isActive' = true) '좋아요' 개수를 조회합니다.
     * 화면에 표시될 좋아요 총 수를 계산하는 데 사용됩니다. [1]
     *
     * @param recipe 레시피 엔티티
     * @return long 좋아요 개수
     */
    long countByRecipeAndIsActiveTrue(Recipe recipe);


    /**
     * 특정 사용자가 특정 레시피를 현재 '좋아요' 하고 있는지(활성화 상태인지) 확인합니다.
     * 사용자가 이미 좋아요를 눌렀는지 빠르게 확인할 때 유용합니다. [1]
     *
     * @param user   사용자 엔티티
     * @param recipe 레시피 엔티티
     * @return boolean '좋아요' 활성화 여부
     */
    boolean existsByUserAndRecipeAndIsActiveTrue(User user, Recipe recipe);

    boolean existsByUser_IdAndRecipe_IdAndIsActiveTrue(Long userId, Long recipeId);

    Optional<RecipeLike> findByUserAndRecipeAndIsActiveTrue(User user, Recipe recipe);
}
