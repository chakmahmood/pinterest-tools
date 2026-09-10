import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

interface ExcelRow {
  "Post URL"?: unknown;
  Title?: unknown;
  "Main Keyword"?: unknown;
  "Annotation Keywords"?: unknown;
  [key: string]: unknown;
}

interface NormalizedRow {
  postUrl: string;
  title: string;
  mainKeyword: string;
  annotationKeywords: string[];
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

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "Excel file is required",
        },
        { status: 400 },
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "The uploaded file is empty",
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
          message: "No worksheet found in the Excel file",
        },
        { status: 400 },
      );
    }

    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    if (!worksheet) {
      return NextResponse.json(
        {
          success: false,
          message: "The first worksheet could not be read",
        },
        { status: 400 },
      );
    }

    const rows = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, {
      defval: "",
    });

    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "The Excel file contains no data",
        },
        { status: 400 },
      );
    }

    /*
     * Normalize Excel rows
     */
    const normalizedRows: NormalizedRow[] = rows
      .map((row: ExcelRow): NormalizedRow => {
        const postUrl = String(row["Post URL"] ?? "").trim();

        const title = String(row["Title"] ?? "").trim();

        const mainKeyword = String(row["Main Keyword"] ?? "").trim();

        const rawAnnotationKeywords = String(
          row["Annotation Keywords"] ?? "",
        ).trim();

        const annotationKeywords = rawAnnotationKeywords
          ? rawAnnotationKeywords
              .split(/[,;\n|]/)
              .map((keyword: string) => keyword.trim())
              .filter(Boolean)
          : [];

        return {
          postUrl,
          title,
          mainKeyword,
          annotationKeywords,
        };
      })
      .filter(
        (row: NormalizedRow) => row.postUrl.length > 0 && row.title.length > 0,
      );

    if (normalizedRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No valid rows found. Each row must contain Post URL and Title.",
        },
        { status: 400 },
      );
    }

    /*
     * Remove duplicate URLs from the Excel file.
     *
     * If the same Post URL appears multiple times,
     * only the first row is used.
     */
    const uniqueRowsMap = new Map<string, NormalizedRow>();

    normalizedRows.forEach((row: NormalizedRow) => {
      if (!uniqueRowsMap.has(row.postUrl)) {
        uniqueRowsMap.set(row.postUrl, row);
      }
    });

    const uniqueRows = Array.from(uniqueRowsMap.values());

    /*
     * Find existing posts.
     */
    const existingPosts: Array<{
      id: string;
      url: string;
    }> = await prisma.post.findMany({
      where: {
        url: {
          in: uniqueRows.map((row: NormalizedRow) => row.postUrl),
        },
      },
      select: {
        id: true,
        url: true,
      },
    });

    /*
     * This explicit type prevents:
     *
     * Parameter 'post' implicitly has an 'any' type.
     */
    const existingUrls = new Set<string>(
      existingPosts.map((post: { id: string; url: string }) => post.url),
    );

    /*
     * Create only posts that don't already exist.
     */
    const postsToCreate = uniqueRows.filter(
      (row: NormalizedRow) => !existingUrls.has(row.postUrl),
    );

    let createdPostsCount = 0;

    if (postsToCreate.length > 0) {
      await prisma.post.createMany({
        data: postsToCreate.map((row: NormalizedRow) => ({
          url: row.postUrl,
          title: row.title,
          mainKeyword: row.mainKeyword || null,
          annotationKeywords: row.annotationKeywords,
        })),
        skipDuplicates: true,
      });

      createdPostsCount = postsToCreate.length;
    }

    /*
     * Re-fetch all posts so we have their IDs,
     * including posts that already existed.
     */
    const allPosts: Array<{
      id: string;
      url: string;
      title: string;
      mainKeyword: string | null;
      annotationKeywords: string[];
    }> = await prisma.post.findMany({
      where: {
        url: {
          in: uniqueRows.map((row: NormalizedRow) => row.postUrl),
        },
      },
      select: {
        id: true,
        url: true,
        title: true,
        mainKeyword: true,
        annotationKeywords: true,
      },
    });

    /*
     * Map URL -> Post ID
     */
    const postsByUrl = new Map<string, string>(
      allPosts.map(
        (post: {
          id: string;
          url: string;
          title: string;
          mainKeyword: string | null;
          annotationKeywords: string[];
        }) => [post.url, post.id],
      ),
    );

    /*
     * Prepare pins.
     *
     * Each imported Post gets one initial Pin.
     */
    const pinsToCreate: PinToCreate[] = [];

    for (const row of uniqueRows) {
      const postId = postsByUrl.get(row.postUrl);

      if (!postId) {
        continue;
      }

      const descriptionParts = [
        row.title,
        row.mainKeyword,
        ...row.annotationKeywords,
      ].filter(Boolean);

      const description = descriptionParts.join(". ");

      const imagePrompt = [
        `Create a high-quality Pinterest image about ${row.title}.`,
        row.mainKeyword ? `Main topic: ${row.mainKeyword}.` : "",
        row.annotationKeywords.length > 0
          ? `Related keywords: ${row.annotationKeywords.join(", ")}.`
          : "",
        "Vertical Pinterest format, clean composition, visually appealing, high click-through-rate design.",
        "Do not include logos, website names, or Pinterest branding.",
      ]
        .filter(Boolean)
        .join(" ");

      pinsToCreate.push({
        postId,
        title: row.title,
        description,
        overlayText: row.title,
        imagePrompt,
        imageUrl: null,
        board: null,
        keywords: row.annotationKeywords,
      });
    }

    /*
     * Prevent duplicate pins.
     *
     * A pin is considered duplicate when the same
     * postId + title already exists.
     */
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

    const existingPinKeys = new Set<string>(
      existingPins.map(
        (pin: { postId: string; title: string }) =>
          `${pin.postId}::${pin.title}`,
      ),
    );

    const newPins = pinsToCreate.filter(
      (pin: PinToCreate) => !existingPinKeys.has(`${pin.postId}::${pin.title}`),
    );

    let createdPinsCount = 0;

    if (newPins.length > 0) {
      await prisma.pin.createMany({
        data: newPins.map((pin: PinToCreate) => ({
          postId: pin.postId,
          title: pin.title,
          description: pin.description,
          overlayText: pin.overlayText,
          imagePrompt: pin.imagePrompt,
          imageUrl: pin.imageUrl,
          board: pin.board,
          keywords: pin.keywords,
        })),
        skipDuplicates: true,
      });

      createdPinsCount = newPins.length;
    }

    /*
     * Return import summary.
     */
    return NextResponse.json({
      success: true,
      message: "Excel import completed successfully",
      data: {
        rowsRead: rows.length,
        validRows: normalizedRows.length,
        uniquePosts: uniqueRows.length,
        existingPosts: existingPosts.length,
        createdPosts: createdPostsCount,
        pinsPrepared: pinsToCreate.length,
        existingPins: existingPins.length,
        createdPins: createdPinsCount,
      },
    });
  } catch (error) {
    console.error("Excel import error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to import Excel file",
      },
      { status: 500 },
    );
  }
}
