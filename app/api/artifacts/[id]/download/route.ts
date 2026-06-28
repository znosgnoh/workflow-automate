import { ArtifactType } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getArtifactMimeType, getStorageMode } from "@/lib/storage";
import { readLocalArtifact } from "@/lib/storage/local";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  if (getStorageMode() !== "local") {
    return NextResponse.json(
      { error: "Local artifact downloads are disabled in blob storage mode." },
      { status: 404 },
    );
  }

  const { id } = await context.params;
  const artifact = await prisma.artifact.findUnique({
    where: { id },
    include: { run: true },
  });

  if (!artifact) {
    return NextResponse.json({ error: "Artifact not found" }, { status: 404 });
  }

  if (!artifact.url.startsWith("/api/artifacts/")) {
    return NextResponse.redirect(artifact.url);
  }

  try {
    const buffer = await readLocalArtifact(artifact.runId, artifact.filename);
    const artifactType =
      artifact.type === ArtifactType.xlsx ? "xlsx" : "pptx";

    return new NextResponse(Uint8Array.from(buffer), {
      headers: {
        "Content-Type": getArtifactMimeType(artifactType),
        "Content-Disposition": `attachment; filename="${artifact.filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Artifact file is missing on disk." },
      { status: 404 },
    );
  }
}
