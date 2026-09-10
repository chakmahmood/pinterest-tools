import { z } from "zod";

export const pinSchema = z.object({
  title: z.string().min(3, "Title is required"),

  description: z.string().min(10, "Description is required"),

  overlayText: z.string().optional().nullable(),

  imagePrompt: z.string().min(10, "Image prompt is required"),

  imageUrl: z.string().optional().nullable(),

  board: z.string().optional().nullable(),

  keywords: z.string().default(""),
});

export type PinFormValues = z.infer<typeof pinSchema>;
