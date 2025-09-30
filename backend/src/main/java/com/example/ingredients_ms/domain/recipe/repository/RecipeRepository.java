package com.example.ingredients_ms.domain.recipe.repository;

import com.example.ingredients_ms.domain.recipe.entity.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RecipeRepository extends JpaRepository<Recipe,Long> {
    
    /**
     * 조회수를 1 증가시킵니다 (DB 레벨에서 처리)
     * @param recipeId 레시피 ID
     */
    @Modifying
    @Query("UPDATE Recipe r SET r.viewCount = r.viewCount + 1 WHERE r.id = :recipeId")
    void incrementViewCount(@Param("recipeId") Long recipeId);
}
