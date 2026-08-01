import type { PostWithPinCount } from "../types";

type PromptInput = Pick<
  PostWithPinCount,
  "title" | "url" | "mainKeyword" | "annotationKeywords"
>;

export function generateAiPrompt(post: PromptInput): string {
  const keyword = post.mainKeyword ?? "";
  const annotations =
    post.annotationKeywords.length > 0
      ? post.annotationKeywords.join(", ")
      : "None";

  return `
You are a Pinterest SEO expert.

Generate EXACTLY 5 high-performing Pinterest Pins for the article below.

ARTICLE TITLE
${post.title}

ARTICLE URL
${post.url}

PRIMARY KEYWORD
${keyword}

ANNOTATION KEYWORDS
${annotations}

Requirements:

- Create 5 completely different Pinterest Pins.
- Each pin should target a different search intent.
- Optimize for Pinterest SEO.
- Use natural American English.
- Titles must be under 100 characters.
- Descriptions should be 200–500 characters.
- Naturally include the primary keyword.
- Use annotation keywords where relevant.
- Avoid keyword stuffing.
- Make every title click-worthy.
- Create a different image concept for every pin.
- Overlay text must be short (3–8 words).
- Do not repeat wording between pins.

Return ONLY valid JSON.

Schema:

[
  {
    "title": "",
    "description": "",
    "overlayText": "",
    "imagePrompt": "",
    "keywords": []
  }
]
`.trim();
}
