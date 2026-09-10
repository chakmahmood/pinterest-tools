import { NextResponse } from "next/server";

import {
  createPin,
  getPins,
} from "@/features/pins/repositories/pin.repository";
import { getPosts } from "@/features/posts/repositories/post.repository";

import { pinSchema } from "@/features/pins/schemas/pin.schema";

export async function GET() {
  try {
    const pins = await getPins();

    return NextResponse.json(pins);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load pins.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate required fields
    const baseSchema = pinSchema.pick({
      title: true,
      description: true,
      imagePrompt: true,
    });

    const baseValidation = baseSchema.safeParse(body);

    if (!baseValidation.success) {
      return NextResponse.json(
        {
          success: false,
          errors: baseValidation.error.flatten().fieldErrors,
        },
        {
          status: 400,
        },
      );
    }

    // Validate postId
    const postId = body.postId;

    if (!postId || typeof postId !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Post ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    // Check whether post exists
    const posts = await getPosts();
    const postExists = posts.some((post) => post.id === postId);

    if (!postExists) {
      return NextResponse.json(
        {
          success: false,
          message: "Post not found.",
        },
        {
          status: 404,
        },
      );
    }

    // Parse keywords
    const keywords = Array.isArray(body.keywords) ? body.keywords : [];

    // Create pin
    const pin = await createPin({
      postId,
      title: body.title,
      description: body.description,
      overlayText: body.overlayText || null,
      imagePrompt: body.imagePrompt,
      imageUrl: body.imageUrl || null,
      board: body.board || null,
      keywords,
    });

    return NextResponse.json(
      {
        success: true,
        data: pin,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create pin.",
      },
      {
        status: 500,
      },
    );
  }
}
