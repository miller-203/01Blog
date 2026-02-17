package com._Blog.backend.controller;

import com._Blog.backend.domain.model.Notification;
import com._Blog.backend.domain.model.User;
import com._Blog.backend.dto.NotificationResponse;
import com._Blog.backend.repository.NotificationRepository;
import com._Blog.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:4200")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<NotificationResponse> notifications = notificationRepository.findByRecipientOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        long unreadCount = notificationRepository.findByRecipientOrderByCreatedAtDesc(user).stream()
                .filter(notification -> !Boolean.TRUE.equals(notification.getIsRead()))
                .count();
        return ResponseEntity.ok(unreadCount);
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markNotificationAsRead(@PathVariable Long notificationId, Authentication authentication) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getRecipient().getUsername().equals(authentication.getName())) {
            return ResponseEntity.status(403).build();
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
        return ResponseEntity.noContent().build();
    }

    private NotificationResponse toResponse(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setActorId(String.valueOf(notification.getSender().getId()));
        response.setActorUsername(notification.getSender().getUsername());
        response.setActorFirstName(notification.getSender().getFirstName());
        response.setActorLastName(notification.getSender().getLastName());
        response.setActorAvatar(notification.getSender().getProfilePicUrl());
        response.setType(notification.getType());
        response.setPostId(notification.getPost() != null ? String.valueOf(notification.getPost().getId()) : null);
        response.setMessage(notification.getMessage());
        response.setCreatedAt(notification.getCreatedAt());
        response.setRead(Boolean.TRUE.equals(notification.getIsRead()));
        return response;
    }
}
