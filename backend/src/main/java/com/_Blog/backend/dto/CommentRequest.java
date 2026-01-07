package com._Blog.backend.dto;

import lombok.Data;

@Data
public class CommentRequest {
    private Long postId;
    private String content;
}