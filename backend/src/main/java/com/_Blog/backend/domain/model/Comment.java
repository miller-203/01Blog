package com._Blog.backend.domain.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "comments")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDateTime createdAt = LocalDateTime.now();

    // Link to the User who wrote it
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // Link to the Post it belongs to
    @ManyToOne
    @JoinColumn(name = "post_id")
    private Post post;
}