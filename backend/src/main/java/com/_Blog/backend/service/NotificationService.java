package com._Blog.backend.service;

import com._Blog.backend.domain.model.Notification;
import com._Blog.backend.domain.model.Post;
import com._Blog.backend.domain.model.User;
import com._Blog.backend.repository.NotificationRepository;
import com._Blog.backend.repository.PostRepository;
import com._Blog.backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {
    
    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    public Notification createNotification(User sender, User recipient, Post post, String message) {
        Notification notification = new Notification();
        notification.setSender(sender);
        notification.setRecipient(recipient);
        notification.setPost(post);
        notification.setMessage(message);
        return notificationRepository.save(notification);
    }
    public List<Notification> getUserNotifications(User currentUser) {
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(currentUser);
    }
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }
}
