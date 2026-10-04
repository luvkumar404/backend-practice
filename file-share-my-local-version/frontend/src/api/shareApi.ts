import api from "./axios";
import type { Share, ShareInput, SharedDownload } from "../types";

export async function createShareLink(fileId: string, data: ShareInput): Promise<Share> {
  const response = await api.post(`/shares/files/${fileId}`, data);
  return response.data;
}

export async function revokeShareLink(shareId: string): Promise<Share> {
  const response = await api.post(`/shares/${shareId}/revoke`);
  return response.data;
}

export async function downloadSharedFile(
  token: string,
  password: string | null,
): Promise<SharedDownload> {
  const response = await api.post(`/shares/${token}/download`, { password });
  return response.data;
}
