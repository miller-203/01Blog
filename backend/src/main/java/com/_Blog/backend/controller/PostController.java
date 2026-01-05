package com._Blog.backend.controller;

import com._Blog.backend.domain.model.Post;
import com._Blog.backend.service.FileStorageService;
import com._Blog.backend.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:4200")
public class PostController {

    @Autowired
    private PostService postService;

    @Autowired
    private FileStorageService fileStorageService;

    // 1. Create a Post (Updated to accept Files)
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<Post> createPost(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "file", required = false) MultipartFile file,
            Authentication authentication) {

        String username = authentication.getName();
        String imageUrl = null;

        // 1. Upload the file if it exists
        if (file != null && !file.isEmpty()) {
            imageUrl = fileStorageService.saveFile(file);
        }

        // 2. Create the post in the database
        Post newPost = postService.createPost(username, title, content);

        // 3. If we have an image, update the post with the link
        if (imageUrl != null) {
            newPost.setImageUrl(imageUrl);
            postService.savePost(newPost);
        }

        return ResponseEntity.ok(newPost);
    }

    // 2. Get All Posts
    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts() {
        return ResponseEntity.ok(postService.getAllPosts());
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        
        // Find the post first
        Post post = postService.getPostById(id); // We need to add this helper in Service
        
        // Security Check: Is this YOUR post?
        if (!post.getUser().getUsername().equals(username)) {
            return ResponseEntity.status(403).body("You can only delete your own posts!");
        }

        postService.deletePost(id); // We need to add this in Service
        return ResponseEntity.ok("Post deleted successfully");
    }
    // 4. Update a Post (Edit)
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(@PathVariable Long id, @RequestBody com._Blog.backend.dto.PostRequest request, Authentication authentication) {
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
