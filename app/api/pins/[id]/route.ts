import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { r2 } from "@/lib/r2";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
} as const;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  console.log("========================================");
  console.log("🔥 R2 IMAGE UPLOAD ROUTE CALLED");
  console.log("========================================");

  try {
    const { id } = await params;

    console.log("📌 Pin ID:", id);

    // ==============================
    // READ FORM DATA
    // ==============================

    const formData = await req.formData();
    const file = formData.get("file");

    console.log("📦 FormData received");
    console.log("📄 File exists:", file instanceof File);

    if (!(file instanceof File)) {
      console.error("❌ No valid file provided");

      return NextResponse.json(
        {
          success: false,
          message: "No file provided.",
        },
        { status: 400 },
      );
    }

    console.log("🖼️ File name:", file.name);
    console.log("📐 File size:", file.size, "bytes");
    console.log("🧾 File type:", file.type);

    // ==============================
    // VALIDATE FILE TYPE
    // ==============================

    const extension = ALLOWED_TYPES[file.type as keyof typeof ALLOWED_TYPES];

    console.log("🔍 Detected extension:", extension);

    if (!extension) {
      console.error("❌ Invalid file type:", file.type);

      return NextResponse.json(
        {
          success: false,
          message: "Only JPG, PNG, WEBP, and GIF images are allowed.",
        },
        { status: 400 },
      );
    }

    // ==============================
    // VALIDATE FILE SIZE
    // ==============================

    if (file.size > MAX_FILE_SIZE) {
      console.error("❌ File too large:", file.size);

      return NextResponse.json(
        {
          success: false,
          message: "File size must be less than 5MB.",
        },
        { status: 400 },
      );
    }

    console.log("✅ File validation passed");

    // ==============================
    // CHECK PIN
    // ==============================

    console.log("🔎 Checking Pin in database...");

    const pin = await prisma.pin.findUnique({
      where: { id },
    });

    if (!pin) {
      console.error("❌ Pin not found:", id);

      return NextResponse.json(
        {
          success: false,
          message: "Pin not found.",
        },
        { status: 404 },
      );
    }

    console.log("✅ Pin found");
    console.log("🗃️ Existing imageUrl:", pin.imageUrl);

    // ==============================
    // DELETE OLD R2 IMAGE
    // ==============================

    if (pin.imageUrl) {
      console.log("🗑️ Existing image detected");

      try {
        const publicUrl = process.env.R2_PUBLIC_URL;

        console.log("🌐 R2_PUBLIC_URL:", publicUrl);

        if (publicUrl && pin.imageUrl.startsWith(publicUrl)) {
          const oldKey = pin.imageUrl
            .replace(`${publicUrl}/`, "")
            .split("?")[0];

          console.log("🔑 Old R2 key:", oldKey);

          if (oldKey) {
            await r2.send(
              new DeleteObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME!,
                Key: oldKey,
              }),
            );

            console.log("✅ Old R2 image deleted");
          }
        } else {
          console.log(
            "ℹ️ Existing image is NOT an R2 URL. Skipping R2 deletion.",
          );
        }
      } catch (error) {
        console.error("⚠️ Failed to delete old R2 image:", error);
        console.log("➡️ Continuing with new upload...");
      }
    } else {
      console.log("ℹ️ No existing image");
    }

    // ==============================
    // CONVERT FILE TO BUFFER
    // ==============================

    console.log("🔄 Converting File to Buffer...");

    const buffer = Buffer.from(await file.arrayBuffer());

    console.log("✅ Buffer created");
    console.log("📦 Buffer size:", buffer.length, "bytes");

    // ==============================
    // GENERATE R2 KEY
    // ==============================

    const key = `pins/${crypto.randomUUID()}.${extension}`;

    console.log("🔑 New R2 key:", key);

    // ==============================
    // CHECK R2 ENVIRONMENT
    // ==============================

    console.log("========================================");
    console.log("☁️ R2 CONFIG CHECK");
    console.log("========================================");

    console.log("R2_ACCOUNT_ID exists:", Boolean(process.env.R2_ACCOUNT_ID));

    console.log(
      "R2_ACCESS_KEY_ID exists:",
      Boolean(process.env.R2_ACCESS_KEY_ID),
    );

    console.log(
      "R2_SECRET_ACCESS_KEY exists:",
      Boolean(process.env.R2_SECRET_ACCESS_KEY),
    );

    console.log("R2_BUCKET_NAME:", process.env.R2_BUCKET_NAME);

    console.log("R2_PUBLIC_URL:", process.env.R2_PUBLIC_URL);

    console.log("========================================");

    // ==============================
    // UPLOAD TO CLOUDFLARE R2
    // ==============================

    console.log("☁️ Starting R2 upload...");

    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        ContentLength: file.size,
      }),
    );

    console.log("✅ R2 upload SUCCESS");
    console.log("📁 Uploaded key:", key);

    // ==============================
    // CREATE PUBLIC URL
    // ==============================

    const publicUrl = process.env.R2_PUBLIC_URL;

    if (!publicUrl) {
      console.error("❌ R2_PUBLIC_URL is missing");

      throw new Error("R2_PUBLIC_URL is not configured.");
    }

    const imageUrl = `${publicUrl.replace(/\/$/, "")}/${key}`;

    console.log("🌐 Generated image URL:");
    console.log(imageUrl);

    // ==============================
    // SAVE ONLY URL TO NEON
    // ==============================

    console.log("💾 Saving imageUrl to Neon...");

    const updatedPin = await prisma.pin.update({
      where: { id },
      data: {
        imageUrl,
      },
      include: {
        post: true,
      },
    });

    console.log("✅ Neon database updated");
    console.log("🗃️ Saved imageUrl:", updatedPin.imageUrl);

    // ==============================
    // FINAL RESPONSE
    // ==============================

    console.log("========================================");
    console.log("🎉 IMAGE UPLOAD COMPLETE");
    console.log("========================================");

    return NextResponse.json(
      {
        success: true,
        message: "Image uploaded successfully.",
        imageUrl,
        data: updatedPin,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("========================================");
    console.error("❌ IMAGE UPLOAD ERROR");
    console.error("========================================");

    console.error(error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to upload image.";

    console.error("Error message:", errorMessage);

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      { status: 500 },
    );
  }
}

