/**
 * Replaces all occurrences of a search string with a replacement string.
 * This is a utility function to avoid extending String.prototype.
 */
export function globalReplace(str: string, search: string, replace: string): string {
  return str.split(search).join(replace);
}

/**
 * Translates characters in a string based on character mappings.
 * Each character in fromChars is replaced with the corresponding character in toChars.
 */
export function translate(str: string, fromChars: string, toChars: string): string {
  let result = str;
  for (let i = 0; i < fromChars.length; i++) {
    result = result.split(fromChars.charAt(i)).join(toChars.charAt(i));
  }
  return result;
}

/**
 * Validates input string and throws error if not a string.
 */
export function validateStringInput(input: unknown, fieldName: string): string {
  if (typeof input !== 'string') {
    throw new Error(`${fieldName} must be a string, received: ${typeof input}`);
  }
  return input;
}