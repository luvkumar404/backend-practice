export interface User {
  id?: string;
  email: string;
  name?: string;
}

export interface StoredFile {
  id: string;
  original_filename: string;
  stored_filename: string;
  extension: string;
  size_bytes: number;
  content_type?: string | null;
  created_at: string;
}

export interface Share {
  id: string;
  token: string;
  is_revoked: boolean;
  expires_at?: string;
}

export interface ShareInput {
  expires_at: string;
  password: string | null;
}

export interface SharedDownload {
  file_name: string;
  download_url: string;
}

export interface AuthResponse {
  access_token: string;
}
