import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { deleteFile, fetchFile, fetchFiles, uploadFile } from "../api/fileApi";
import type { AxiosProgressEvent } from "axios";

export function useFiles() {
  return useQuery({
    queryKey: ["files"],
    queryFn: fetchFiles,
  });
}

export function useFile(fileId?: string) {
  return useQuery({
    queryKey: ["file", fileId],
    queryFn: () => fetchFile(fileId!),
    enabled: Boolean(fileId),
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      onUploadProgress,
    }: {
      file: File;
      onUploadProgress?: (event: AxiosProgressEvent) => void;
    }) => uploadFile(file, onUploadProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });
}