// ======================================================
// DELETE IMAGE
// ======================================================

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  console.log("========================================");
  console.log("🗑️ R2 IMAGE DELETE ROUTE CALLED");
  console.log("========================================");

  try {
    const { id } = await params;

    console.log("📌 Pin ID:", id);

    const pin = await prisma.pin.findUnique({
      where: { id },
    });

    if (!pin) {
      console.error("❌ Pin not found:", id);

      return NextResponse.json(
        {
          success: false,
          message: "Pin not found.",
        },
        { status: 404 },
      );
    }

    console.log("✅ Pin found");
    console.log("🗃️ Current imageUrl:", pin.imageUrl);

    // ==============================
    // DELETE IMAGE FROM R2
    // ==============================

    if (pin.imageUrl) {
      try {
        const publicUrl = process.env.R2_PUBLIC_URL;

        console.log("🌐 R2_PUBLIC_URL:", publicUrl);

        if (publicUrl && pin.imageUrl.startsWith(publicUrl)) {
          const key = pin.imageUrl.replace(`${publicUrl}/`, "").split("?")[0];

          console.log("🔑 R2 key to delete:", key);

          if (key) {
            await r2.send(
              new DeleteObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME!,
                Key: key,
              }),
            );

            console.log("✅ R2 image deleted");
          }
        } else {
          console.log("ℹ️ Image URL is not an R2 URL. Skipping R2 deletion.");
        }
      } catch (error) {
        console.error("⚠️ Failed to delete R2 image:", error);
      }
    } else {
      console.log("ℹ️ No image to delete");
    }

    // ==============================
    // REMOVE URL FROM NEON
    // ==============================

    console.log("💾 Removing imageUrl from Neon...");

    const updated = await prisma.pin.update({
      where: { id },
      data: {
        imageUrl: null,
      },
      include: {
        post: true,
      },
    });

    console.log("✅ imageUrl removed from Neon");

    console.log("========================================");
    console.log("🎉 IMAGE DELETE COMPLETE");
    console.log("========================================");

    return NextResponse.json({
      success: true,
      message: "Image removed successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("========================================");
    console.error("❌ IMAGE DELETE ERROR");
    console.error("========================================");

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to remove image.",
      },
      { status: 500 },
    );
  }
}
