package com._Blog.backend.repository;

import com._Blog.backend.domain.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com._Blog.backend.domain.model.User;

import java.time.LocalDateTime;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    // Find all comments for a specific Post ID
    List<Comment> findByPostId(Long postId);

    void deleteByPostId(Long postId);

    void deleteByUserId(Long userId);

    @Query("SELECT MAX(c.createdAt) FROM Comment c WHERE c.user = :user")
    LocalDateTime getLastCommentTimeByUser(@Param("user") User user);
}
