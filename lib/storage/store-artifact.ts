import { ArtifactType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { uploadArtifactToBlob } from "@/lib/storage/blob";
import { getStorageMode } from "@/lib/storage/config";
import { writeLocalArtifact } from "@/lib/storage/local";

type StoreRunArtifactInput = {
  runId: string;
  type: ArtifactType;
  buffer: Buffer;
  filename: string;
};

export async function storeRunArtifact({
  runId,
  type,
  buffer,
  filename,
}: StoreRunArtifactInput) {
  const storageMode = getStorageMode();

  if (storageMode === "blob") {
    const pathname = `workflow-runs/${runId}/${filename}`;
    const url = await uploadArtifactToBlob({
      pathname,
      buffer,
      type: type === ArtifactType.xlsx ? "xlsx" : "pptx",
    });

    return prisma.artifact.create({
      data: {
        runId,
        type,
        filename,
        url,
      },
    });
  }

  await writeLocalArtifact(runId, buffer, filename);

  const artifact = await prisma.artifact.create({
    data: {
      runId,
      type,
      filename,
      url: "",
    },
  });

  return prisma.artifact.update({
    where: { id: artifact.id },
    data: {
      url: `/api/artifacts/${artifact.id}/download`,
    },
  });
}

/** Uploads artifacts sequentially to keep blob concurrency bounded. */
export async function storeRunArtifacts(
  runId: string,
  artifacts: Array<Omit<StoreRunArtifactInput, "runId">>,
) {
  const stored = [];

  for (const artifact of artifacts) {
    stored.push(
      await storeRunArtifact({
        runId,
        ...artifact,
      }),
    );
  }

  return stored;
}
