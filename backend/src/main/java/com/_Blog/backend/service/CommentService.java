package com._Blog.backend.service;

import com._Blog.backend.domain.model.Comment;
import com._Blog.backend.domain.model.Post;
import com._Blog.backend.domain.model.User;
import com._Blog.backend.repository.CommentRepository;
import com._Blog.backend.repository.PostRepository;
import com._Blog.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    @Transactional
    public Comment createComment(String username, Long postId, String content) {

        User user = userRepository.findByUsernameForUpdate(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDateTime lastCommentTime =
                commentRepository.getLastCommentTimeByUser(user);

        if (lastCommentTime != null &&
                lastCommentTime.isAfter(LocalDateTime.now().minusSeconds(2))) {

            throw new RuntimeException("COMMENT_RATE_LIMIT");
        }

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Comment comment = new Comment();
        comment.setContent(content);
        comment.setUser(user);
        comment.setPost(post);

        return commentRepository.saveAndFlush(comment);
    }
}