package com._Blog.backend.dto;

import lombok.Data;

@Data
public class ReportRequest {
    private Long reportedUserId;
    private String reason;
}
