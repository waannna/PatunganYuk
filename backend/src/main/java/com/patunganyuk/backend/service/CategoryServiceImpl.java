package com.patunganyuk.backend.service;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.patunganyuk.backend.entity.Category;
import com.patunganyuk.backend.exception.ResourceNotFoundException;
import com.patunganyuk.backend.repository.CategoryRepository;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public List<Category> getAllCategories() {
        return this.categoryRepository.findAll();
    }

    @Override
    public List<Category> getAllCategories(String search) {
        if (search != null && !search.trim().isEmpty()) {
            return this.categoryRepository.findByNameContainingIgnoreCase(search.trim());
        }
        return this.categoryRepository.findAll();
    }

    @Override
    public List<Category> getAllCategories(String search, String sortBy, String direction) {
        String field = (sortBy != null && !sortBy.trim().isEmpty()) ? sortBy.trim() : "name";
        Sort.Direction dir = (direction != null && direction.trim().equalsIgnoreCase("desc"))
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;
        Sort sort = Sort.by(dir, field);

        if (search != null && !search.trim().isEmpty()) {
            return this.categoryRepository.findByNameContainingIgnoreCase(search.trim(), sort);
        }
        return this.categoryRepository.findAll(sort);
    }

    @Override
    public Category getCategoryById(Long id) {
        return this.categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kategori dengan id " + id + " tidak ditemukan"));
    }

    @Override
    public Category createCategory(Category category) {
        validate(category);
        if (this.categoryRepository.existsByNameIgnoreCase(category.getName().trim())) {
            throw new IllegalArgumentException("Kategori dengan nama tersebut sudah ada");
        }
        category.setName(category.getName().trim());
        if (category.getIsActive() == null) {
            category.setIsActive(true);
        }
        return this.categoryRepository.save(category);
    }

    @Override
    public Category updateCategory(Long id, Category category) {
        Category existing = this.getCategoryById(id);
        validate(category);

        String newName = category.getName().trim();
        if (!newName.equalsIgnoreCase(existing.getName()) && this.categoryRepository.existsByNameIgnoreCase(newName)) {
            throw new IllegalArgumentException("Kategori dengan nama tersebut sudah ada");
        }

        existing.setName(newName);
        existing.setDescription(category.getDescription());
        existing.setColorCode(category.getColorCode());
        if (category.getIsActive() != null) {
            existing.setIsActive(category.getIsActive());
        }
        return this.categoryRepository.save(existing);
    }

    @Override
    public void deleteCategory(Long id) {
        if (!this.categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Kategori dengan id " + id + " tidak ditemukan");
        }
        this.categoryRepository.deleteById(id);
    }

    private void validate(Category category) {
        if (category.getName() == null || category.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Nama kategori tidak boleh kosong");
        }
    }
}