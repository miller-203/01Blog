package com._Blog.backend.dto;

public class NotificationRequest {
    private Long senderId;
    private Long recipientId;
    private Long postId;
    private String message;
    private Boolean isRead;

    // Getters and Setters
    public Long getSender() {
        return senderId;
    }

    public void setSender(Long senderId) {
        this.senderId = senderId;
    }

    public Long getRecipient() {
        return recipientId;
    }

    public void setRecipient(Long recipientId) {
        this.recipientId = recipientId;
    }

    public Long getPost() {
        return postId;
    }

    public void setPost(Long postId) {
        this.postId = postId;
    }
    public void setMessage(String message) {
        this.message = message;
    }
    public String getMessage() {
        return message;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }

}
