import type { GeneratePinResult } from "../types";

interface Input {
  title: string;
  mainKeyword?: string | null;
  annotationKeywords: string[];
}

export function generatePins(data: Input): GeneratePinResult[] {
  const keyword = data.mainKeyword ?? data.title;

  const annotations = data.annotationKeywords.join(", ");

  return Array.from({ length: 5 }, (_, index) => ({
    title: `${keyword} Ideas You Will Love ${index + 1}`,

    description: `Discover the best ${keyword} ideas with simple tips and inspiration. Perfect for beginners looking for creative projects and helpful resources. ${annotations}`,

    overlayText: [
      "Easy Ideas",
      "Beginner Guide",
      "Top Inspiration",
      "Simple Tips",
      "Must Try Ideas",
    ][index],

    imagePrompt: `Create a Pinterest style vertical image about ${keyword}. 
        Clean aesthetic composition, realistic details, bright natural lighting.
        Include visual elements related to ${annotations}.`,

    keywords: [keyword, ...data.annotationKeywords],

    board: `${keyword} Ideas`,
  }));
}
