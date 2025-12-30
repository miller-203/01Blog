package com._Blog.backend.controller;

import com._Blog.backend.dto.*;
import com._Blog.backend.domain.model.User;
import com._Blog.backend.repository.UserRepository;
import com._Blog.backend.security.JwtUtils;
import com._Blog.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:4200", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository; // Used for fetching user details after login

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    AuthService authService; // Our new service

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        // 1. Authenticate with Spring Security
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        // 2. Set Context
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 3. Generate Token
        String jwt = jwtUtils.generateJwtToken(authentication);

        // 4. Get User Info
        User user = userRepository.findByUsername(loginRequest.getUsername()).orElseThrow();

        // 5. Return Response
        return ResponseEntity.ok(new JwtResponse(jwt, 
                user.getId(), 
                user.getUsername(), 
                user.getEmail(), 
                user.getRole()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest signUpRequest) {
        String result = authService.registerUser(signUpRequest);
        
        if (result.startsWith("Error")) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }
}