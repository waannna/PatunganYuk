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

import com.patunganyuk.backend.entity.User;
import com.patunganyuk.backend.service.UserService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserService userService;

    // PERBAIKAN: Inject service dari Spring
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/auth/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody User user) {
        User created = this.userService.registerUser(user);
        Map<String, Object> res = new HashMap<>();
        res.put("status", "success");
        res.put("message", "Registrasi berhasil");
        res.put("data", stripPassword(created));
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @PostMapping("/auth/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        User user = this.userService.login(email, password);
        Map<String, Object> res = new HashMap<>();
        res.put("status", "success");
        res.put("message", "Login berhasil");
        res.put("data", stripPassword(user));
        return ResponseEntity.ok(res);
    }

    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction) {
        List<User> users = this.userService.getAllUsers(search, sortBy, direction);
        users.forEach(this::stripPasswordInPlace);

        Map<String, Object> res = new HashMap<>();
        res.put("status", "success");
        res.put("data", users);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable Long id) {
        User user = this.userService.getUserById(id);
        Map<String, Object> res = new HashMap<>();
        res.put("status", "success");
        res.put("data", stripPassword(user));
        return ResponseEntity.ok(res);
    }

    @RequestMapping(value = "/users/{id}", method = RequestMethod.PUT)
    public ResponseEntity<Map<String, Object>> updateUser(@PathVariable Long id, @RequestBody User user) {
        User updated = this.userService.updateUser(id, user);
        Map<String, Object> res = new HashMap<>();
        res.put("status", "success");
        res.put("message", "Pengguna berhasil diperbarui");
        res.put("data", stripPassword(updated));
        return ResponseEntity.ok(res);
    }

    @RequestMapping(value = "/users/{id}", method = RequestMethod.DELETE)
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable Long id) {
        this.userService.deleteUser(id);
        Map<String, Object> res = new HashMap<>();
        res.put("status", "success");
        res.put("message", "Pengguna berhasil dihapus");
        return ResponseEntity.ok(res);
    }

    private User stripPassword(User user) {
        user.setPassword(null);
        return user;
    }

    private void stripPasswordInPlace(User user) {
        user.setPassword(null);
    }
}