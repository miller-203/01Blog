package com._Blog.backend.controller;

import com._Blog.backend.domain.model.Post;
import com._Blog.backend.domain.model.User;
import com._Blog.backend.dto.PostRequest;
import com._Blog.backend.dto.PostResponse;
import com._Blog.backend.repository.LikeRepository;
import com._Blog.backend.repository.UserBlockRepository;
import com._Blog.backend.repository.UserRepository;
import com._Blog.backend.service.FileStorageService;
import com._Blog.backend.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:4200")
public class PostController {

    @Autowired
    private PostService postService;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserBlockRepository userBlockRepository;

    private static final long MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> createPost(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "file", required = false) MultipartFile file,
            Authentication authentication) {

        String username = authentication.getName();
        String imageUrl = null;

        if (file != null && !file.isEmpty()) {
            if (file.getSize() > MAX_IMAGE_SIZE_BYTES) {
                return ResponseEntity.status(413).body("Image exceeds 5MB limit");
            }
            imageUrl = fileStorageService.saveFile(file);
        }

        Post newPost = postService.createPost(username, title, content);

        if (imageUrl != null) {
            newPost.setImageUrl(imageUrl);
            postService.savePost(newPost);
        }

        return ResponseEntity.ok(newPost);
    }

    @GetMapping
    public ResponseEntity<List<PostResponse>> getAllPosts(Authentication authentication) {
        String currentUsername = (authentication != null) ? authentication.getName() : "";

        Set<Long> blockedByMe = java.util.Collections.emptySet();
        Set<Long> blockedMe = java.util.Collections.emptySet();

        if (!currentUsername.isEmpty()) {
            User currentUser = userRepository.findByUsername(currentUsername).orElse(null);
            if (currentUser != null) {
                blockedByMe = userBlockRepository.findByBlocker(currentUser).stream()
                        .map(block -> block.getBlocked().getId())
                        .collect(java.util.stream.Collectors.toSet());
                blockedMe = userBlockRepository.findByBlocked(currentUser).stream()
                        .map(block -> block.getBlocker().getId())
                        .collect(java.util.stream.Collectors.toSet());
            }
        }

        List<Post> posts = postService.getAllPosts().stream()
                .filter(post -> !blockedByMe.contains(post.getUser().getId()) && !blockedMe.contains(post.getUser().getId()))
                .toList();

        List<PostResponse> responseList = posts.stream().map(post -> {
            PostResponse resp = new PostResponse();
            resp.setId(post.getId());
            resp.setTitle(post.getTitle());
            resp.setContent(post.getContent());
            resp.setImageUrl(post.getImageUrl());
            resp.setCreatedAt(post.getCreatedAt());
            resp.setUsername(post.getUser().getUsername());
            
            resp.setLikeCount(likeRepository.countByPost(post));
            if (!currentUsername.isEmpty()) {
                User user = userRepository.findByUsername(currentUsername).orElse(null);
                if (user != null) {
                    resp.setLikedByCurrentUser(likeRepository.findByUserAndPost(user, post).isPresent());
                }
            }
            return resp;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        Post post = postService.getPostById(id);
        
        if (!post.getUser().getUsername().equals(username)) {
            return ResponseEntity.status(403).body("You can only delete your own posts!");
        }

        postService.deletePost(id);
        return ResponseEntity.ok("Post deleted successfully");
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(@PathVariable Long id, @RequestBody PostRequest request, Authentication authentication) {
        String username = authentication.getName();
        Post post = postService.getPostById(id);
        
        if (!post.getUser().getUsername().equals(username)) {
            return ResponseEntity.status(403).body("You can only edit your own posts!");
        }

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        postService.savePost(post);
        
        return ResponseEntity.ok(post);
    }
}