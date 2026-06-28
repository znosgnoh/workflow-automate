import { CostcoApiClient } from "@/lib/adapters/costco/client";
import { MockCostcoClient } from "@/lib/adapters/costco/mock";
import type { CostcoProductSource } from "@/lib/adapters/costco/types";

export function getCostcoProductSource(): CostcoProductSource {
  const useMock = process.env.COSTCO_USE_MOCK === "true";

  if (useMock) {
    return new MockCostcoClient();
  }

  return new CostcoApiClient();
}

export type { CostcoProductSource, CostcoRawProduct } from "@/lib/adapters/costco/types";
