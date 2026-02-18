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

    public String registerUser(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return "Error: Username is already taken!";
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return "Error: Email is already in use!";
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setBio(request.getBio());
        user.setEmail(request.getEmail());
        user.setPassword(encoder.encode(request.getPassword()));
        user.setRole("USER");
        user.setStatus("ACTIVE");
        user.setProfilePicUrl(request.getProfilePicUrl());

        userRepository.save(user);
        return "User registered successfully!";
    }
    
}
