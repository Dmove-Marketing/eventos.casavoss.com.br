// CDN próprio (media.dmove.com.br) suporta redimensionamento sob demanda via
// /api/public/resize/:width/clients/... — usado para gerar srcset responsivo real.
export const MEDIA_CDN_PREFIX = 'https://media.dmove.com.br/clients/';

const RESIZE_WIDTHS = [400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1600, 2048];

export function isMediaCdn(url: string) {
  return url.startsWith(MEDIA_CDN_PREFIX);
}

export function buildResizeUrl(url: string, w: number) {
  return url.replace('/clients/', `/api/public/resize/${w}/clients/`);
}

export function buildSrcset(url: string, maxWidth: number) {
  const cap = Math.min(maxWidth * 2, 2048); // até 2x para telas retina
  const chosen = new Set(RESIZE_WIDTHS.filter((w) => w <= cap));
  chosen.add(Math.min(maxWidth, 2048));
  return [...chosen]
    .sort((a, b) => a - b)
    .map((w) => `${buildResizeUrl(url, w)} ${w}w`)
    .join(', ');
}
