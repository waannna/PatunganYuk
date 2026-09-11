package com.patunganyuk.backend.service;

import java.util.List;

import com.patunganyuk.backend.entity.User;

public interface UserService {

    List<User> getAllUsers();
    List<User> getAllUsers(String search, String sortBy, String direction);

    User getUserById(Long id);

    User registerUser(User user);
    User registerUser(User user, String role);

    User updateUser(Long id, User user);
    void deleteUser(Long id);

    User login(String email, String rawPassword);
}