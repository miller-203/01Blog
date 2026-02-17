package com._Blog.backend.controller;

import com._Blog.backend.domain.model.Post;
import com._Blog.backend.domain.model.SavedPost;
import com._Blog.backend.domain.model.User;
import com._Blog.backend.dto.PostResponse;
import com._Blog.backend.repository.CommentRepository;
import com._Blog.backend.repository.LikeRepository;
import com._Blog.backend.repository.PostRepository;
import com._Blog.backend.repository.SavedPostRepository;
import com._Blog.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/saveds")
@CrossOrigin(origins = "http://localhost:4200")
public class SavedPostController {

    private final SavedPostRepository savedPostRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;

    public SavedPostController(SavedPostRepository savedPostRepository,
                               UserRepository userRepository,
                               PostRepository postRepository,
                               LikeRepository likeRepository,
                               CommentRepository commentRepository) {
        this.savedPostRepository = savedPostRepository;
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.likeRepository = likeRepository;
        this.commentRepository = commentRepository;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> toggleSave(@RequestBody Map<String, Long> body, Authentication authentication) {
        Long postId = body.get("postId");
        if (postId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "postId is required"));
        }

        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        boolean isSaved;
        var existing = savedPostRepository.findByUserAndPost(user, post);
        if (existing.isPresent()) {
            savedPostRepository.delete(existing.get());
            isSaved = false;
        } else {
            SavedPost savedPost = new SavedPost();
            savedPost.setUser(user);
            savedPost.setPost(post);
            savedPostRepository.save(savedPost);
            isSaved = true;
        }

        Map<String, Object> response = new HashMap<>();
        response.put("saved", isSaved);
        response.put("savesCount", savedPostRepository.countByPost(post));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/posts")
    public ResponseEntity<List<PostResponse>> getSavedPosts(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<PostResponse> response = savedPostRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(SavedPost::getPost)
                .map(post -> toPostResponse(post, user))
                .toList();
        return ResponseEntity.ok(response);
    }

    private PostResponse toPostResponse(Post post, User currentUser) {
        PostResponse resp = new PostResponse();
        resp.setId(post.getId());
        resp.setTitle(post.getTitle());
        resp.setContent(post.getContent());
        resp.setImageUrl(post.getImageUrl());
        resp.setCreatedAt(post.getCreatedAt());
        resp.setUserId(post.getUser().getId());
        resp.setUsername(post.getUser().getUsername());
        resp.setLikeCount(likeRepository.countByPost(post));
        resp.setCommentsCount(commentRepository.findByPostId(post.getId()).size());
        resp.setSavesCount(savedPostRepository.countByPost(post));
        resp.setLikedByCurrentUser(likeRepository.findByUserAndPost(currentUser, post).isPresent());
        resp.setSavedByCurrentUser(savedPostRepository.findByUserAndPost(currentUser, post).isPresent());
        return resp;
    }
}
