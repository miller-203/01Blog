package com._Blog.backend.dto;

import lombok.Data;

@Data
public class UserViewDTO {
    private Long id;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String status;
    private String bio;
    private String role;
    private String avatarUrl;
    private String coverUrl;
    private long followersCount;
    private long followingCount;
    private int postsCount;
    private boolean currentUser;
    private String createdAt;
}
