package com._Blog.backend.repository;

import com._Blog.backend.domain.model.Post;
import com._Blog.backend.domain.model.SavedPost;
import com._Blog.backend.domain.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SavedPostRepository extends JpaRepository<SavedPost, Long> {
    Optional<SavedPost> findByUserAndPost(User user, Post post);
    long countByPost(Post post);
    List<SavedPost> findByUserOrderByCreatedAtDesc(User user);
}
