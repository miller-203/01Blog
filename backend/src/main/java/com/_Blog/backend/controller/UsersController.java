package com._Blog.backend.controller;

import com._Blog.backend.domain.model.User;
import com._Blog.backend.dto.UserViewDTO;
import com._Blog.backend.repository.FollowRepository;
import com._Blog.backend.repository.PostRepository;
import com._Blog.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200")
public class UsersController {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final FollowRepository followRepository;

    public UsersController(UserRepository userRepository, PostRepository postRepository, FollowRepository followRepository) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.followRepository = followRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<UserViewDTO> getCurrentUser(Authentication authentication) {
        User me = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(toDto(me, me));
    }

    @GetMapping("/{username}")
    public ResponseEntity<UserViewDTO> getUserByUsername(@PathVariable String username, Authentication authentication) {
        User me = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(toDto(user, me));
    }


    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/all")
    public ResponseEntity<List<UserViewDTO>> getAllUsersForAdmin(Authentication authentication) {
        User me = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        List<UserViewDTO> users = userRepository.findAll().stream()
                .map(user -> toDto(user, me))
                .toList();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserViewDTO>> searchUsers(@RequestParam String username, Authentication authentication) {
        User me = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        String query = username.toLowerCase();
        List<UserViewDTO> users = userRepository.findAll().stream()
                .filter(user -> user.getUsername() != null && user.getUsername().toLowerCase().contains(query))
                .map(user -> toDto(user, me))
                .toList();

        return ResponseEntity.ok(users);
    }

    private UserViewDTO toDto(User user, User me) {
        UserViewDTO dto = new UserViewDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setFirstName(user.getFirstName() != null ? user.getFirstName() : "");
        dto.setLastName(user.getLastName() != null ? user.getLastName() : "");
        dto.setEmail(user.getEmail());
        dto.setStatus(user.getStatus());
        dto.setBio(user.getBio());
        dto.setRole(user.getRole());
        dto.setAvatarUrl(toPublicUploadUrl(user.getProfilePicUrl()));
        dto.setCoverUrl(toPublicUploadUrl(user.getCoverUrl()));
        dto.setFollowersCount(followRepository.countByFollowed(user));
        dto.setFollowingCount(followRepository.countByFollower(user));
        dto.setPostsCount(postRepository.findByUserId(user.getId()).size());
        dto.setCurrentUser(user.getId().equals(me.getId()));
        dto.setCreatedAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
        return dto;
    }

    private String toPublicUploadUrl(String storedPath) {
        if (storedPath == null || storedPath.isBlank()) {
            return "";
        }
        if (storedPath.startsWith("http://") || storedPath.startsWith("https://") || storedPath.startsWith("/")) {
            return storedPath;
        }
        return "/uploads/" + storedPath;
    }
}
