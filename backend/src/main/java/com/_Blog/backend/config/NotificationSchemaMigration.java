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
        ensureNotificationTypeColumnsAreCompatible();
    }

    private void ensureNotificationTypeColumnsAreCompatible() {
        boolean hasLegacyType = hasColumn("notifications", "type");
        boolean hasNotificationType = hasColumn("notifications", "notification_type");

        if (!hasNotificationType) {
            jdbcTemplate.execute("ALTER TABLE notifications ADD COLUMN notification_type VARCHAR(255)");
        }

        if (hasLegacyType) {
            jdbcTemplate.execute("""
                    UPDATE notifications
                    SET notification_type = COALESCE(notification_type, type)
                    WHERE notification_type IS NULL
                    """);
        }

        jdbcTemplate.execute("UPDATE notifications SET notification_type = 'POST' WHERE notification_type IS NULL");
    }

    private boolean hasColumn(String tableName, String columnName) {
        Integer count = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM information_schema.columns
                WHERE table_name = ?
                  AND column_name = ?
                """,
                Integer.class,
                tableName,
                columnName
        );

        return count != null && count > 0;
    }
}
