package com._Blog.backend.dto;

public class FollowRequest {
    private Long followedUserId;

    public Long getFollowedUserId() {
        return followedUserId;
    }

    public void setFollowedUserId(Long followedUserId) {
        this.followedUserId = followedUserId;
    }
}
