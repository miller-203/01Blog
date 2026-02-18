package com._Blog.backend.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class NotificationSchemaMigration implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    public NotificationSchemaMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        ensureNotificationTypeColumnExists();
    }

    private void ensureNotificationTypeColumnExists() {
        Integer count = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM information_schema.columns
                WHERE table_name = 'notifications' AND column_name = 'type'
                """,
                Integer.class
        );

        if (count != null && count == 0) {
            jdbcTemplate.execute("ALTER TABLE notifications ADD COLUMN type VARCHAR(255)");
        }

        jdbcTemplate.execute("UPDATE notifications SET type = 'POST' WHERE type IS NULL");
    }
}
