package com._Blog.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com._Blog.backend.domain.model.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
}