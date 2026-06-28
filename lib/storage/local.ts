import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export function getRunOutputDirectory(runId: string): string {
  return path.join(/* turbopackIgnore: true */ process.cwd(), "output", runId);
}

export function getLocalArtifactPath(runId: string, filename: string): string {
  return path.join(getRunOutputDirectory(runId), filename);
}

export async function writeLocalArtifact(
  runId: string,
  buffer: Buffer,
  filename: string,
): Promise<string> {
  const directory = getRunOutputDirectory(runId);
  const filePath = path.join(directory, filename);
  await mkdir(directory, { recursive: true });
  await writeFile(filePath, buffer);
  return filePath;
}

export async function readLocalArtifact(
  runId: string,
  filename: string,
): Promise<Buffer> {
  return readFile(getLocalArtifactPath(runId, filename));
}
