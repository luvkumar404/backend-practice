package com.example.filestorage.service;

import com.example.filestorage.dto.FileDownload;
import com.example.filestorage.dto.FileResponse;
import com.example.filestorage.entity.FileMetadata;
import com.example.filestorage.exception.FileNotFoundException;
import com.example.filestorage.exception.FileStorageException;
import com.example.filestorage.exception.FileValidationException;
import com.example.filestorage.repository.FileMetadataRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.Arrays;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileService {
    private final FileMetadataRepository repository;
    private final S3StorageService storageService;

    @Value("${file-storage.max-file-size-bytes}")
    private long maxFileSize;

    @Value("${file-storage.allowed-content-types}")
    private String allowedContentTypes;

    @Transactional
    public FileResponse upload(MultipartFile file, String userId) {
        validate(file);
        String safeName = sanitizeFilename(file.getOriginalFilename());
        String safeUserId = sanitizeUserId(userId);
        UUID id = UUID.randomUUID();
        String storedName = id + "-" + safeName;
        String objectKey = "uploads/" + safeUserId + "/" + storedName;
        String contentType = normalizedContentType(file.getContentType());

        try {
            storageService.upload(objectKey, file.getInputStream(), file.getSize(), contentType);
        } catch (IOException e) {
            throw new FileStorageException("Failed to read uploaded file", e);
        }

        FileMetadata metadata = FileMetadata.builder()
                .id(id)
                .originalFileName(safeName)
                .storedFileName(storedName)
                .s3ObjectKey(objectKey)
                .contentType(contentType)
                .fileSize(file.getSize())
                .bucketName(storageService.bucketName())
                .uploadedAt(Instant.now())
                .build();
        try {
            FileResponse response = FileResponse.from(repository.save(metadata));
            log.info("Uploaded file id={} key={} size={}", id, objectKey, file.getSize());
            return response;
        } catch (DataAccessException e) {
            try {
                storageService.delete(objectKey);
            } catch (FileStorageException cleanupFailure) {
                e.addSuppressed(cleanupFailure);
            }
            throw new FileStorageException("Failed to save file metadata", e);
        }
    }

    @Transactional(readOnly = true)
    public Page<FileResponse> list(Pageable pageable) {
        return repository.findAll(pageable).map(FileResponse::from);
    }

    @Transactional(readOnly = true)
    public FileResponse get(UUID id) {
        return FileResponse.from(find(id));
    }

    @Transactional(readOnly = true)
    public FileDownload download(UUID id) {
        FileMetadata metadata = find(id);
        log.info("Downloading file id={} key={}", id, metadata.getS3ObjectKey());
        return new FileDownload(
                FileResponse.from(metadata),
                storageService.download(metadata.getS3ObjectKey())
        );
    }

    @Transactional
    public void delete(UUID id) {
        FileMetadata metadata = find(id);
        storageService.delete(metadata.getS3ObjectKey());
        try {
            repository.delete(metadata);
            repository.flush();
            log.info("Deleted file id={} key={}", id, metadata.getS3ObjectKey());
        } catch (DataAccessException e) {
            throw new FileStorageException(
                    "S3 object was deleted, but deleting its database metadata failed", e);
        }
    }

    private FileMetadata find(UUID id) {
        return repository.findById(id).orElseThrow(() -> new FileNotFoundException(id));
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new FileValidationException("File must not be empty");
        }
        if (file.getSize() > maxFileSize) {
            throw new FileValidationException("File exceeds the configured maximum size");
        }
        String contentType = normalizedContentType(file.getContentType());
        if (!allowedTypes().contains(contentType)) {
            throw new FileValidationException("Unsupported file type: " + contentType);
        }
    }

    private Set<String> allowedTypes() {
        return Arrays.stream(allowedContentTypes.split(","))
                .map(String::trim)
                .map(value -> value.toLowerCase(Locale.ROOT))
                .collect(Collectors.toUnmodifiableSet());
    }

    private String normalizedContentType(String contentType) {
        return contentType == null ? "application/octet-stream"
                : contentType.toLowerCase(Locale.ROOT).split(";", 2)[0].trim();
    }

    private String sanitizeFilename(String originalName) {
        if (originalName == null || originalName.isBlank()) {
            throw new FileValidationException("Original filename is required");
        }
        String baseName = Paths.get(originalName.replace('\\', '/')).getFileName().toString();
        String sanitized = baseName.replaceAll("[\\p{Cntrl}/\\\\]", "_")
                .replaceAll("[^\\p{L}\\p{N}._() -]", "_")
                .trim();
        if (sanitized.isBlank() || sanitized.equals(".") || sanitized.equals("..")) {
            throw new FileValidationException("Invalid filename");
        }
        return sanitized.length() > 255 ? sanitized.substring(sanitized.length() - 255) : sanitized;
    }

    private String sanitizeUserId(String userId) {
        String value = userId == null || userId.isBlank() ? "anonymous" : userId.trim();
        if (!value.matches("[A-Za-z0-9_-]{1,100}")) {
            throw new FileValidationException("userId may contain only letters, numbers, '-' and '_'");
        }
        return value;
    }
}
