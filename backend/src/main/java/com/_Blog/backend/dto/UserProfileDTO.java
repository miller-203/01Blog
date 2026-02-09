package com._Blog.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserProfileDTO {
    private Long id;
    private String username;
    private String email;
    private LocalDateTime joinedAt;
    private int postCount;

    public UserProfileDTO(Long id, String username, String email, LocalDateTime joinedAt, int postCount) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.joinedAt = joinedAt;
        this.postCount = postCount;
    }
}