package com._Blog.backend.service;

import com._Blog.backend.domain.model.Follow;
import com._Blog.backend.domain.model.User;
import com._Blog.backend.repository.FollowRepository;
import com._Blog.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;

    @Transactional
    public void followUser(Long followerId, Long followedId) {
        if (followerId.equals(followedId)) {
            throw new RuntimeException("You cannot follow yourself");
        }

        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new RuntimeException("Follower not found"));
        User followed = userRepository.findById(followedId)
                .orElseThrow(() -> new RuntimeException("User to follow not found"));

        if (followRepository.existsByFollowerAndFollowed(follower, followed)) {
            throw new RuntimeException("You are already following this user");
        }

        // 4. Save
        Follow follow = new Follow();
        follow.setFollower(follower);
        follow.setFollowed(followed);
        followRepository.save(follow);
    }

    @Transactional
    public void unfollowUser(Long followerId, Long followedId) {
        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new RuntimeException("Follower not found"));
        User followed = userRepository.findById(followedId)
                .orElseThrow(() -> new RuntimeException("User to unfollow not found"));

        Follow follow = followRepository.findByFollowerAndFollowed(follower, followed)
                .orElseThrow(() -> new RuntimeException("Relationship not found"));

        followRepository.delete(follow);
    }

    public List<User> getFollowersForUser(User user) {
        return followRepository.findByFollowed(user).stream()
                .map(Follow::getFollower)
                .toList();
    }
}