import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
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
          error: "Only .xlsx and .xls files are supported.",
        },
        { status: 400 },
      );
    }

    // Limit file size to 10 MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        {
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
          error: "Excel file does not contain any worksheet.",
        },
        { status: 400 },
      );
    }

    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      return NextResponse.json(
        {
          error: "First worksheet could not be found.",
        },
        { status: 400 },
      );
    }

    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      return NextResponse.json(
        {
          error: "First worksheet could not be read.",
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
          error: "Excel file is empty.",
        },
        { status: 400 },
      );
    }

    // Normalize Excel column names
    const normalizedRows = rows.map(
      (row: Record<string, unknown>, index: number) => ({
        rowNumber: index + 2,

        url: String(row.url ?? row.URL ?? row.Url ?? "").trim(),

        title: String(row.title ?? row.Title ?? "").trim(),

        mainKeyword: String(
          row.mainKeyword ?? row.main_keyword ?? row["Main Keyword"] ?? "",
        ).trim(),

        annotationKeywords: String(
          row.annotationKeywords ??
            row.annotation_keywords ??
            row["Annotation Keywords"] ??
            "",
        ).trim(),
      }),
    );

    // Validate required fields
    const errors: string[] = [];

    normalizedRows.forEach((row: (typeof normalizedRows)[number]) => {
      if (!row.url) {
        errors.push(`Row ${row.rowNumber}: URL is required.`);
      }

      if (!row.title) {
        errors.push(`Row ${row.rowNumber}: Title is required.`);
      }
    });

    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: "Some rows are invalid.",
          errors,
        },
        { status: 400 },
      );
    }

    // Remove duplicate URLs inside the Excel itself
    const uniqueRows = new Map<string, (typeof normalizedRows)[number]>();

    for (const row of normalizedRows) {
      if (!uniqueRows.has(row.url)) {
        uniqueRows.set(row.url, row);
      }
    }

    const rowsToCheck = Array.from(uniqueRows.values());

    // Check URLs that already exist in database
    const existingPosts: Array<{
      url: string;
    }> = await prisma.post.findMany({
      where: {
        url: {
          in: rowsToCheck.map((row: (typeof rowsToCheck)[number]) => row.url),
        },
      },
      select: {
        url: true,
      },
    });

    // Explicit type to prevent implicit any error
    const existingUrls = new Set<string>(
      existingPosts.map((post: { url: string }) => post.url),
    );

    const postsToCreate = rowsToCheck
      .filter((row: (typeof rowsToCheck)[number]) => !existingUrls.has(row.url))
      .map((row: (typeof rowsToCheck)[number]) => ({
        url: row.url,
        title: row.title,
        mainKeyword: row.mainKeyword || null,

        annotationKeywords: row.annotationKeywords
          ? row.annotationKeywords
              .split(",")
              .map((keyword: string) => keyword.trim())
              .filter(Boolean)
          : [],
      }));

    if (postsToCreate.length === 0) {
      return NextResponse.json({
        success: true,
        imported: 0,
        skipped: rowsToCheck.length,
        total: rows.length,
        message: "No new posts to import.",
      });
    }

    const result = await prisma.post.createMany({
      data: postsToCreate,
      skipDuplicates: true,
    });

    return NextResponse.json({
      success: true,
      imported: result.count,
      skipped: rows.length - result.count,
      total: rows.length,
      message: `Successfully imported ${result.count} posts.`,
    });
  } catch (error) {
    console.error("Excel import error:", error);

    return NextResponse.json(
      {
        error: "Failed to import Excel file.",
      },
      { status: 500 },
    );
  }
}
