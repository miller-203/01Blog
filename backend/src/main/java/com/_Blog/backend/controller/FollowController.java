package com._Blog.backend.controller;

import com._Blog.backend.domain.model.Follow;
import com._Blog.backend.domain.model.User;
import com._Blog.backend.repository.FollowRepository;
import com._Blog.backend.repository.UserRepository;
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

    // 1. Add a Follow
    @PostMapping("/follow/{userId}") // userId here is the person I want to follow
        public ResponseEntity<?> addFollow(@PathVariable Long userId, Authentication authentication) {
            // 1. Get ME (the follower) from the token
            String currentUsername = authentication.getName();
            User me = userRepository.findByUsername(currentUsername)
                    .orElseThrow(() -> new RuntimeException("Current user not found"));
        
            // 2. Get THEM (the person to be followed) from the PathVariable
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
        
            return ResponseEntity.ok("Followed successfully");
        }

    @PostMapping("/unfollow")
    public ResponseEntity<?> removeFollow(@RequestBody FollowRequest request, Authentication authentication) {
        String username = authentication.getName();
        // Find User
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        // Find Followed User
        User followedUser = userRepository.findById(request.getFollower())
                .orElseThrow(() -> new RuntimeException("Followed user not found"));
        // Find Follow Relationship
        Follow follow = followRepository.findByFollowerAndFollowed(user, followedUser)
                .orElseThrow(() -> new RuntimeException("Follow relationship not found"));
        // Delete Follow
        followRepository.delete(follow);
        return ResponseEntity.ok("Follow removed!");
    }

    // 2. Get Followers for a User
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