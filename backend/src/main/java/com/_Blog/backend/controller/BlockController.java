package com._Blog.backend.controller;

import com._Blog.backend.domain.model.User;
import com._Blog.backend.domain.model.UserBlock;
import com._Blog.backend.repository.FollowRepository;
import com._Blog.backend.repository.UserBlockRepository;
import com._Blog.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/blocks")
@CrossOrigin(origins = "http://localhost:4200")
public class BlockController {
    private static final String BANNED_STATUS = "BANNED";

    private final UserRepository userRepository;
    private final UserBlockRepository userBlockRepository;
    private final FollowRepository followRepository;

    public BlockController(UserRepository userRepository, UserBlockRepository userBlockRepository, FollowRepository followRepository) {
        this.userRepository = userRepository;
        this.userBlockRepository = userBlockRepository;
        this.followRepository = followRepository;
    }

    @PostMapping("/{userId}")
    public ResponseEntity<?> blockUser(@PathVariable Long userId, Authentication authentication) {
        User me = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        if (isBanned(me)) {
            return ResponseEntity.status(403).body("You cannot block users while your account is banned!");
        }
        User userToBlock = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User to block not found"));

        if (me.getId().equals(userToBlock.getId())) {
            return ResponseEntity.badRequest().body("You cannot block yourself");
        }

        if (userBlockRepository.existsByBlockerAndBlocked(me, userToBlock)) {
            return ResponseEntity.badRequest().body("User already blocked");
        }

        UserBlock block = new UserBlock();
        block.setBlocker(me);
        block.setBlocked(userToBlock);
        userBlockRepository.save(block);

        followRepository.findByFollowerAndFollowed(me, userToBlock).ifPresent(followRepository::delete);
        followRepository.findByFollowerAndFollowed(userToBlock, me).ifPresent(followRepository::delete);

        return ResponseEntity.ok("User blocked successfully");
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> unblockUser(@PathVariable Long userId, Authentication authentication) {
        User me = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        if (isBanned(me)) {
            return ResponseEntity.status(403).body("You cannot unblock users while your account is banned!");
        }
        User blockedUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User to unblock not found"));

        return userBlockRepository.findByBlockerAndBlocked(me, blockedUser)
                .map(block -> {
                    userBlockRepository.delete(block);
                    return ResponseEntity.ok("User unblocked");
                })
                .orElseGet(() -> ResponseEntity.badRequest().body("User is not blocked"));
    }

    @GetMapping("/ids")
    public ResponseEntity<List<Long>> getBlockedUserIds(Authentication authentication) {
        User me = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        List<Long> blockedIds = userBlockRepository.findByBlocker(me).stream()
                .map(block -> block.getBlocked().getId())
                .toList();

        return ResponseEntity.ok(blockedIds);
    }

    private boolean isBanned(User user) {
        return user != null && BANNED_STATUS.equalsIgnoreCase(user.getStatus());
    }
}
