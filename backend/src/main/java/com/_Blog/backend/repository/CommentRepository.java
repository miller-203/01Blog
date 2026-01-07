package com._Blog.backend.repository;

import com._Blog.backend.domain.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    // Find all comments for a specific Post ID
    List<Comment> findByPostId(Long postId);
}