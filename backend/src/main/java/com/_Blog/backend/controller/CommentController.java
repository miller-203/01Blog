package com._Blog.backend.controller;

import com._Blog.backend.domain.model.Comment;
import com._Blog.backend.domain.model.Post;
import com._Blog.backend.domain.model.User;
import com._Blog.backend.dto.CommentRequest;
import com._Blog.backend.repository.CommentLikeRepository;
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
    private static final String BANNED_STATUS = "BANNED";

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CommentLikeRepository commentLikeRepository;

    @PostMapping
    public ResponseEntity<?> addComment(@RequestBody CommentRequest request, Authentication authentication) {
        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (isBanned(user)) {
            return ResponseEntity.status(403).body("You cannot comment while your account is banned!");
        }

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
        if (isBanned(currentUser)) {
            return ResponseEntity.status(403).build();
        }

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!canDeleteComment(comment, currentUser)) {
            return ResponseEntity.status(403).build();
        }

        commentLikeRepository.deleteByCommentId(comment.getId());
        commentRepository.delete(comment);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/like")
    public ResponseEntity<Map<String, Object>> toggleCommentLike(@RequestBody Map<String, Object> payload, Authentication authentication) {
        Object commentIdRaw = payload.get("commentId");
        if (commentIdRaw == null) {
            return ResponseEntity.badRequest().build();
        }

        Long commentId = Long.valueOf(String.valueOf(commentIdRaw));

        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (isBanned(user)) {
            return ResponseEntity.status(403).build();
        }

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        boolean liked;
        var existing = commentLikeRepository.findByUserAndComment(user, comment);
        if (existing.isPresent()) {
            commentLikeRepository.delete(existing.get());
            liked = false;
        } else {
            var commentLike = new com._Blog.backend.domain.model.CommentLike();
            commentLike.setUser(user);
            commentLike.setComment(comment);
            commentLikeRepository.save(commentLike);
            liked = true;
        }

        Map<String, Object> response = new HashMap<>();
        response.put("liked", liked);
        response.put("likesCount", commentLikeRepository.countByComment(comment));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/like")
    public ResponseEntity<Map<String, Object>> getCommentLikeStatus(@RequestParam Long commentId, Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        Map<String, Object> response = new HashMap<>();
        response.put("liked", commentLikeRepository.findByUserAndComment(user, comment).isPresent());
        response.put("likesCount", commentLikeRepository.countByComment(comment));
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
        data.put("canDelete", canDeleteComment(comment, currentUser));
        data.put("postId", comment.getPost().getId());
        data.put("createdAt", comment.getCreatedAt());
        data.put("liked", commentLikeRepository.findByUserAndComment(currentUser, comment).isPresent());
        data.put("likesCount", commentLikeRepository.countByComment(comment));
        return data;
    }

    private boolean canDeleteComment(Comment comment, User currentUser) {
        boolean isCommentOwner = comment.getUser().getId().equals(currentUser.getId());
        boolean isPostOwner = comment.getPost() != null
                && comment.getPost().getUser() != null
                && comment.getPost().getUser().getId().equals(currentUser.getId());
        String normalizedRole = currentUser.getRole() == null ? "" : currentUser.getRole().toUpperCase();
        boolean isAdmin = "ADMIN".equals(normalizedRole) || "ROLE_ADMIN".equals(normalizedRole);
        return isCommentOwner || isPostOwner || isAdmin;
    }

    private boolean isBanned(User user) {
        return user != null && BANNED_STATUS.equalsIgnoreCase(user.getStatus());
    }
}
