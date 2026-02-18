package com._Blog.backend.domain.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "reports")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reporter_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User reporter;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reported_user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User reportedUser;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reported_post_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Post reportedPost;

    @Column(nullable = false)
    private String type = "USER";

    @Column(nullable = false, length = 500)
    private String reason;

    @Column(nullable = false)
    private String status = "PENDING";

    private LocalDateTime createdAt = LocalDateTime.now();
}
