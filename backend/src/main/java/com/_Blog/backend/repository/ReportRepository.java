package com._Blog.backend.repository;

import com._Blog.backend.domain.model.Report;
import com._Blog.backend.domain.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByReportedUser(User reportedUser);

    void deleteByReportedPostId(Long postId);
    void deleteByReporterId(Long userId);
    void deleteByReportedUserId(Long userId);
}

