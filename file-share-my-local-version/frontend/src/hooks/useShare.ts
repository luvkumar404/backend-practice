import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createShareLink, downloadSharedFile, revokeShareLink } from "../api/shareApi";
import type { ShareInput } from "../types";

export function useCreateShareLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fileId, data }: { fileId: string; data: ShareInput }) =>
      createShareLink(fileId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });
}

export function useRevokeShareLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeShareLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });
}

export function useDownloadSharedFile() {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string | null }) =>
      downloadSharedFile(token, password),
  });
}
