export const FORBIDDEN_URL_REGEX = /(https?:\/\/|www\.|(?:\b[a-zA-Z0-9-]+\.(?:com|org|net|edu|gov|io|xyz|info|biz|co|app)\b)(?:\/[^\s]*)?)/i;

/**
 * Checks whether the given text contains any forbidden web links or domain patterns.
 * @param text The input string to validate
 * @returns true if forbidden links are found, false otherwise
 */
export function checkForForbiddenLinks(text: string): boolean {
  return FORBIDDEN_URL_REGEX.test(text);
}
