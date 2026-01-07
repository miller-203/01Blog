package com._Blog.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PostResponse {
    private Long id;
    private String title;
    private String content;
    private String imageUrl;
    private String username;
    private LocalDateTime createdAt;
    private long likeCount;
    private boolean likedByCurrentUser;
}