import { prisma } from "@/lib/prisma";

import type { CreatePinInput, UpdatePinInput } from "../types";

// Get all pins
export async function getPins(postId?: string) {
  return prisma.pin.findMany({
    where: postId
      ? {
          postId,
        }
      : undefined,

    include: {
      post: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

// Get single pin
export async function getPinById(id: string) {
  return prisma.pin.findUnique({
    where: {
      id,
    },

    include: {
      post: true,
    },
  });
}

// Create single pin
export async function createPin(data: CreatePinInput) {
  return prisma.pin.create({
    data: {
      postId: data.postId,

      title: data.title,

      description: data.description,

      overlayText: data.overlayText ?? null,

      imagePrompt: data.imagePrompt,

      imageUrl: data.imageUrl ?? null,

      board: data.board ?? null,

      keywords: data.keywords,
    },
  });
}

// Create multiple pins
export async function createManyPins(data: CreatePinInput[]) {
  return prisma.pin.createMany({
    data: data.map((pin) => ({
      postId: pin.postId,

      title: pin.title,

      description: pin.description,

      overlayText: pin.overlayText ?? null,

      imagePrompt: pin.imagePrompt,

      imageUrl: pin.imageUrl ?? null,

      board: pin.board ?? null,

      keywords: pin.keywords,
    })),
  });
}

// Update pin
export async function updatePin(id: string, data: UpdatePinInput) {
  return prisma.pin.update({
    where: {
      id,
    },

    data: {
      title: data.title,

      description: data.description,

      overlayText: data.overlayText,

      imagePrompt: data.imagePrompt,

      imageUrl: data.imageUrl,

      board: data.board,

      keywords: data.keywords,

      status: data.status,
    },
  });
}

// Delete single pin
export async function deletePin(id: string) {
  return prisma.pin.delete({
    where: {
      id,
    },
  });
}

// Delete all pins from post
export async function deletePinsByPostId(postId: string) {
  return prisma.pin.deleteMany({
    where: {
      postId,
    },
  });
}
