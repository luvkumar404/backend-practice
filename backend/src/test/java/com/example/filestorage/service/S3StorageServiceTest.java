package com.example.filestorage.service;

import com.example.filestorage.exception.FileStorageException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.ByteArrayInputStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class S3StorageServiceTest {
    @Mock
    private S3Client s3Client;
    private S3StorageService service;

    @BeforeEach
    void setUp() {
        service = new S3StorageService(s3Client);
        ReflectionTestUtils.setField(service, "bucketName", "test-bucket");
    }

    @Test
    void uploadsToConfiguredBucket() {
        service.upload("uploads/user/file.txt",
                new ByteArrayInputStream("hello".getBytes()), 5, "text/plain");

        ArgumentCaptor<PutObjectRequest> request =
                ArgumentCaptor.forClass(PutObjectRequest.class);
        verify(s3Client).putObject(request.capture(), any(RequestBody.class));
        assertThat(request.getValue().bucket()).isEqualTo("test-bucket");
        assertThat(request.getValue().key()).isEqualTo("uploads/user/file.txt");
        assertThat(request.getValue().contentType()).isEqualTo("text/plain");
    }

    @Test
    void wrapsS3DeleteFailure() {
        doThrow(S3Exception.builder().message("failure").build())
                .when(s3Client).deleteObject(any(DeleteObjectRequest.class));

        assertThatThrownBy(() -> service.delete("key"))
                .isInstanceOf(FileStorageException.class)
                .hasMessage("Failed to delete file from S3");
    }
}
