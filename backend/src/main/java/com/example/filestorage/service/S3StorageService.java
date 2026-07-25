package com.example.filestorage.service;

import com.example.filestorage.exception.FileStorageException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.InputStream;

@Service
@RequiredArgsConstructor
public class S3StorageService {
    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    public String bucketName() {
        if (bucketName == null || bucketName.isBlank()) {
            throw new FileStorageException("AWS S3 bucket name is not configured");
        }
        return bucketName;
    }

    public void upload(String objectKey, InputStream inputStream, long size, String contentType) {
        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucketName())
                    .key(objectKey)
                    .contentType(contentType)
                    .contentLength(size)
                    .build();
            s3Client.putObject(request, RequestBody.fromInputStream(inputStream, size));
        } catch (S3Exception e) {
            throw new FileStorageException("Failed to upload file to S3", e);
        }
    }

    public ResponseInputStream<GetObjectResponse> download(String objectKey) {
        try {
            return s3Client.getObject(GetObjectRequest.builder()
                    .bucket(bucketName())
                    .key(objectKey)
                    .build());
        } catch (S3Exception e) {
            throw new FileStorageException("Failed to download file from S3", e);
        }
    }

    public void delete(String objectKey) {
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucketName())
                    .key(objectKey)
                    .build());
        } catch (S3Exception e) {
            throw new FileStorageException("Failed to delete file from S3", e);
        }
    }
}
