package com._Blog.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ApiError> handleUsernameNotFound(UsernameNotFoundException ex) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiError> handleBadCredentials(BadCredentialsException ex) {
        return build(HttpStatus.UNAUTHORIZED, "Invalid username or password");
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiError> handleRuntime(RuntimeException ex) {
        HttpStatus status = resolveStatus(ex.getMessage());
        return build(status, ex.getMessage());
    }

    private HttpStatus resolveStatus(String message) {
        if (message == null) {
            return HttpStatus.BAD_REQUEST;
        }

        String normalized = message.toLowerCase();
        if (normalized.contains("not found")) {
            return HttpStatus.NOT_FOUND;
        }

        if (normalized.contains("cannot") || normalized.contains("already") || normalized.contains("required")) {
            return HttpStatus.BAD_REQUEST;
        }

        return HttpStatus.BAD_REQUEST;
    }

    private ResponseEntity<ApiError> build(HttpStatus status, String message) {
        return ResponseEntity
                .status(status)
                .body(new ApiError(status.value(), status.getReasonPhrase(), message));
    }
}
