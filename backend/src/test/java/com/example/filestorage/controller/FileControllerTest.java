package com.example.filestorage.controller;

import com.example.filestorage.dto.FileResponse;
import com.example.filestorage.exception.FileNotFoundException;
import com.example.filestorage.exception.GlobalExceptionHandler;
import com.example.filestorage.service.FileService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(FileController.class)
@Import(GlobalExceptionHandler.class)
class FileControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private FileService fileService;

    @Test
    void uploadsFile() throws Exception {
        UUID id = UUID.randomUUID();
        FileResponse response = response(id);
        when(fileService.upload(any(), eq("alice"))).thenReturn(response);
        MockMultipartFile file = new MockMultipartFile(
                "file", "notes.txt", "text/plain", "hello".getBytes());

        mockMvc.perform(multipart("/api/files/upload")
                        .file(file)
                        .param("userId", "alice"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.originalFileName").value("notes.txt"));
    }

    @Test
    void listsFilesWithPagination() throws Exception {
        when(fileService.list(any())).thenReturn(new PageImpl<>(List.of(response(UUID.randomUUID()))));

        mockMvc.perform(get("/api/files").param("page", "1").param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].originalFileName").value("notes.txt"));
        verify(fileService).list(any());
    }

    @Test
    void returnsStructuredNotFoundError() throws Exception {
        UUID id = UUID.randomUUID();
        when(fileService.get(id)).thenThrow(new FileNotFoundException(id));

        mockMvc.perform(get("/api/files/{id}", id))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.path").value("/api/files/" + id));
    }

    private FileResponse response(UUID id) {
        return new FileResponse(id, "notes.txt", 5, "text/plain",
                Instant.parse("2026-07-25T12:00:00Z"),
                "uploads/alice/" + id + "-notes.txt");
    }
}
