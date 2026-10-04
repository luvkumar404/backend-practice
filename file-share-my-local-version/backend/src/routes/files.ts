import { Hono } from "hono";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";
import { User } from "@prisma/client";
import { malwareScanner } from "../services/malware";
import { uploadFileToCloudinary, deleteFileFromCloudinary } from "../services/cloudinary";
import { validateAndReadUpload, buildCloudinaryPublicId, getCloudinaryResourceType } from "../services/files";

export const filesRouter = new Hono<{ Variables: { user: User } }>();

filesRouter.use("*", authMiddleware);

filesRouter.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.parseBody();
  const upload = body["upload"];

  if (!(upload instanceof File)) {
    return c.json({ detail: "Invalid file upload." }, 400);
  }

  const { fileBytes, extension, storedFilename } = await validateAndReadUpload(upload);

  const scanResult = await malwareScanner.scanBytes(fileBytes);
  if (!scanResult.is_clean) {
    return c.json({ detail: scanResult.message }, 400);
  }

  const publicId = buildCloudinaryPublicId(user.id, storedFilename);
  const resourceType = getCloudinaryResourceType(extension);
  const uploadResult = await uploadFileToCloudinary(fileBytes, publicId, resourceType);

  const fileRecord = await prisma.$transaction(async (tx) => {
    const record = await tx.file.create({
      data: {
        owner_id: user.id,
        original_filename: upload.name || "uploaded-file",
        stored_filename: storedFilename,
        extension,
        content_type: upload.type || null,
        size_bytes: fileBytes.length,
        cloudinary_public_id: uploadResult.public_id,
        cloudinary_resource_type: uploadResult.resource_type,
      },
    });

    await tx.accessLog.create({
      data: {
        user_id: user.id,
        file_id: record.id,
        action: "upload",
        ip_address: c.req.header("x-forwarded-for") || null,
      },
    });

    return record;
  });

  return c.json(fileRecord, 201);
});

filesRouter.get("/", async (c) => {
  const user = c.get("user");
  const files = await prisma.file.findMany({
    where: { owner_id: user.id },
  });
  return c.json(files);
});

filesRouter.get("/:file_id", async (c) => {
  const user = c.get("user");
  const fileId = parseInt(c.req.param("file_id"), 10);

  if (isNaN(fileId)) {
    return c.json({ detail: "Invalid file ID." }, 400);
  }

  const fileRecord = await prisma.file.findUnique({ where: { id: fileId } });
  if (!fileRecord || fileRecord.owner_id !== user.id) {
    return c.json({ detail: "File not found." }, 404);
  }

  return c.json(fileRecord);
});

filesRouter.delete("/:file_id", async (c) => {
  const user = c.get("user");
  const fileId = parseInt(c.req.param("file_id"), 10);

  if (isNaN(fileId)) {
    return c.json({ detail: "Invalid file ID." }, 400);
  }

  const fileRecord = await prisma.file.findUnique({ where: { id: fileId } });
  if (!fileRecord || fileRecord.owner_id !== user.id) {
    return c.json({ detail: "File not found." }, 404);
  }

  await deleteFileFromCloudinary(fileRecord.cloudinary_public_id, fileRecord.cloudinary_resource_type);

  await prisma.$transaction(async (tx) => {
    await tx.accessLog.create({
      data: {
        user_id: user.id,
        file_id: fileRecord.id,
        action: "delete",
        ip_address: c.req.header("x-forwarded-for") || null,
      },
    });
    await tx.file.delete({ where: { id: fileRecord.id } });
  });

  return new Response(null, { status: 204 });
});
