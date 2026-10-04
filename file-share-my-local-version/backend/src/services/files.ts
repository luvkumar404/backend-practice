import { MAX_FILE_SIZE_BYTES } from "../config/env";
import { getExtension, createSafeFilename } from "../utils/tokens";
import { HTTPException } from "hono/http-exception";

const ALLOWED_EXTENSIONS = new Set(["pdf", "docx", "txt", "png", "jpg", "jpeg"]);
const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg"]);

export async function validateAndReadUpload(upload: File): Promise<{ fileBytes: Buffer; extension: string; storedFilename: string }> {
  const originalFilename = upload.name || "uploaded-file";
  const extension = getExtension(originalFilename);
  
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw new HTTPException(400, { message: "File type is not allowed." });
  }

  const arrayBuffer = await upload.arrayBuffer();
  const fileBytes = Buffer.from(arrayBuffer);

  if (fileBytes.length > MAX_FILE_SIZE_BYTES) {
    throw new HTTPException(400, { message: `File is too large. Max size is ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB.` });
  }

  const storedFilename = createSafeFilename(extension);
  return { fileBytes, extension, storedFilename };
}

export function buildCloudinaryPublicId(userId: number, storedFilename: string): string {
  const filenameWithoutExtension = storedFilename.split(".").slice(0, -1).join(".");
  return `secure_file_sharing/users/${userId}/${filenameWithoutExtension}`;
}

export function getCloudinaryResourceType(extension: string): "image" | "raw" {
  if (IMAGE_EXTENSIONS.has(extension.toLowerCase())) {
    return "image";
  }
  return "raw";
}
