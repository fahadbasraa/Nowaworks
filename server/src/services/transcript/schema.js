import { z } from "zod";

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

const taskSchema = z.object({
  title: z.string(),
  description: z.string().optional().default(""),
  assigneeId: z.string(),
  deadline: dateOnly,
  estimatedHours: z.number(),
});

const projectSchema = z.object({
  name: z.string(),
  clientName: z.string(),
  description: z.string().optional().default(""),
  managerId: z.string(),
  deadline: dateOnly,
  tasks: z.array(taskSchema),
});

const unresolvedSchema = z.object({
  project: z.string(),
  task: z.string().nullable().optional().default(null),
  field: z.string(),
  reason: z.string(),
});

export const planSchema = z.object({
  projects: z.array(projectSchema),
  unresolved: z.array(unresolvedSchema),
});
