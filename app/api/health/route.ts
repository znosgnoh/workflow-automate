import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type HealthResponse = {
  ok: boolean;
  timestamp: string;
  db?: "skipped" | "connected" | "unreachable";
  error?: string;
};

export async function GET() {
  const timestamp = new Date().toISOString();
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    const body: HealthResponse = {
      ok: true,
      timestamp,
      db: "skipped",
    };
    return NextResponse.json(body);
  }

  try {
    await prisma.$queryRaw`SELECT 1`;

    const body: HealthResponse = {
      ok: true,
      timestamp,
      db: "connected",
    };
    return NextResponse.json(body);
  } catch {
    const body: HealthResponse = {
      ok: false,
      timestamp,
      db: "unreachable",
      error: "Database connection failed",
    };
    return NextResponse.json(body, { status: 503 });
  }
}
