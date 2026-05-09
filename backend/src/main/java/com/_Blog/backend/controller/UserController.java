package com._Blog.backend.controller;

import com._Blog.backend.domain.model.User;
import com._Blog.backend.dto.UserProfileDTO;
import com._Blog.backend.repository.PostRepository;
import com._Blog.backend.repository.UserBlockRepository;
import com._Blog.backend.repository.UserRepository;
import com._Blog.backend.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    PostRepository postRepository;

    @Autowired
    UserBlockRepository userBlockRepository;

    @Autowired
    FileStorageService fileStorageService;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDTO> getMyProfile(Authentication authentication) {
        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        int postCount = postRepository.findByUserId(user.getId()).size();

        UserProfileDTO profile = new UserProfileDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getCreatedAt(),
                postCount
        );

        return ResponseEntity.ok(profile);
    }

    @GetMapping("/all")
    public ResponseEntity<List<UserProfileDTO>> getAllUsers(Authentication authentication) {
        String currentUsername = authentication.getName();

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Set<Long> blockedByMe = userBlockRepository.findByBlocker(currentUser).stream()
                .map(block -> block.getBlocked().getId())
                .collect(Collectors.toSet());
        Set<Long> blockedMe = userBlockRepository.findByBlocked(currentUser).stream()
                .map(block -> block.getBlocker().getId())
                .collect(Collectors.toSet());

        List<UserProfileDTO> users = userRepository.findAll().stream()
                .filter(user -> !user.getUsername().equals(currentUsername))
                .filter(user -> !blockedByMe.contains(user.getId()) && !blockedMe.contains(user.getId()))
                .map(user -> {
                    int postCount = postRepository.findByUserId(user.getId()).size();
                    return new UserProfileDTO(
                            user.getId(),
                            user.getUsername(),
                            user.getEmail(),
                            user.getCreatedAt(),
                            postCount
                    );
                })
                .toList();

        return ResponseEntity.ok(users);
    }

    @PutMapping(value = "/profile", consumes = {"multipart/form-data"})
    public ResponseEntity<User> updateProfile(
            @RequestParam(value = "firstName", required = false) String firstName,
            @RequestParam(value = "lastName", required = false) String lastName,
            @RequestParam(value = "bio", required = false) String bio,
            @RequestParam(value = "avatar", required = false) MultipartFile avatar,
            @RequestParam(value = "cover", required = false) MultipartFile cover,
            Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));


        if (firstName != null) {
            user.setFirstName(firstName);
        }

        if (lastName != null) {
            user.setLastName(lastName);
        }

        if (bio != null) {
            user.setBio(bio);
        }

        if (avatar != null && !avatar.isEmpty()) {
            String avatarUrl = fileStorageService.saveFile(avatar, "avatars");
            user.setProfilePicUrl(avatarUrl);
        }

        if (cover != null && !cover.isEmpty()) {
            String coverUrl = fileStorageService.saveFile(cover, "covers");
            user.setCoverUrl(coverUrl);
        }

        return ResponseEntity.ok(userRepository.save(user));
    }
}
