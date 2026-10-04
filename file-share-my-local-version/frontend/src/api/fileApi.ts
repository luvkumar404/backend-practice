import api from "./axios";
import type { AxiosProgressEvent } from "axios";
import type { StoredFile } from "../types";

export async function fetchFiles(): Promise<StoredFile[]> {
  const response = await api.get("/files");
  return response.data;
}

export async function fetchFile(fileId: string): Promise<StoredFile> {
  const response = await api.get(`/files/${fileId}`);
  return response.data;
}

export async function uploadFile(
  file: File,
  onUploadProgress?: (event: AxiosProgressEvent) => void,
): Promise<StoredFile> {
  const formData = new FormData();
  formData.append("upload", file);

  const response = await api.post("/files", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
  return response.data;
}

export async function deleteFile(fileId: string): Promise<void> {
  await api.delete(`/files/${fileId}`);
}
