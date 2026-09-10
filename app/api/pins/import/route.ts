import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

interface NormalizedRow {
  rowNumber: number;
  postUrl: string;
  title: string;
  description: string;
  overlayText: string;
  imagePrompt: string;
  imageUrl: string;
  board: string;
  keywords: string;
}

interface PinToCreate {
  postId: string;
  title: string;
  description: string;
  overlayText: string | null;
  imagePrompt: string;
  imageUrl: string | null;
  board: string | null;
  keywords: string[];
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "Excel file is required.",
        },
        { status: 400 },
      );
    }

    // Check file type
    const fileName = file.name.toLowerCase();

    if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
      return NextResponse.json(
        {
          success: false,
          error: "Only .xlsx and .xls files are supported.",
        },
        { status: 400 },
      );
    }

    // Limit file size to 10 MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: "File is too large. Maximum size is 10 MB.",
        },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const workbook = XLSX.read(buffer, {
      type: "buffer",
    });

    if (workbook.SheetNames.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Excel file does not contain any worksheet.",
        },
        { status: 400 },
      );
    }

    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      return NextResponse.json(
        {
          success: false,
          error: "Unable to read worksheet.",
        },
        { status: 400 },
      );
    }

    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      return NextResponse.json(
        {
          success: false,
          error: "Unable to read worksheet.",
        },
        { status: 400 },
      );
    }

    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
      defval: "",
    });

    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Excel file is empty.",
        },
        { status: 400 },
      );
    }

    // Normalize Excel column names
    const normalizedRows: NormalizedRow[] = rows.map(
      (row: Record<string, unknown>, index: number) => ({
        rowNumber: index + 2,

        postUrl: String(
          row.postUrl ?? row.postURL ?? row.post_url ?? row["Post URL"] ?? "",
        ).trim(),

        title: String(row.title ?? row.Title ?? "").trim(),

        description: String(row.description ?? row.Description ?? "").trim(),

        overlayText: String(
          row.overlayText ?? row.overlay_text ?? row["Overlay Text"] ?? "",
        ).trim(),

        imagePrompt: String(
          row.imagePrompt ?? row.image_prompt ?? row["Image Prompt"] ?? "",
        ).trim(),

        imageUrl: String(
          row.imageUrl ?? row.image_url ?? row["Image URL"] ?? "",
        ).trim(),

        board: String(row.board ?? row.Board ?? "").trim(),

        keywords: String(row.keywords ?? row.Keywords ?? "").trim(),
      }),
    );

    // Validate required fields
    const errors: string[] = [];

    normalizedRows.forEach((row: NormalizedRow) => {
      if (!row.postUrl) {
        errors.push(`Row ${row.rowNumber}: Post URL is required.`);
      }

      if (!row.title) {
        errors.push(`Row ${row.rowNumber}: Title is required.`);
      }

      if (!row.description) {
        errors.push(`Row ${row.rowNumber}: Description is required.`);
      }

      if (!row.imagePrompt) {
        errors.push(`Row ${row.rowNumber}: Image Prompt is required.`);
      }
    });

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Some rows are invalid.",
          errors,
        },
        { status: 400 },
      );
    }

    // Remove duplicate URLs inside Excel itself
    const uniqueRows = new Map<string, NormalizedRow>();

    for (const row of normalizedRows) {
      if (!uniqueRows.has(row.postUrl)) {
        uniqueRows.set(row.postUrl, row);
      }
    }

    const rowsToCheck = Array.from(uniqueRows.values());

    // Look up posts by URL
    const posts = await prisma.post.findMany({
      where: {
        url: {
          in: rowsToCheck.map((row: NormalizedRow) => row.postUrl),
        },
      },
      select: {
        id: true,
        url: true,
      },
    });

    // Explicitly type the callback parameter
    const postsByUrl = new Map<string, string>(
      posts.map((post: { id: string; url: string }) => [post.url, post.id]),
    );

    // Prepare pins to create
    const pinsToCreate: PinToCreate[] = [];
    const invalidPostUrls: string[] = [];

    for (const row of rowsToCheck) {
      const postId = postsByUrl.get(row.postUrl);

      if (!postId) {
        invalidPostUrls.push(
          `Row ${row.rowNumber}: Post URL not found: ${row.postUrl}`,
        );

        continue;
      }

      // Parse keywords
      const keywords = row.keywords
        ? row.keywords
            .split(",")
            .map((keyword: string) => keyword.trim())
            .filter(Boolean)
        : [];

      pinsToCreate.push({
        postId,
        title: row.title,
        description: row.description,
        overlayText: row.overlayText || null,
        imagePrompt: row.imagePrompt,
        imageUrl: row.imageUrl || null,
        board: row.board || null,
        keywords,
      });
    }

    if (invalidPostUrls.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Some post URLs were not found.",
          errors: invalidPostUrls,
        },
        { status: 400 },
      );
    }

    // Nothing to check
    if (pinsToCreate.length === 0) {
      return NextResponse.json({
        success: true,
        imported: 0,
        skipped: rows.length,
        total: rows.length,
        message: "No pins to import.",
      });
    }

    // Check existing pins
    const existingPins = await prisma.pin.findMany({
      where: {
        OR: pinsToCreate.map((pin: PinToCreate) => ({
          postId: pin.postId,
          title: pin.title,
        })),
      },
      select: {
        postId: true,
        title: true,
      },
    });

    const existingSet = new Set<string>(
      existingPins.map(
        (pin: { postId: string; title: string }) =>
          `${pin.postId}|${pin.title}`,
      ),
    );

    const newPins: PinToCreate[] = pinsToCreate.filter(
      (pin: PinToCreate) => !existingSet.has(`${pin.postId}|${pin.title}`),
    );

    const skipped = pinsToCreate.length - newPins.length;

    if (newPins.length === 0) {
      return NextResponse.json({
        success: true,
        imported: 0,
        skipped,
        total: rows.length,
        message: "No new pins to import.",
      });
    }

    // Create all pins
    const result = await prisma.pin.createMany({
      data: newPins,
      skipDuplicates: true,
    });

    return NextResponse.json({
      success: true,
      imported: result.count,
      skipped: rows.length - result.count,
      total: rows.length,
      message: `Successfully imported ${result.count} pins.`,
    });
  } catch (error: unknown) {
    console.error("Excel import error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to import Excel file.";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
