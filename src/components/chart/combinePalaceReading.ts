export type ReadingSource = { title: string; text?: string };

const sentence = (text: string) => {
  const trimmed = text.trim().replace(/\s+/g, ' ');
  return /[.!?…]$/.test(trimmed) ? trimmed : trimmed + '.';
};

/** Body of a knowledge chunk: the text without its "Sao · Cung · Địa chi" title line. */
function sourceBody(source: ReadingSource): string {
  const text = (source.text ?? '').trim();
  const [first, ...rest] = text.split('\n');
  return (first.trim() === source.title.trim() ? rest.join('\n') : text).trim();
}

/** Star name a source is about, taken from its "Sao · Cung · Địa chi" title. */
const sourceStar = (source: ReadingSource) => source.title.split('·')[0].trim();

/** True when the model's overview only lists star names/elements, e.g. "Tử Vi: Thổ, Thiên Phủ: Thổ". */
export function isStarListOnly(text: string, stars: string[]): boolean {
  let rest = text;
  for (const star of stars) rest = rest.split(star).join('');
  return rest.replace(/:\s*[\p{L}]+/gu, '').replace(/[\s,.;:·–-]/g, '') === '';
}

/**
 * For a palace with several main stars, merge each star's source interpretation
 * into one answer, in the palace's star order. Returns null when there is not
 * enough source text (fewer than two stars covered).
 */
export function combineStarReadings(
  stars: string[],
  sources: ReadingSource[] | undefined,
): string | null {
  if (stars.length < 2 || !sources?.length) return null;
  const parts = stars
    .map((star) => {
      const bodies = sources
        .filter((source) => sourceStar(source) === star)
        .map(sourceBody)
        .filter(Boolean);
      return bodies.length ? { star, text: [...new Set(bodies)].map(sentence).join(' ') } : null;
    })
    .filter((part): part is { star: string; text: string } => part !== null);
  if (parts.length < 2) return null;
  return parts.map((part) => `${part.star}: ${part.text}`).join(' ');
}
