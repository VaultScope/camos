/**
 * Validates that a URL uses an explicit http: or https: scheme.
 */
export function isSafeHttpUrl(raw: string | null | undefined): boolean {
  if (!raw) return false;
  const trimmed = raw.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Validates URLs used in blog content or cover images (https://, http://, or relative /).
 * Rejects protocol-relative // and dangerous schemes such as javascript: or data:.
 */
export function isSafeContentUrl(raw: string | null | undefined): boolean {
  if (!raw) return false;
  const trimmed = raw.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/')) {
    return !trimmed.startsWith('//') && !trimmed.startsWith('/\\');
  }
  return isSafeHttpUrl(trimmed);
}

/**
 * Sanitizes ticket attachment URLs, allowing https://, http://, or relative /uploads/ and /api/ paths only.
 * Returns null if the URL uses an unsafe scheme or disallowed path.
 */
export function sanitizeSafeUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('/api/')) {
    return trimmed;
  }
  if (isSafeHttpUrl(trimmed)) {
    return trimmed;
  }
  return null;
}

const ALLOWED_WYSIWYG_PROTOCOLS = ['http:', 'https:', 'mailto:'];

/**
 * Validates URIs in WysiwygEditor links: allows http, https, and mailto only.
 * Rejects protocol-relative //, ftp:, sms:, javascript:, data:, and relative paths.
 */
export function isAllowedWysiwygLinkUri(url: string | null | undefined): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith('//')) return false;
  try {
    const parsed = new URL(trimmed);
    return ALLOWED_WYSIWYG_PROTOCOLS.includes(parsed.protocol.toLowerCase());
  } catch {
    return false;
  }
}
