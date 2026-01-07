package com._Blog.backend.repository;

import com._Blog.backend.domain.model.Like;
import com._Blog.backend.domain.model.Post;
import com._Blog.backend.domain.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LikeRepository extends JpaRepository<Like, Long> {
    Optional<Like> findByUserAndPost(User user, Post post);
    long countByPost(Post post);
}