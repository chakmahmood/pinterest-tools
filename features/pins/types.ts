import type { Prisma } from "@prisma/client";

// Pin with related Post
export type PinWithPost = Prisma.PinGetPayload<{
  include: {
    post: true;
  };
}>;

// Create Pin
export type CreatePinInput = {
  postId: string;

  title: string;

  description: string;

  overlayText?: string | null;

  imagePrompt: string;

  imageUrl?: string | null;

  board?: string | null;

  keywords: string[];
};

// Update Pin
export type UpdatePinInput = {
  title?: string;

  description?: string;

  overlayText?: string | null;

  imagePrompt?: string;

  imageUrl?: string | null;

  board?: string | null;

  keywords?: string[];

  status?: "DRAFT" | "READY" | "EXPORTED" | "ARCHIVED";
};

// Generate AI Pin Result
export type GeneratePinResult = {
  title: string;

  description: string;

  overlayText: string;

  imagePrompt: string;

  keywords: string[];

  board: string;
};

// Generate Pins Input
export type GeneratePinsInput = {
  postId: string;

  title: string;

  mainKeyword?: string | null;

  annotationKeywords: string[];
};
