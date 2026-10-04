import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadFileToCloudinary(
  fileBytes: Buffer,
  publicId: string,
  resourceType: "image" | "raw"
): Promise<{ public_id: string; resource_type: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: resourceType,
        overwrite: false,
        type: "authenticated",
      },
      (error, result) => {
        if (error) return reject(error);
        if (result) {
          resolve({
            public_id: result.public_id,
            resource_type: result.resource_type,
          });
        }
      }
    );
    uploadStream.end(fileBytes);
  });
}

export async function deleteFileFromCloudinary(
  publicId: string,
  resourceType: string
): Promise<void> {
  await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    type: "authenticated",
    invalidate: true,
  });
}

function removeExtensionFromPublicId(publicId: string, extension: string): string {
  const suffix = `.${extension.toLowerCase()}`;
  if (publicId.toLowerCase().endsWith(suffix)) {
    return publicId.slice(0, -suffix.length);
  }
  return publicId;
}

export function createSignedDownloadUrl(
  publicId: string,
  resourceType: string,
  extension: string,
  expiresAt: number
): string {
  const cleanPublicId = removeExtensionFromPublicId(publicId, extension);
  return cloudinary.utils.private_download_url(
    cleanPublicId,
    extension.toLowerCase(),
    {
      resource_type: resourceType,
      type: "authenticated",
      expires_at: expiresAt,
      attachment: true,
    }
  );
}
