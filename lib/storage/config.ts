export type StorageMode = "blob" | "local";

export function getStorageMode(): StorageMode {
  const configured = process.env.STORAGE_MODE?.trim().toLowerCase();

  if (configured === "local") {
    return "local";
  }

  if (configured === "blob") {
    return process.env.BLOB_READ_WRITE_TOKEN?.trim() ? "blob" : "local";
  }

  return process.env.BLOB_READ_WRITE_TOKEN?.trim() ? "blob" : "local";
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
