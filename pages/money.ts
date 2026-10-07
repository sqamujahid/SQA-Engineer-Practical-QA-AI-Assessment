/** "Item total: $29.99" -> 29.99 */
export function parseMoney(text: string): number {
  const match = text.match(/\$(\d+(?:\.\d{2})?)/);
  if (!match) throw new Error(`No money value found in "${text}"`);
  return Number(match[1]);
}

export const round2 = (n: number) => Math.round(n * 100) / 100;
