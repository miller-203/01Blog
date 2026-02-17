package com._Blog.backend.controller;

import com._Blog.backend.domain.model.Comment;
import com._Blog.backend.domain.model.Post;
import com._Blog.backend.domain.model.User;
import com._Blog.backend.dto.CommentRequest;
import com._Blog.backend.repository.CommentRepository;
import com._Blog.backend.repository.PostRepository;
import com._Blog.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "http://localhost:4200")
public class CommentController {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> addComment(@RequestBody CommentRequest request, Authentication authentication) {
        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = postRepository.findById(request.getPostId())
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Comment comment = new Comment();
        comment.setContent(request.getContent());
        comment.setUser(user);
        comment.setPost(post);

        Comment saved = commentRepository.save(comment);

        return ResponseEntity.ok(toFrontendComment(saved, user));
    }

    @GetMapping("/{postId}")
    public ResponseEntity<List<Map<String, Object>>> getCommentsByPost(@PathVariable Long postId, Authentication authentication) {
        User currentUser = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Map<String, Object>> comments = commentRepository.findByPostId(postId).stream()
                .map(comment -> toFrontendComment(comment, currentUser))
                .toList();
        return ResponseEntity.ok(comments);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId, Authentication authentication) {
        User currentUser = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).build();
        }

        commentRepository.delete(comment);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/like")
    public ResponseEntity<Map<String, Object>> toggleCommentLike() {
        Map<String, Object> response = new HashMap<>();
        response.put("liked", false);
        response.put("likesCount", 0);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/like")
    public ResponseEntity<Map<String, Object>> getCommentLikeStatus() {
        Map<String, Object> response = new HashMap<>();
        response.put("liked", false);
        response.put("likesCount", 0);
        return ResponseEntity.ok(response);
    }

    private Map<String, Object> toFrontendComment(Comment comment, User currentUser) {
        Map<String, Object> data = new HashMap<>();
        data.put("id", comment.getId());
        data.put("content", comment.getContent());
        data.put("authorId", comment.getUser().getId());
        data.put("authorFirstName", comment.getUser().getFirstName() != null ? comment.getUser().getFirstName() : "");
        data.put("authorLastName", comment.getUser().getLastName() != null ? comment.getUser().getLastName() : comment.getUser().getUsername());
        data.put("owner", comment.getUser().getId().equals(currentUser.getId()));
        data.put("postId", comment.getPost().getId());
        data.put("createdAt", comment.getCreatedAt());
        data.put("liked", false);
        data.put("likesCount", 0);
        return data;
    }
}
