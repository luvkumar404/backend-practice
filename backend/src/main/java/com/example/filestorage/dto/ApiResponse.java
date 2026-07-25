package com.example.filestorage.dto;

import java.time.Instant;

public record ApiResponse(String message, Instant timestamp) {
    public static ApiResponse of(String message) {
        return new ApiResponse(message, Instant.now());
    }
}
