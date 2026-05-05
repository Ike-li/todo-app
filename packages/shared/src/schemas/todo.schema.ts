import { z } from "zod";

export const PriorityEnum = z.enum(["NONE", "LOW", "MEDIUM", "HIGH", "URGENT"]);

export const TodoCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(5000).optional(),
  priority: PriorityEnum.optional(),
  dueDate: z.string().optional(),
  categoryId: z.string().uuid().optional().nullable(),
  tags: z.array(z.string()).optional(),
  parentId: z.string().uuid().optional().nullable(),
});

export const TodoUpdateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).nullable().optional(),
  completed: z.boolean().optional(),
  priority: PriorityEnum.optional(),
  dueDate: z.string().optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  tags: z.array(z.string()).optional(),
  parentId: z.string().uuid().optional().nullable(),
});

export const TodoResponseSchema: z.ZodObject<any> = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  completed: z.boolean(),
  priority: PriorityEnum,
  dueDate: z.string().datetime().nullable(),
  position: z.number(),
  userId: z.string(),
  parentId: z.string().uuid().nullable().optional(),
  categoryId: z.string().uuid().nullable(),
  category: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      color: z.string().nullable(),
      icon: z.string().nullable(),
    })
    .nullable()
    .optional(),
  tags: z
    .array(
      z.object({
        tag: z.object({
          id: z.string().uuid(),
          name: z.string(),
        }),
      })
    )
    .optional(),
  subTasks: z.lazy(() => TodoResponseSchema.array()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type TodoCreate = z.infer<typeof TodoCreateSchema>;
export type TodoUpdate = z.infer<typeof TodoUpdateSchema>;
export type TodoResponse = z.infer<typeof TodoResponseSchema>;
