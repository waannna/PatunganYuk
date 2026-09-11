package com.patunganyuk.backend.service;

import java.util.List;

import com.patunganyuk.backend.entity.Category;

public interface CategoryService {

    List<Category> getAllCategories();
    List<Category> getAllCategories(String search);
    List<Category> getAllCategories(String search, String sortBy, String direction);

    Category getCategoryById(Long id);
    Category createCategory(Category category);
    Category updateCategory(Long id, Category category);
    void deleteCategory(Long id);
}