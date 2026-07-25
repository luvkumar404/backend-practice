package com.example.filestorage.dto;

import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;

public record FileDownload(
        FileResponse metadata,
        ResponseInputStream<GetObjectResponse> content
) {
}
