package com.example.filestorage.dto;

import com.example.filestorage.entity.FileMetadata;

import java.time.Instant;
import java.util.UUID;

public record FileResponse(
        UUID id,
        String originalFileName,
        long fileSize,
        String contentType,
        Instant uploadedAt,
        String s3ObjectKey
) {
    public static FileResponse from(FileMetadata metadata) {
        return new FileResponse(
                metadata.getId(),
                metadata.getOriginalFileName(),
                metadata.getFileSize(),
                metadata.getContentType(),
                metadata.getUploadedAt(),
                metadata.getS3ObjectKey()
        );
    }
}
