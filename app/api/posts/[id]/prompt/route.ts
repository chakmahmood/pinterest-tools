import { NextResponse } from "next/server";

import { getPostById } from "@/features/posts";
import { generateAiPrompt } from "@/features/posts/lib/generate-ai-prompt";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const post = await getPostById(id);

    if (!post) {
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

    const prompt = generateAiPrompt(post);

    return NextResponse.json({
      success: true,
      prompt,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate AI prompt.",
      },
      {
        status: 500,
      },
    );
  }
}
