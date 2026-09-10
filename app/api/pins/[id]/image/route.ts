import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "No file provided.",
        },
        {
          status: 400,
        },
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        {
          success: false,
          message: "Only image files are allowed.",
        },
        {
          status: 400,
        },
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          message: "File size must be less than 5MB.",
        },
        {
          status: 400,
        },
      );
    }

    // Verify pin exists
    const pin = await prisma.pin.findUnique({
      where: { id },
    });

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

    // Convert file to base64 for storage
    // In production, you would upload to S3, Cloudinary, or similar service
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Update pin with image URL
    const updatedPin = await prisma.pin.update({
      where: { id },
      data: {
        imageUrl: dataUrl,
      },
      include: {
        post: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Image uploaded successfully.",
        data: updatedPin,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Image upload error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to upload image.";

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
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

    const pin = await prisma.pin.findUnique({
      where: { id },
    });

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

    // Remove image URL from pin
    const updated = await prisma.pin.update({
      where: { id },
      data: {
        imageUrl: null,
      },
      include: {
        post: true,
      },
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
        message: "Failed to remove image.",
      },
      {
        status: 500,
      },
    );
  }
}
