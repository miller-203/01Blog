package com._Blog.backend.repository;

import com._Blog.backend.domain.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    // Custom query to find all posts by a specific user
    List<Post> findByUserId(Long userId);
    
    // Optional: Find all posts ordered by date (newest first)
    List<Post> findAllByOrderByCreatedAtDesc();
}