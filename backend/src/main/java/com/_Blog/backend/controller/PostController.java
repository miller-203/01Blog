package com._Blog.backend.controller;

import com._Blog.backend.domain.model.Post;
import com._Blog.backend.domain.model.User;
import com._Blog.backend.dto.PostRequest;
import com._Blog.backend.dto.PostResponse;
import com._Blog.backend.repository.FollowRepository;
import com._Blog.backend.repository.LikeRepository;
import com._Blog.backend.repository.PostRepository;
import com._Blog.backend.repository.CommentRepository;
import com._Blog.backend.repository.UserRepository;
import com._Blog.backend.service.FileStorageService;
import com._Blog.backend.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:4200")
public class PostController {

    private static final String HIDDEN_STATUS = "HIDDEN";
    private static final String BANNED_STATUS = "BANNED";

    @Autowired
    private PostService postService;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private FollowRepository followRepository;

    private static final long MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
    private static final long MAX_VIDEO_SIZE_BYTES = 25 * 1024 * 1024;

    @PostMapping(value = "/upload-image", consumes = {"multipart/form-data"})
    public ResponseEntity<?> uploadImage(@RequestParam("image") MultipartFile image, Authentication authentication) {
        ResponseEntity<?> bannedResponse = bannedActionResponse(authentication, "You cannot upload images while your account is banned!");
        if (bannedResponse != null) {
            return bannedResponse;
        }

        if (image == null || image.isEmpty()) {
            return ResponseEntity.badRequest().body("Image file is required");
        }

        if (image.getSize() > MAX_IMAGE_SIZE_BYTES) {
            return ResponseEntity.status(413).body("Image exceeds 5MB limit");
        }

        String imageUrl = fileStorageService.saveFile(image);

        Map<String, Object> file = new HashMap<>();
        file.put("url", toPublicUploadUrl(imageUrl));

        Map<String, Object> response = new HashMap<>();
        response.put("success", 1);
        response.put("file", file);

        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/upload-video", consumes = {"multipart/form-data"})
    public ResponseEntity<?> uploadVideo(@RequestParam("video") MultipartFile video, Authentication authentication) {
        ResponseEntity<?> bannedResponse = bannedActionResponse(authentication, "You cannot upload videos while your account is banned!");
        if (bannedResponse != null) {
            return bannedResponse;
        }

        if (video == null || video.isEmpty()) {
            return ResponseEntity.badRequest().body("Video file is required");
        }

        if (video.getSize() > MAX_VIDEO_SIZE_BYTES) {
            return ResponseEntity.status(413).body("Video exceeds 25MB limit");
        }

        String videoUrl = fileStorageService.saveFile(video);

        Map<String, Object> file = new HashMap<>();
        file.put("url", toPublicUploadUrl(videoUrl));

        Map<String, Object> response = new HashMap<>();
        response.put("success", 1);
        response.put("file", file);

        return ResponseEntity.ok(response);
    }


    private String toPublicUploadUrl(String storedPath) {
        if (storedPath == null || storedPath.isBlank()) {
            return storedPath;
        }

        if (storedPath.startsWith("http://") || storedPath.startsWith("https://")) {
            return storedPath;
        }

        String normalized = storedPath.startsWith("/") ? storedPath.substring(1) : storedPath;
        if (!normalized.startsWith("uploads/")) {
            normalized = "uploads/" + normalized;
        }

        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/")
                .path(normalized)
                .toUriString();
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> createPost(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "file", required = false) MultipartFile file,
            Authentication authentication) {

        String username = authentication.getName();
        String imageUrl = null;

        if (username == null || username.isEmpty()) {
            return ResponseEntity.status(401).body("Authentication required");
        }
        ResponseEntity<?> bannedResponse = bannedActionResponse(authentication, "You cannot create posts while your account is banned!");
        if (bannedResponse != null) {
            return bannedResponse;
        }

        if (file != null && !file.isEmpty()) {
            if (file.getSize() > MAX_IMAGE_SIZE_BYTES) {
                return ResponseEntity.status(413).body("Image exceeds 5MB limit");
            }
            imageUrl = toPublicUploadUrl(fileStorageService.saveFile(file));
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

        User currentUser = !currentUsername.isEmpty()
                ? userRepository.findByUsername(currentUsername).orElse(null)
                : null;

        List<Post> posts = postService.getAllPosts().stream()
                .filter(this::isVisiblePost)
                .toList();

        List<PostResponse> responseList = posts.stream().map(post -> {
            PostResponse resp = new PostResponse();
                resp.setId(post.getId());
                resp.setTitle(post.getTitle());
                resp.setContent(post.getContent());
                resp.setImageUrl(post.getImageUrl());
                resp.setCreatedAt(post.getCreatedAt());
                resp.setUserId(post.getUser().getId());
                resp.setUsername(post.getUser().getUsername());
                resp.setAuthorFirstName(post.getUser().getFirstName());
                resp.setAuthorLastName(post.getUser().getLastName());
                resp.setAvatarUrl(post.getUser().getProfilePicUrl());
                resp.setOwner(currentUser != null && post.getUser().getId().equals(currentUser.getId()));
                
                resp.setLikeCount(likeRepository.countByPost(post));
                resp.setCommentsCount(commentRepository.findByPostId(post.getId()).size());
                if (currentUser != null) {
                    resp.setLikedByCurrentUser(likeRepository.findByUserAndPost(currentUser, post).isPresent());
                }
                return resp;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }

    @GetMapping("/feed")
    public ResponseEntity<List<PostResponse>> getFollowingFeed(Authentication authentication) {
        String currentUsername = authentication.getName();

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        List<User> followedUsers = followRepository.findByFollower(currentUser).stream()
                .map(follow -> follow.getFollowed())
                .toList();

        if (followedUsers.isEmpty()) {
            return ResponseEntity.ok(new ArrayList<>());
        }

        List<Post> posts = postService.getAllPosts().stream()
                .filter(this::isVisiblePost)
                .filter(post -> followedUsers.stream().anyMatch(user -> user.getId().equals(post.getUser().getId())))
                .toList();

        List<PostResponse> responseList = posts.stream().map(post -> {
            PostResponse resp = new PostResponse();
            resp.setId(post.getId());
            resp.setTitle(post.getTitle());
            resp.setContent(post.getContent());
            resp.setImageUrl(post.getImageUrl());
            resp.setCreatedAt(post.getCreatedAt());
            resp.setUserId(post.getUser().getId());
            resp.setUsername(post.getUser().getUsername());
            resp.setAuthorFirstName(post.getUser().getFirstName());
            resp.setAuthorLastName(post.getUser().getLastName());
            resp.setAvatarUrl(post.getUser().getProfilePicUrl());
            resp.setOwner(currentUser != null && post.getUser().getId().equals(currentUser.getId()));
            resp.setLikeCount(likeRepository.countByPost(post));
            resp.setCommentsCount(commentRepository.findByPostId(post.getId()).size());
            resp.setLikedByCurrentUser(likeRepository.findByUserAndPost(currentUser, post).isPresent());
            return resp;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }


    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPostById(@PathVariable Long id, Authentication authentication) {
        String currentUsername = (authentication != null) ? authentication.getName() : "";
        User currentUser = !currentUsername.isEmpty()
                ? userRepository.findByUsername(currentUsername).orElse(null)
                : null;

        Post post = postService.getPostById(id);
        if (!isVisiblePost(post)) {
            return ResponseEntity.notFound().build();
        }

        PostResponse resp = new PostResponse();
        resp.setId(post.getId());
        resp.setTitle(post.getTitle());
        resp.setContent(post.getContent());
        resp.setImageUrl(post.getImageUrl());
        resp.setCreatedAt(post.getCreatedAt());
        resp.setUserId(post.getUser().getId());
        resp.setUsername(post.getUser().getUsername());
        resp.setAuthorFirstName(post.getUser().getFirstName());
        resp.setAuthorLastName(post.getUser().getLastName());
        resp.setAvatarUrl(post.getUser().getProfilePicUrl());
        resp.setOwner(currentUser != null && post.getUser().getId().equals(currentUser.getId()));
        resp.setLikeCount(likeRepository.countByPost(post));
        resp.setCommentsCount(commentRepository.findByPostId(post.getId()).size());
        if (currentUser != null) {
            resp.setLikedByCurrentUser(likeRepository.findByUserAndPost(currentUser, post).isPresent());
        }

        return ResponseEntity.ok(resp);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PostResponse>> getPostsByUser(@PathVariable Long userId, Authentication authentication) {
        String currentUsername = (authentication != null) ? authentication.getName() : "";
        User currentUser = !currentUsername.isEmpty()
                ? userRepository.findByUsername(currentUsername).orElse(null)
                : null;

        List<PostResponse> responseList = postRepository.findByUserId(userId).stream()
                .filter(this::isVisiblePost)
                .map(post -> {
            PostResponse resp = new PostResponse();
            resp.setId(post.getId());
            resp.setTitle(post.getTitle());
            resp.setContent(post.getContent());
            resp.setImageUrl(post.getImageUrl());
            resp.setCreatedAt(post.getCreatedAt());
            resp.setUserId(post.getUser().getId());
            resp.setUsername(post.getUser().getUsername());
            resp.setAuthorFirstName(post.getUser().getFirstName());
            resp.setAuthorLastName(post.getUser().getLastName());
            resp.setAvatarUrl(post.getUser().getProfilePicUrl());
            resp.setOwner(currentUser != null && post.getUser().getId().equals(currentUser.getId()));
            resp.setLikeCount(likeRepository.countByPost(post));
            resp.setCommentsCount(commentRepository.findByPostId(post.getId()).size());
            if (currentUser != null) {
                resp.setLikedByCurrentUser(likeRepository.findByUserAndPost(currentUser, post).isPresent());
                }
            return resp;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        User currentUser = userRepository.findByUsername(username).orElse(null);
        Post post = postService.getPostById(id);

        if (currentUser == null || !post.getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).body("You can only delete your own posts!");
        }
        String accountStatus = post.getUser().getStatus();
        if (accountStatus != null && accountStatus.equalsIgnoreCase("BANNED")) {
            return ResponseEntity.status(403).body("You cannot delete posts while your account is banned!");
        }
        
        postService.deletePost(id);
        return ResponseEntity.ok("Post deleted successfully");
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(@PathVariable Long id, @RequestBody PostRequest request, Authentication authentication) {
        String username = authentication.getName();
        User currentUser = userRepository.findByUsername(username).orElse(null);
        Post post = postService.getPostById(id);
        
        if (currentUser == null || !post.getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).body("You can only edit your own posts!");
        }

        String accountStatus = post.getUser().getStatus();
        if (accountStatus != null && accountStatus.equalsIgnoreCase("BANNED")) {
            return ResponseEntity.status(403).body("You cannot edit posts while your account is banned!");
        }

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        postService.savePost(post);
        
        return ResponseEntity.ok(post);
    }

    private boolean isVisiblePost(Post post) {
        return !HIDDEN_STATUS.equalsIgnoreCase(post.getStatus());
    }

    private ResponseEntity<?> bannedActionResponse(Authentication authentication, String message) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            return ResponseEntity.status(401).body("Authentication required");
        }
        User user = userRepository.findByUsername(authentication.getName()).orElse(null);
        if (user != null && BANNED_STATUS.equalsIgnoreCase(user.getStatus())) {
            return ResponseEntity.status(403).body(message);
        }
        return null;
    }
}
