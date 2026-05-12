package com._Blog.backend.controller;

import com._Blog.backend.domain.model.Follow;
import com._Blog.backend.domain.model.User;
import com._Blog.backend.repository.FollowRepository;
import com._Blog.backend.repository.UserRepository;
import com._Blog.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/follows")
@CrossOrigin(origins = "http://localhost:4200")
public class FollowController {
    private static final String BANNED_STATUS = "BANNED";

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
        if (isBanned(me)) {
            return ResponseEntity.status(403).body("You cannot follow users while your account is banned!");
        }

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

        notificationService.createNotification(me, toFollow, null, me.getUsername() + " started following you", "USER");

        return ResponseEntity.ok().build();
    }

    @PostMapping("/unfollow/{userId}")
    public ResponseEntity<?> removeFollow(@PathVariable Long userId, Authentication authentication) {
        String currentUsername = authentication.getName();

        User me = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        if (isBanned(me)) {
            return ResponseEntity.status(403).body("You cannot unfollow users while your account is banned!");
        }

        User toFollow = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User to unfollow not found"));

        if (me.getId().equals(toFollow.getId())) {
            return ResponseEntity.badRequest().body("You cannot unfollow yourself");
        }

        return followRepository.findByFollowerAndFollowed(me, toFollow)
                .map(follow -> {
                    followRepository.delete(follow);
                    return ResponseEntity.ok().build();
                })
                .orElseGet(() -> ResponseEntity.badRequest().body("Not currently following this user"));
    }

    @GetMapping("/following/ids")
    public ResponseEntity<List<Long>> getFollowingIds(Authentication authentication) {
        String currentUsername = authentication.getName();

        User me = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        List<Long> followingIds = followRepository.findByFollower(me).stream()
                .map(follow -> follow.getFollowed().getId())
                .toList();

        return ResponseEntity.ok(followingIds);
    }


    @GetMapping("/{userId}/status")
    public ResponseEntity<Boolean> isFollowing(@PathVariable Long userId, Authentication authentication) {
        User me = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        User target = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(followRepository.existsByFollowerAndFollowed(me, target));
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

    private boolean isBanned(User user) {
        return user != null && BANNED_STATUS.equalsIgnoreCase(user.getStatus());
    }
}
