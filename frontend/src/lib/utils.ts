import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { SelectOption } from "@/components/ui/input/custom-select";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function enumToSelectOptions<T extends Record<string, string>>(
  enumObj: T
): SelectOption[] {
  return Object.values(enumObj).map((value) => ({
    value,
    label: value,
  }));
}

export function capitalizeWords(str: string) {
  // Split the string into an array of words based on spaces
  const words = str.split(" ");

  // Map over the array of words to capitalize the first letter of each
  const capitalizedWords = words.map((word: string) => {
    if (word.length === 0) {
      return ""; // Handle empty strings if present
    }
    // Capitalize the first character and concatenate with the rest of the word (lowercased)
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });

  // Join the capitalized words back into a single string with spaces
  return capitalizedWords.join(" ");
}

export function buildQueryString(
  params: Record<string, string | number | undefined>
): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim()) {
      searchParams.set(key, String(value).trim());
    }
  });

  return searchParams.toString();
}

export function isErrorResponse(obj: object): obj is { error: string } {
  return "error" in obj;
}
