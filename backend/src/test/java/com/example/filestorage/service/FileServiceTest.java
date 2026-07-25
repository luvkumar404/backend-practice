package com.example.filestorage.service;

import com.example.filestorage.dto.FileResponse;
import com.example.filestorage.entity.FileMetadata;
import com.example.filestorage.exception.FileNotFoundException;
import com.example.filestorage.exception.FileValidationException;
import com.example.filestorage.repository.FileMetadataRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FileServiceTest {
    @Mock
    private FileMetadataRepository repository;
    @Mock
    private S3StorageService storageService;
    @InjectMocks
    private FileService fileService;

    @BeforeEach
    void configure() {
        ReflectionTestUtils.setField(fileService, "maxFileSize", 1_000_000L);
        ReflectionTestUtils.setField(fileService, "allowedContentTypes",
                "application/pdf,image/png,image/jpeg,text/plain,application/zip");
    }

    @Test
    void uploadsValidFileWithSanitizedUniqueKey() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "../report.pdf", "application/pdf", "pdf".getBytes());
        when(storageService.bucketName()).thenReturn("bucket");
        when(repository.save(any(FileMetadata.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        FileResponse response = fileService.upload(file, "user_42");

        ArgumentCaptor<String> key = ArgumentCaptor.forClass(String.class);
        verify(storageService).upload(key.capture(), any(), eq(3L), eq("application/pdf"));
        assertThat(key.getValue()).matches("uploads/user_42/[0-9a-f-]+-report\\.pdf");
        assertThat(response.originalFileName()).isEqualTo("report.pdf");
        assertThat(response.s3ObjectKey()).isEqualTo(key.getValue());
    }

    @Test
    void rejectsEmptyFile() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "empty.txt", "text/plain", new byte[0]);

        assertThatThrownBy(() -> fileService.upload(file, "user"))
                .isInstanceOf(FileValidationException.class)
                .hasMessage("File must not be empty");
        verify(storageService, never()).upload(any(), any(), any(Long.class), any());
    }

    @Test
    void rejectsUnsupportedType() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "script.js", "application/javascript", "x".getBytes());

        assertThatThrownBy(() -> fileService.upload(file, "user"))
                .isInstanceOf(FileValidationException.class)
                .hasMessageContaining("Unsupported file type");
    }

    @Test
    void getsExistingMetadata() {
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.of(metadata(id)));

        assertThat(fileService.get(id).id()).isEqualTo(id);
    }

    @Test
    void throwsWhenMetadataDoesNotExist() {
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> fileService.get(id))
                .isInstanceOf(FileNotFoundException.class);
    }

    private FileMetadata metadata(UUID id) {
        return FileMetadata.builder()
                .id(id)
                .originalFileName("report.pdf")
                .storedFileName(id + "-report.pdf")
                .s3ObjectKey("uploads/user/" + id + "-report.pdf")
                .contentType("application/pdf")
                .fileSize(10)
                .bucketName("bucket")
                .uploadedAt(Instant.now())
                .build();
    }
}
