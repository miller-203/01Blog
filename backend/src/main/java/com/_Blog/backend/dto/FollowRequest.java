package com._Blog.backend.dto;

public class FollowRequest {
    private Long followedUserId;

    public Long getFollower() {
        return followedUserId;
    }

    public void setFollower(Long followedUserId) {
        this.followedUserId = followedUserId;
    }
}
