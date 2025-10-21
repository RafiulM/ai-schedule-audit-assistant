import { z } from "zod";

export const eventSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(1000, "Description too long").optional(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  category: z.enum([
    "work",
    "personal",
    "health",
    "learning",
    "social",
    "entertainment",
    "travel",
    "general"
  ]).default("general"),
  userId: z.string().min(1, "User ID is required"),
}).refine(
  (data) => data.endTime > data.startTime,
  {
    message: "End time must be after start time",
    path: ["endTime"],
  }
);

export const chatMessageSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().min(1, "User ID is required"),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1, "Content is required").max(10000, "Message too long"),
  timestamp: z.coerce.date().optional(),
  metadata: z.record(z.any()).optional(),
});

export const createEventSchema = eventSchema.omit({ id: true, userId: true });
export const updateEventSchema = eventSchema.partial().omit({ id: true, userId: true });

export const createChatMessageSchema = chatMessageSchema.omit({ id: true, timestamp: true });

// AI Tool schemas for function calling
export const aiCreateEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startTime: z.string().datetime(), // ISO string
  endTime: z.string().datetime(), // ISO string
  category: z.enum([
    "work",
    "personal",
    "health",
    "learning",
    "social",
    "entertainment",
    "travel",
    "general"
  ]).default("general"),
});

export const aiUpdateEventSchema = z.object({
  id: z.string().uuid(),
  title: z.string().optional(),
  description: z.string().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  category: z.enum([
    "work",
    "personal",
    "health",
    "learning",
    "social",
    "entertainment",
    "travel",
    "general"
  ]).optional(),
});

export const aiDeleteEventSchema = z.object({
  id: z.string().uuid(),
});

// Types
export type EventInput = z.infer<typeof eventSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type CreateChatMessageInput = z.infer<typeof createChatMessageSchema>;
export type AiCreateEventInput = z.infer<typeof aiCreateEventSchema>;
export type AiUpdateEventInput = z.infer<typeof aiUpdateEventSchema>;
export type AiDeleteEventInput = z.infer<typeof aiDeleteEventSchema>;