export function getExcerpt(body: string, maxLength = 140): string {
  const text = body
    .replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, '')
    .replace(/^#{1,6}\s+.+$/gm, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[`*_>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const characters = Array.from(text);
  return characters.length > maxLength ? `${characters.slice(0, maxLength).join('')}…` : text;
}
