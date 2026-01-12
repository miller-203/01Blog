package com._Blog.backend.repository;

import com._Blog.backend.domain.model.Follow;
import com._Blog.backend.domain.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FollowRepository extends JpaRepository<Follow, Long> {
    
    // Check if User A already follows User B
    boolean existsByFollowerAndFollowed(User follower, User followed);

    // Find the specific follow record (to delete it when unfollowing)
    Optional<Follow> findByFollowerAndFollowed(User follower, User followed);

    // Get all users who follow a specific user (ESSENTIAL FOR NOTIFICATIONS)
    List<Follow> findByFollowed(User followed);

    // Get all users that a specific user follows (For the Feed)
    List<Follow> findByFollower(User follower);
    
    // Count followers (for profile stats)
    long countByFollowed(User followed);
    
    // Count following (for profile stats)
    long countByFollower(User follower);
}