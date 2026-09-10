import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Image upload endpoint for Pins
 * Ready for future implementation of drag & drop image upload
 * Currently prepared with proper structure for production use
 */

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

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

    // TODO: Implement image upload
    // Steps for future implementation:
    // 1. Parse FormData from request
    // 2. Validate file type (image only)
    // 3. Validate file size (max 5MB for Pinterest)
    // 4. Upload to storage service (S3, Cloudinary, etc.)
    // 5. Get image URL
    // 6. Update pin.imageUrl in database
    // 7. Return updated pin

    return NextResponse.json(
      {
        success: false,
        message: "Image upload feature is not yet implemented.",
      },
      {
        status: 501,
      },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload image.",
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
