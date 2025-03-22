import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { aiInsights } from "~/server/db/schema";

export const AiInsightSchema = createSelectSchema(aiInsights);
export const AiInsightInsertSchema = createInsertSchema(aiInsights);

export const AiInsightCreateSchema = z.object({
  entityType: z.enum(["project", "board"]),
  entityId: z.string(),
  projectId: z.string().optional(),
  boardId: z.string().optional(),
  insightType: z.enum([
    "sprint_prediction",
    "bottleneck",
    "productivity",
    "risk_assessment",
    "recommendation",
  ]),
  title: z.string(),
  content: z.string(),
  metadata: z.string().optional(),
  severity: z.enum(["info", "warning", "critical"]).default("info"),
  isActive: z.boolean().default(true),
  expiresAt: z.date().optional(),
});

export const AiInsightUpdatePayloadSchema =
  AiInsightCreateSchema.partial().omit({
    entityType: true,
    entityId: true,
    projectId: true,
    boardId: true,
  });

export const AiInsightUpdateSchema = z.object({
  id: z.string(),
  data: AiInsightUpdatePayloadSchema,
});

export const AiInsightListByEntitySchema = z.object({
  entityType: z.enum(["project", "board"]),
  entityId: z.string(),
});

export const AiInsightGenerateSchema = z.object({
  entityType: z.enum(["project", "board"]),
  entityId: z.string(),
});

export const AiInsightGenerateResponseSchema = z.object({
  insights: z.array(
    z.object({
      title: z.string(),
      content: z.string(),
      severity: z.enum(["info", "warning", "critical"]),
      insightType: z.enum([
        "sprint_prediction",
        "bottleneck",
        "productivity",
        "risk_assessment",
        "recommendation",
      ]),
    }),
  ),
});

export type AiInsightCreate = z.infer<typeof AiInsightCreateSchema>;
export type AiInsightUpdatePayload = z.infer<
  typeof AiInsightUpdatePayloadSchema
>;
export type AiInsightUpdate = z.infer<typeof AiInsightUpdateSchema>;
export type AiInsightListByEntity = z.infer<typeof AiInsightListByEntitySchema>;
export type AiInsightGenerate = z.infer<typeof AiInsightGenerateSchema>;
