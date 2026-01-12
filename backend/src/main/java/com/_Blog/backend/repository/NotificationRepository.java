package com._Blog.backend.repository;

import com._Blog.backend.domain.model.Notification;
import com._Blog.backend.domain.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // Find all notifications for a specific User ID
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);
}