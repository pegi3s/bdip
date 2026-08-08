/**
 * Rewrites relative image/link URLs found in fetched Markdown/HTML content into absolute URLs
 * rooted at `baseUrl`. Used for Markdown fetched raw from GitHub, where image/link paths are
 * relative to the source file's own directory and need rebasing before they'll resolve once
 * embedded in this app.
 *
 * Note: this parses HTML tags with regex rather than a real HTML parser, which is normally
 * fragile (multi-line tags, unusual attribute ordering, or nested quotes could break it). It's
 * kept as-is since it's tuned to the specific Markdown/HTML shapes this app's docs use, but
 * worth keeping in mind if source content ever changes format.
 */
export function setMarkdownBaseUrl(content: string, baseUrl: string): string {
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';

  // Replace image sources in HTML
  content = content.replace(/<img\s+[^>]*src\s*=\s*["']([^"']+)["'][^>]*>/gi,
    (match, src) => match.replace(src, convertToAbsoluteUrl(src, normalizedBaseUrl)));

  // Replace href attributes in HTML anchors
  content = content.replace(/<a\s+[^>]*href\s*=\s*["']([^"']+)["'][^>]*>/gi,
    (match, href) => match.replace(href, convertToAbsoluteUrl(href, normalizedBaseUrl)));

  // Replace image sources in Markdown
  content = content.replace(/!\[([^\]]*)\]\(([^)]+)\)/gi,
    (match, alt, src) => `![${alt}](${convertToAbsoluteUrl(src, normalizedBaseUrl)})`);

  // Replace links in Markdown
  content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/gi,
    (match, text, url) => `[${text}](${convertToAbsoluteUrl(url, normalizedBaseUrl)})`);

  return content;
}

function convertToAbsoluteUrl(url: string, baseUrl: string): string {
  // Skip URLs that are already absolute
  if (url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('//') ||
    url.startsWith('mailto:') ||
    url.startsWith('tel:') ||
    url.startsWith('#')) {
    return url;
  }

  // Remove leading slash if present
  const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
  return baseUrl + cleanUrl;
}
