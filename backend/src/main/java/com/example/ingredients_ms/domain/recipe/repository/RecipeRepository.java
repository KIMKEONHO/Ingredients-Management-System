package com.example.ingredients_ms.domain.recipe.repository;

import com.example.ingredients_ms.domain.recipe.entity.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RecipeRepository extends JpaRepository<Recipe,Long> {
    
    // 사용자가 보유한 식재료로만 만들 수 있는 레시피 조회
    @Query(value = """
            SELECT
                r.*
            FROM
                Recipe r
            JOIN
                recipe_ingredient ri ON r.id = ri.recipe_id
            WHERE
                ri.ingredient_id IN (:ingredientIds)
            GROUP BY
                r.id
            HAVING
                COUNT(DISTINCT ri.ingredient_id) / (
                    SELECT COUNT(ri2.ingredient_id)
                    FROM recipe_ingredient ri2
                    WHERE ri2.recipe_id = r.id
                ) >= 0.7
            ORDER BY
                r.like_count DESC, r.view_count DESC
        """, nativeQuery = true)
    List<Recipe> findRecipesByAvailableIngredients(@Param("ingredientIds") List<Long> ingredientIds);

}
