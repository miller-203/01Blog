package com._Blog.backend.repository;

import com._Blog.backend.domain.model.Notification;
import com._Blog.backend.domain.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);
    
    void deleteBySenderAndRecipientAndType(User sender, User recipient, String type);

    void deleteByPostId(Long postId);
    void deleteByRecipientId(Long userId);
    void deleteBySenderId(Long userId);
}
