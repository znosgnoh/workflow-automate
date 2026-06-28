import { z } from "zod";

export const createCostcoRunSchema = z.object({
  searchTerm: z.string().trim().min(1, "Search term is required").max(200),
});

export type CreateCostcoRunInput = z.infer<typeof createCostcoRunSchema>;
