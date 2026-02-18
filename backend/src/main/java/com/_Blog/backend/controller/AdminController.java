package com._Blog.backend.controller;

import com._Blog.backend.domain.model.Post;
import com._Blog.backend.domain.model.Report;
import com._Blog.backend.domain.model.User;
import com._Blog.backend.repository.CommentRepository;
import com._Blog.backend.repository.FollowRepository;
import com._Blog.backend.repository.LikeRepository;
import com._Blog.backend.repository.NotificationRepository;
import com._Blog.backend.repository.PostRepository;
import com._Blog.backend.repository.ReportRepository;
import com._Blog.backend.repository.SavedPostRepository;
import com._Blog.backend.repository.UserBlockRepository;
import com._Blog.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:4200")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final ReportRepository reportRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final SavedPostRepository savedPostRepository;
    private final NotificationRepository notificationRepository;
    private final FollowRepository followRepository;
    private final UserBlockRepository userBlockRepository;

    public AdminController(
            UserRepository userRepository,
            PostRepository postRepository,
            ReportRepository reportRepository,
            LikeRepository likeRepository,
            CommentRepository commentRepository,
            SavedPostRepository savedPostRepository,
            NotificationRepository notificationRepository,
            FollowRepository followRepository,
            UserBlockRepository userBlockRepository
    ) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.reportRepository = reportRepository;
        this.likeRepository = likeRepository;
        this.commentRepository = commentRepository;
        this.savedPostRepository = savedPostRepository;
        this.notificationRepository = notificationRepository;
        this.followRepository = followRepository;
        this.userBlockRepository = userBlockRepository;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/users/{id}/ban")
    public ResponseEntity<User> banUser(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        boolean isBanned = "BANNED".equalsIgnoreCase(user.getStatus());
        user.setStatus(isBanned ? "ACTIVE" : "BANNED");
        User updatedUser = userRepository.save(user);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/users/{id}")
    @Transactional
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));

        List<Post> userPosts = postRepository.findByUserId(id);
        for (Post post : userPosts) {
            deletePostDependencies(post.getId());
        }

        reportRepository.deleteByReporterId(id);
        reportRepository.deleteByReportedUserId(id);

        notificationRepository.deleteByRecipientId(id);
        notificationRepository.deleteBySenderId(id);

        followRepository.deleteByFollowerId(id);
        followRepository.deleteByFollowedId(id);

        userBlockRepository.deleteByBlockerId(id);
        userBlockRepository.deleteByBlockedId(id);

        commentRepository.deleteByUserId(id);
        likeRepository.deleteByUserId(id);
        savedPostRepository.deleteByUserId(id);

        postRepository.deleteByUserId(id);
        userRepository.delete(user);

        return ResponseEntity.ok("User deleted");
    }

    @GetMapping("/posts")
    public ResponseEntity<List<Post>> getAllPosts() {
        return ResponseEntity.ok(postRepository.findAllByOrderByCreatedAtDesc());
    }

    @DeleteMapping("/posts/{id}")
    @Transactional
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        if (!postRepository.existsById(id)) {
            throw new RuntimeException("Post not found");
        }

        deletePostDependencies(id);
        postRepository.deleteById(id);

        return ResponseEntity.ok("Post removed");
    }

    @PutMapping("/posts/{id}/toggle-hide")
    public ResponseEntity<Post> togglePostVisibility(@PathVariable Long id) {
        Post post = postRepository.findById(id).orElseThrow(() -> new RuntimeException("Post not found"));
        boolean hidden = "HIDDEN".equalsIgnoreCase(post.getStatus());
        post.setStatus(hidden ? "ACTIVE" : "HIDDEN");
        return ResponseEntity.ok(postRepository.save(post));
    }

    @GetMapping("/reports")
    public ResponseEntity<List<Report>> getAllReports() {
        return ResponseEntity.ok(reportRepository.findAll());
    }

    @PutMapping("/reports/{id}/resolve")
    public ResponseEntity<Report> resolveReport(@PathVariable Long id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        report.setStatus("RESOLVED");
        reportRepository.save(report);
        return ResponseEntity.ok(report);
    }

    private void deletePostDependencies(Long postId) {
        likeRepository.deleteByPostId(postId);
        commentRepository.deleteByPostId(postId);
        savedPostRepository.deleteByPostId(postId);
        notificationRepository.deleteByPostId(postId);
        reportRepository.deleteByReportedPostId(postId);
    }
}
