import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import {
  getPinById,
  updatePin,
} from "@/features/pins/repositories/pin.repository";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const pin = await getPinById(id);

    if (!pin) {
      return NextResponse.json(
        {
          success: false,
          message: "Pin not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
      data: pin,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch pin.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const pin = await getPinById(id);

    if (!pin) {
      return NextResponse.json(
        {
          success: false,
          message: "Pin not found.",
        },
        {
          status: 404,
        },
      );
    }

    // Parse keywords
    const keywords = Array.isArray(body.keywords) ? body.keywords : [];

    const updated = await updatePin(id, {
      title: body.title,
      description: body.description,
      overlayText: body.overlayText,
      imagePrompt: body.imagePrompt,
      imageUrl: body.imageUrl,
      board: body.board,
      keywords,
      status: body.status,
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update pin.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const pin = await getPinById(id);

    if (!pin) {
      return NextResponse.json(
        {
          success: false,
          message: "Pin not found.",
        },
        {
          status: 404,
        },
      );
    }

    await prisma.pin.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pin deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete pin.",
      },
      {
        status: 500,
      },
    );
  }
}
