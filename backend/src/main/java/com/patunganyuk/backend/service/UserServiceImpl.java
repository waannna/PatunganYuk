package com.patunganyuk.backend.service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.patunganyuk.backend.entity.GroupMember;
import com.patunganyuk.backend.entity.User;
import com.patunganyuk.backend.exception.ResourceNotFoundException;
import com.patunganyuk.backend.repository.GroupMemberRepository;
import com.patunganyuk.backend.repository.UserRepository;

@Service
public class UserServiceImpl implements UserService {

    private static final String DEFAULT_ROLE = "USER";

    private final UserRepository userRepository;
    private final GroupMemberRepository groupMemberRepository;

    public UserServiceImpl(UserRepository userRepository, GroupMemberRepository groupMemberRepository) {
        this.userRepository = userRepository;
        this.groupMemberRepository = groupMemberRepository;
    }

    @Override
    public List<User> getAllUsers() {
        return this.userRepository.findAll();
    }

    @Override
    public List<User> getAllUsers(String search, String sortBy, String direction) {
        String field = (sortBy != null && !sortBy.trim().isEmpty()) ? sortBy.trim() : "name";
        Sort.Direction dir = (direction != null && direction.trim().equalsIgnoreCase("desc"))
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;
        Sort sort = Sort.by(dir, field);

        if (search != null && !search.trim().isEmpty()) {
            return this.userRepository.findByNameContainingIgnoreCase(search.trim(), sort);
        }
        return this.userRepository.findAll(sort);
    }

    @Override
    public User getUserById(Long id) {
        return this.userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pengguna dengan id " + id + " tidak ditemukan"));
    }

    @Override
    public User registerUser(User user) {
        return registerUser(user, DEFAULT_ROLE);
    }

    @Override
    public User registerUser(User user, String role) {
        validateForRegistration(user);

        if (this.userRepository.existsByEmail(user.getEmail().trim().toLowerCase())) {
            throw new IllegalArgumentException("Email sudah terdaftar");
        }

        String finalRole = normalizeRole(role);

        user.setEmail(user.getEmail().trim().toLowerCase());
        user.setPassword(hashPassword(user.getPassword()));
        user.setRole(finalRole);

        User savedUser = this.userRepository.save(user);

        List<GroupMember> orphanMembers = this.groupMemberRepository.findAll().stream()
                .filter(m -> m.getEmail() != null && m.getEmail().trim().equalsIgnoreCase(savedUser.getEmail()))
                .toList();

        for (GroupMember gm : orphanMembers) {
            gm.setUserId(savedUser.getId());
            this.groupMemberRepository.save(gm);
        }

        return savedUser;
    }

    @Override
    public User updateUser(Long id, User user) {
        User existing = this.getUserById(id);

        if (user.getName() == null || user.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Nama tidak boleh kosong");
        }
        existing.setName(user.getName());
        existing.setPhoneNumber(user.getPhoneNumber());

        if (user.getEmail() != null && !user.getEmail().trim().isEmpty()) {
            String newEmail = user.getEmail().trim().toLowerCase();
            if (!newEmail.equals(existing.getEmail()) && this.userRepository.existsByEmail(newEmail)) {
                throw new IllegalArgumentException("Email sudah dipakai pengguna lain");
            }
            existing.setEmail(newEmail);
        }

        if (user.getRole() != null && !user.getRole().trim().isEmpty()) {
            existing.setRole(normalizeRole(user.getRole()));
        }

        if (user.getPassword() != null && !user.getPassword().trim().isEmpty()) {
            existing.setPassword(hashPassword(user.getPassword()));
        }

        return this.userRepository.save(existing);
    }

    @Override
    public void deleteUser(Long id) {
        if (!this.userRepository.existsById(id)) {
            throw new ResourceNotFoundException("Pengguna dengan id " + id + " tidak ditemukan");
        }
        this.userRepository.deleteById(id);
    }

    @Override
    public User login(String email, String rawPassword) {
        if (email == null || email.trim().isEmpty() || rawPassword == null || rawPassword.isEmpty()) {
            throw new IllegalArgumentException("Email dan password wajib diisi");
        }

        User user = this.userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Email atau password salah"));

        String hashed = hashPassword(rawPassword);
        if (!hashed.equals(user.getPassword())) {
            throw new IllegalArgumentException("Email atau password salah");
        }

        return user;
    }

    private void validateForRegistration(User user) {
        if (user.getName() == null || user.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Nama tidak boleh kosong");
        }
        if (user.getEmail() == null || !user.getEmail().contains("@")) {
            throw new IllegalArgumentException("Email tidak valid");
        }
        if (user.getPassword() == null || user.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password minimal 6 karakter");
        }
    }

    private String normalizeRole(String role) {
        if (role == null || role.trim().isEmpty()) {
            return DEFAULT_ROLE;
        }
        String upper = role.trim().toUpperCase();
        if (!upper.equals("ADMIN") && !upper.equals("USER")) {
            throw new IllegalArgumentException("Role tidak valid, gunakan ADMIN atau USER");
        }
        return upper;
    }

    private String hashPassword(String rawPassword) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(rawPassword.getBytes("UTF-8"));

            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException | java.io.UnsupportedEncodingException e) {
            throw new RuntimeException("Gagal melakukan hashing password", e);
        }
    }
}