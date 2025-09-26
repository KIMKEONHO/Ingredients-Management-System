package com.example.ingredients_ms.domain.image.service;

public enum ImageFolderType {
    PROFILE("profile"),
    RECIPE_MAIN("recipe/main"),
    RECIPE_STEP("recipe/step"),
    INGREDIENT("ingredient"),
    GENERAL("general");
    
    private final String folderPath;
    
    ImageFolderType(String folderPath) {
        this.folderPath = folderPath;
    }
    
    public String getFolderPath() {
        return folderPath;
    }
}
