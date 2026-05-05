import { z } from "zod";

export const TagCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
});

export const TagResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

export type TagCreate = z.infer<typeof TagCreateSchema>;
export type TagResponse = z.infer<typeof TagResponseSchema>;
