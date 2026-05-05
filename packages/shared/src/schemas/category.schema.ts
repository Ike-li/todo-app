import { z } from "zod";

export const CategoryCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color")
    .optional()
    .nullable(),
  icon: z.string().max(50).optional().nullable(),
});

export const CategoryUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color")
    .optional()
    .nullable(),
  icon: z.string().max(50).optional().nullable(),
});

export const CategoryResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  color: z.string().nullable(),
  icon: z.string().nullable(),
  userId: z.string(),
  createdAt: z.string().datetime(),
});

export type CategoryCreate = z.infer<typeof CategoryCreateSchema>;
export type CategoryUpdate = z.infer<typeof CategoryUpdateSchema>;
export type CategoryResponse = z.infer<typeof CategoryResponseSchema>;
