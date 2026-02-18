package com._Blog.backend.repository;

import com._Blog.backend.domain.model.User;
import com._Blog.backend.domain.model.UserBlock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserBlockRepository extends JpaRepository<UserBlock, Long> {
    boolean existsByBlockerAndBlocked(User blocker, User blocked);

    Optional<UserBlock> findByBlockerAndBlocked(User blocker, User blocked);

    List<UserBlock> findByBlocker(User blocker);

    List<UserBlock> findByBlocked(User blocked);

    void deleteByBlockerId(Long userId);
    void deleteByBlockedId(Long userId);
}

