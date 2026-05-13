package com._Blog.backend.domain.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(min = 3, max = 20)
    @Column(unique = true, nullable = false)
    private String username;

    @NotBlank
    @Size(max = 50)
    private String firstName;

    @NotBlank
    @Size(max = 50)
    private String lastName;

    @NotBlank
    @Email
    @Size(max = 120)
    @Column(unique = true, nullable = false)
    private String email;

    @JsonIgnore
    @NotBlank
    @Size(min = 6, max = 100)
    @Column(nullable = false)
    private String password;

    @NotBlank
    private String role;

    @Size(max = 500)
    private String bio;

    @NotBlank
    private String status;

    private String profilePicUrl;

    private String coverUrl;

    private LocalDateTime createdAt = LocalDateTime.now();
}