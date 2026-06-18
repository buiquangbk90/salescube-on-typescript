/**
 * Customer normalization rules (legacy ㈱ → 株式会社, full-width → half-width, etc.).
 */

const COMPANY_NORMALIZATIONS: Array<[RegExp, string]> = [
  [/㈱/g, '株式会社'],
  [/㈲/g, '有限会社'],
  [/㈳/g, '社団法人'],
  [/㈶/g, '財団法人'],
];

/**
 * Normalize half-width / full-width forms and common abbreviations.
 * Pure function – no I/O.
 */
export function normalizeCompanyName(input: string): string {
  let s = input.trim();
  for (const [re, rep] of COMPANY_NORMALIZATIONS) {
    s = s.replace(re, rep);
  }
  // Collapse multi-spaces
  s = s.replace(/\s+/g, ' ');
  return s;
}

/**
 * Normalize Katakana for fuzzy search:
 * - lowercase ASCII
 * - convert half-width katakana to full-width (basic mapping)
 * - remove whitespace
 */
export function normalizeKana(input: string): string {
  if (!input) return '';
  return input
    .normalize('NFKC') // half-width katakana → full-width, full-width ASCII → half-width
    .toLowerCase()
    .replace(/\s+/g, '');
}
