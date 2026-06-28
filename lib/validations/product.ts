import { z } from "zod";

export const canonicalProductSchema = z.object({
  productName: z.string().min(1),
  originalPrice: z.number().nullable(),
  promotionalPrice: z.number().nullable(),
  manufacturer: z.string().nullable(),
  expiryDate: z.coerce.date().nullable(),
  sku: z.string().nullable(),
  category: z.string().nullable(),
});

export type CanonicalProduct = z.infer<typeof canonicalProductSchema>;
