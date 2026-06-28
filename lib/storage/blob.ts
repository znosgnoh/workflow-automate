import { put } from "@vercel/blob";
import { getArtifactMimeType } from "@/lib/storage/config";

type UploadBlobInput = {
  pathname: string;
  buffer: Buffer;
  type: "xlsx" | "pptx";
};

export async function uploadArtifactToBlob({
  pathname,
  buffer,
  type,
}: UploadBlobInput): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();

  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN is required for blob storage.");
  }

  const blob = await put(pathname, buffer, {
    access: "public",
    token,
    contentType: getArtifactMimeType(type),
    addRandomSuffix: false,
  });

  return blob.url;
}
