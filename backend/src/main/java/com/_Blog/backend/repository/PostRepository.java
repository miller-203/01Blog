package com._Blog.backend.repository;

import com._Blog.backend.domain.model.Post;
import com._Blog.backend.domain.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByUserId(Long userId);

    List<Post> findAllByOrderByCreatedAtDesc();

    List<Post> findByUserInOrderByCreatedAtDesc(List<User> users);

    void deleteByUserId(Long userId);
}

