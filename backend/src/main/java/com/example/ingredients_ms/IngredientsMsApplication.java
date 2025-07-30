package com.example.ingredients_ms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class IngredientsMsApplication {

    public static void main(String[] args) {
        SpringApplication.run(IngredientsMsApplication.class, args);
        System.out.println("hey man: test" );

    }

}
