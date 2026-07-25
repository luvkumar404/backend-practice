package com.example.filestorage.controller;

import com.example.filestorage.dto.ApiResponse;
import com.example.filestorage.dto.FileDownload;
import com.example.filestorage.dto.FileResponse;
import com.example.filestorage.service.FileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Tag(name = "Files")
public class FileController {
    private final FileService fileService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a file to S3")
    public ResponseEntity<FileResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "anonymous") String userId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(fileService.upload(file, userId));
    }

    @GetMapping
    @Operation(summary = "List uploaded files")
    public ResponseEntity<Page<FileResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        int safeSize = Math.min(Math.max(size, 1), 100);
        int safePage = Math.max(page, 0);
        PageRequest request = PageRequest.of(
                safePage, safeSize, Sort.by(Sort.Direction.DESC, "uploadedAt"));
        return ResponseEntity.ok(fileService.list(request));
    }

    @GetMapping("/{fileId}")
    @Operation(summary = "Get file metadata")
    public ResponseEntity<FileResponse> get(@PathVariable UUID fileId) {
        return ResponseEntity.ok(fileService.get(fileId));
    }

    @GetMapping("/{fileId}/download")
    @Operation(summary = "Stream a file from S3")
    public ResponseEntity<InputStreamResource> download(@PathVariable UUID fileId) {
        FileDownload download = fileService.download(fileId);
        MediaType mediaType;
        try {
            mediaType = MediaType.parseMediaType(download.metadata().contentType());
        } catch (IllegalArgumentException ignored) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }
        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(download.metadata().originalFileName(), StandardCharsets.UTF_8)
                .build();
        return ResponseEntity.ok()
                .contentType(mediaType)
                .contentLength(download.metadata().fileSize())
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .body(new InputStreamResource(download.content()));
    }

    @DeleteMapping("/{fileId}")
    @Operation(summary = "Delete a file and its metadata")
    public ResponseEntity<ApiResponse> delete(@PathVariable UUID fileId) {
        fileService.delete(fileId);
        return ResponseEntity.ok(ApiResponse.of("File deleted successfully"));
    }
}
