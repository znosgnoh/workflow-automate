import { NextResponse } from "next/server";
import {
  getWorkflowRun,
  serializeWorkflowRun,
} from "@/lib/jobs/get-run";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const run = await getWorkflowRun(id);

  if (!run) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }

  return NextResponse.json(serializeWorkflowRun(run));
}
