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

import java.util.List; // <--- THIS WAS MISSING

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
        
        List<UserProfileDTO> users = userRepository.findAll().stream()
                .filter(user -> !user.getUsername().equals(currentUsername)) 
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
} // Make sure this closing bracket is here!