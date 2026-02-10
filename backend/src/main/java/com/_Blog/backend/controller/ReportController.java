package com._Blog.backend.controller;

import com._Blog.backend.domain.model.Report;
import com._Blog.backend.domain.model.User;
import com._Blog.backend.dto.ReportRequest;
import com._Blog.backend.repository.ReportRepository;
import com._Blog.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:4200")
public class ReportController {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;

    public ReportController(ReportRepository reportRepository, UserRepository userRepository) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> createReport(@RequestBody ReportRequest request, Authentication authentication) {
        if (request.getReason() == null || request.getReason().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Reason is required");
        }

        User reporter = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Reporter not found"));

        User reportedUser = userRepository.findById(request.getReportedUserId())
                .orElseThrow(() -> new RuntimeException("Reported user not found"));

        if (reporter.getId().equals(reportedUser.getId())) {
            return ResponseEntity.badRequest().body("You cannot report yourself");
        }

        Report report = new Report();
        report.setReporter(reporter);
        report.setReportedUser(reportedUser);
        report.setReason(request.getReason().trim());

        return ResponseEntity.ok(reportRepository.save(report));
    }
}
