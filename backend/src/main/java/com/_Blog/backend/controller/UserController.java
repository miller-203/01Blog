package com._Blog.backend.controller;

import com._Blog.backend.domain.model.User;
import com._Blog.backend.dto.UserProfileDTO;
import com._Blog.backend.repository.PostRepository;
import com._Blog.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    PostRepository postRepository;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDTO> getMyProfile(Authentication authentication) {
        // 1. Get the logged-in username
        String username = authentication.getName();

        // 2. Find the user in DB
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // 3. Count their posts
        int postCount = postRepository.findByUserId(user.getId()).size();

        // 4. Create DTO and return
        UserProfileDTO profile = new UserProfileDTO(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getCreatedAt(),
            postCount
        );

        return ResponseEntity.ok(profile);
    }
}