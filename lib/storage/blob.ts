import { put } from "@vercel/blob";
import {
  assertBlobStorageAvailable,
  getArtifactMimeType,
} from "@/lib/storage/config";

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
  assertBlobStorageAvailable();

  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();

  const blob = await put(pathname, buffer, {
    access: "public",
    contentType: getArtifactMimeType(type),
    addRandomSuffix: false,
    ...(token ? { token } : {}),
  });

  return blob.url;
}
