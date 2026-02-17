package com._Blog.backend.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationResponse {
    private Long id;
    private String actorId;
    private String actorUsername;
    private String actorFirstName;
    private String actorLastName;
    private String actorAvatar;
    private String type;
    private String postId;
    private String message;
    private LocalDateTime createdAt;
    private boolean read;
}
