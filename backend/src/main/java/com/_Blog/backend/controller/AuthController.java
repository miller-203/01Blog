package com._Blog.backend.controller;

import com._Blog.backend.dto.*;
import com._Blog.backend.domain.model.User;
import com._Blog.backend.repository.UserRepository;
import com._Blog.backend.security.JwtUtils;
import com._Blog.backend.service.AuthService;
import com._Blog.backend.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@CrossOrigin(origins = "http://localhost:4200", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    AuthService authService;

    @Autowired
    FileStorageService fileStorageService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = jwtUtils.generateJwtToken(authentication);

        User user = userRepository.findByUsername(loginRequest.getUsername()).orElseThrow();

        if ("BANNED".equalsIgnoreCase(user.getStatus())) {
            return ResponseEntity.status(403).body("Your account is banned");
        }

        return ResponseEntity.ok(new JwtResponse(jwt, 
                user.getId(), 
                user.getUsername(), 
                user.getEmail(), 
                user.getRole(),
                user.getStatus()));
    }

    @PostMapping(value = "/register", consumes = {"multipart/form-data"})
    public ResponseEntity<?> registerUser(
            @RequestParam("username") String username,
            @RequestParam(value = "firstName", required = false) String firstName,
            @RequestParam(value = "lastName", required = false) String lastName,
            @RequestParam(value = "bio", required = false) String bio,
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam(value = "avatar", required = false) MultipartFile avatar) {
        RegisterRequest signUpRequest = new RegisterRequest();
        signUpRequest.setUsername(username);
        signUpRequest.setFirstName(firstName);
        signUpRequest.setLastName(lastName);
        signUpRequest.setBio(bio);
        signUpRequest.setEmail(email);
        signUpRequest.setPassword(password);

        if (avatar != null && !avatar.isEmpty()) {
            signUpRequest.setProfilePicUrl(fileStorageService.saveFile(avatar));
        }

        String result = authService.registerUser(signUpRequest);

        if (result.startsWith("Error")) {
            return ResponseEntity.badRequest().body(result);
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(signUpRequest.getUsername(), signUpRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = jwtUtils.generateJwtToken(authentication);

        User user = userRepository.findByUsername(signUpRequest.getUsername()).orElseThrow();

        return ResponseEntity.ok(new JwtResponse(jwt,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getStatus()));
    }
}
