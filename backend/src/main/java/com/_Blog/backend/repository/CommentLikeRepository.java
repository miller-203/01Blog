package com._Blog.backend.repository;

import com._Blog.backend.domain.model.Comment;
import com._Blog.backend.domain.model.CommentLike;
import com._Blog.backend.domain.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CommentLikeRepository extends JpaRepository<CommentLike, Long> {
    Optional<CommentLike> findByUserAndComment(User user, Comment comment);
    long countByComment(Comment comment);

    void deleteByCommentId(Long commentId);
    void deleteByCommentPostId(Long postId);
    void deleteByUserId(Long userId);
}
