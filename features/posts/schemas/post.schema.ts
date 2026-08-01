import { z } from "zod";

export const postSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "URL is required")
    .url("Please enter a valid URL"),

  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(255, "Title is too long"),

  mainKeyword: z.string().trim().optional(),

  annotationKeywords: z.string().trim(),
});

export type PostFormValues = z.infer<typeof postSchema>;
