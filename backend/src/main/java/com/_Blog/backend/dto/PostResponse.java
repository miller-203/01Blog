package com._Blog.backend.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PostResponse {
    private Long id;
    private String title;
    private String content;
    private String imageUrl;
    private Long userId;
    private String username;
    private String authorFirstName;
    private String authorLastName;
    private String avatarUrl;
    private boolean owner;
    private LocalDateTime createdAt;
    private long likeCount;
    private long commentsCount;
    private long savesCount;
    private boolean likedByCurrentUser;
    private boolean savedByCurrentUser;
}
