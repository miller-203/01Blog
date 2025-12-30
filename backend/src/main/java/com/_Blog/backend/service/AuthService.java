package com._Blog.backend.service;

import com._Blog.backend.dto.RegisterRequest;
import com._Blog.backend.domain.model.User;
import com._Blog.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    // We return a String message, or throw an exception if it fails
    public String registerUser(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return "Error: Username is already taken!";
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return "Error: Email is already in use!";
        }

        // Create new user entity
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(encoder.encode(request.getPassword()));
        user.setRole("USER"); 

        userRepository.save(user);
        return "User registered successfully!";
    }
}