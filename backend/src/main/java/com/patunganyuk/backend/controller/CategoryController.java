package com.patunganyuk.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.patunganyuk.backend.entity.Category;
import com.patunganyuk.backend.service.CategoryService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class CategoryController {

    private final CategoryService categoryService;

    // PERBAIKAN: Inject service dari Spring
    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping("/categories")
    public ResponseEntity<Map<String, Object>> getAllCategories(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction) {
        List<Category> categories = this.categoryService.getAllCategories(search, sortBy, direction);
        Map<String, Object> res = new HashMap<>();
        res.put("status", "success");
        res.put("data", categories);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/categories/{id}")
    public ResponseEntity<Map<String, Object>> getCategoryById(@PathVariable Long id) {
        Category category = this.categoryService.getCategoryById(id);
        Map<String, Object> res = new HashMap<>();
        res.put("status", "success");
        res.put("data", category);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/categories")
    public ResponseEntity<Map<String, Object>> createCategory(@RequestBody Category category) {
        Category created = this.categoryService.createCategory(category);
        Map<String, Object> res = new HashMap<>();
        res.put("status", "success");
        res.put("message", "Kategori berhasil dibuat");
        res.put("data", created);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @RequestMapping(value = "/categories/{id}", method = RequestMethod.PUT)
    public ResponseEntity<Map<String, Object>> updateCategory(@PathVariable Long id, @RequestBody Category category) {
        Category updated = this.categoryService.updateCategory(id, category);
        Map<String, Object> res = new HashMap<>();
        res.put("status", "success");
        res.put("message", "Kategori berhasil diperbarui");
        res.put("data", updated);
        return ResponseEntity.ok(res);
    }

    @RequestMapping(value = "/categories/{id}", method = RequestMethod.DELETE)
    public ResponseEntity<Map<String, Object>> deleteCategory(@PathVariable Long id) {
        this.categoryService.deleteCategory(id);
        Map<String, Object> res = new HashMap<>();
        res.put("status", "success");
        res.put("message", "Kategori berhasil dihapus");
        return ResponseEntity.ok(res);
    }
}