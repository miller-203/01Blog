package com._Blog.backend.dto;

import lombok.Data;

@Data
public class JwtResponse {
    private String token;
    private Long id;
    private String username;
    private String email;
    private String role;
    private String status;

    public JwtResponse(String token, Long id, String username, String email, String role, String status) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.status = status;
    }
}