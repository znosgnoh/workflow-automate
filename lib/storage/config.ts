export type StorageMode = "blob" | "local";

function isVercelRuntime(): boolean {
  return process.env.VERCEL === "1";
}

function hasBlobCredentials(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN?.trim() ||
      process.env.VERCEL_OIDC_TOKEN?.trim() ||
      process.env.BLOB_STORE_ID?.trim(),
  );
}

export function getStorageMode(): StorageMode {
  const configured = process.env.STORAGE_MODE?.trim().toLowerCase();

  // Vercel serverless has a read-only filesystem — never write ./output
  if (isVercelRuntime()) {
    return "blob";
  }

  if (configured === "local") {
    return "local";
  }

  if (configured === "blob") {
    return hasBlobCredentials() ? "blob" : "local";
  }

  return hasBlobCredentials() ? "blob" : "local";
}

export function assertBlobStorageAvailable(): void {
  if (getStorageMode() !== "blob") {
    return;
  }

  if (isVercelRuntime() && !hasBlobCredentials()) {
    throw new Error(
      "Blob storage is not configured on Vercel. Connect a Blob store to this project in the Vercel dashboard.",
    );
  }

  if (!isVercelRuntime() && !hasBlobCredentials()) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is required when STORAGE_MODE=blob.",
    );
  }
}

export function getArtifactMimeType(type: "xlsx" | "pptx"): string {
  switch (type) {
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "pptx":
      return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    default:
      return "application/octet-stream";
  }
}
