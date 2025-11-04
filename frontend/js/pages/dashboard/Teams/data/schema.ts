import { z } from "zod";

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
// export const taskSchema = z.object({
//   id: z.string(),
//   title: z.string(),
//   status: z.string(),
//   label: z.string(),
//   priority: z.string(),
// })

// export type Task = z.infer<typeof taskSchema>

export const userSchema = z.object({
  id: z.uuid(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.email(),
  role: z.string(),
  phone: z.string().optional().nullable(),
});

export type User = z.infer<typeof userSchema>;
