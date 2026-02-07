package com._Blog.backend.controller;

import com._Blog.backend.domain.model.Follow;
import com._Blog.backend.domain.model.User;
import com._Blog.backend.repository.FollowRepository;
import com._Blog.backend.repository.UserRepository;
// import com._Blog.backend.repository.NotificationRepository;
import com._Blog.backend.service.NotificationService;
import com._Blog.backend.dto.FollowRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/follows")
@CrossOrigin(origins = "http://localhost:4200")
public class FollowController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FollowRepository followRepository;

    @Autowired
    private NotificationService notificationService;

    @PostMapping("/follow/{userId}")
        public ResponseEntity<?> addFollow(@PathVariable Long userId, Authentication authentication) {
            String currentUsername = authentication.getName();
            User me = userRepository.findByUsername(currentUsername)
                    .orElseThrow(() -> new RuntimeException("Current user not found"));
        
            User toFollow = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User to follow not found"));
        
            if (me.getId().equals(toFollow.getId())) {
                return ResponseEntity.badRequest().body("You cannot follow yourself");
            }
        
            if (followRepository.existsByFollowerAndFollowed(me, toFollow)) {
                return ResponseEntity.badRequest().body("Already following");
            }
        
            Follow follow = new Follow();
            follow.setFollower(me);
            follow.setFollowed(toFollow);
            followRepository.save(follow);
        
                // Create a notification for the followed user
            // notificationService.createNotification(me, toFollow, null, me.getUsername() + " started following you!");
            
            return ResponseEntity.ok("Followed successfully");
        }

    @PostMapping("/unfollow/{userId}")
    public ResponseEntity<?> removeFollow(@PathVariable Long userId, Authentication authentication) {
        String currentUsername = authentication.getName();

        User me = userRepository.findByUsername(currentUsername)
                    .orElseThrow(() -> new RuntimeException("Current user not found"));

        User toFollow = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User to unfollow not found"));

        if (me.getId().equals(toFollow.getId())) {
                return ResponseEntity.badRequest().body("You cannot unfollow yourself");
            }

        Follow follow = followRepository.findByFollowerAndFollowed(me, toFollow)
                .orElseThrow(() -> new RuntimeException("Follow relationship not found"));

        followRepository.delete(follow);

        return ResponseEntity.ok("Follow removed!");
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<User>> getFollowersByUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<User> followers = followRepository.findByFollowed(user).stream()
                .map(Follow::getFollower)
                .toList();
        return ResponseEntity.ok(followers);
    }
}