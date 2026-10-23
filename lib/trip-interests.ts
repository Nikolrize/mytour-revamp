import { tripInterestOptions } from "@/lib/data";

export function getTripInterests(
  interests: unknown,
  description?: string | null,
): string[] {
  const source =
    Array.isArray(interests) && interests.length
      ? interests
      : (description
          ?.match(/Interests:\s*([^\n]+)/i)?.[1]
          .replace(/\.\s*$/, "")
          .split(",") ?? []);
  return [
    ...new Set(
      source.flatMap((value: unknown) => {
        if (typeof value !== "string") return [];
        const match = tripInterestOptions.find(
          (option) => option.toLowerCase() === value.trim().toLowerCase(),
        );
        return match ? [match] : [];
      }),
    ),
  ];
}
