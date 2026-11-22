const UNSAFE_URL_CHARS = /[\u0000-\u001F\u007F\\]/;

/**
 * Validates that a URL uses an explicit http: or https: scheme.
 */
export function isSafeHttpUrl(raw: string | null | undefined): boolean {
  if (!raw) return false;
  const trimmed = raw.trim();
  if (!trimmed || UNSAFE_URL_CHARS.test(trimmed)) return false;
  try {
    const parsed = new URL(trimmed);
    return (parsed.protocol === 'https:' || parsed.protocol === 'http:') && !parsed.username && !parsed.password;
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
  if (!trimmed || UNSAFE_URL_CHARS.test(trimmed)) return false;
  if (trimmed.startsWith('/')) {
    if (trimmed.startsWith('//')) return false;
    try {
      const parsed = new URL(trimmed, 'https://sentinel.invalid');
      return parsed.origin === 'https://sentinel.invalid' && !parsed.pathname.includes('..');
    } catch {
      return false;
    }
  }
  return isSafeHttpUrl(trimmed);
}

/**
 * Sanitizes ticket attachment URLs, allowing https://, http://, or normalized relative /uploads/ and /api/uploads/ paths only.
 * Returns null if the URL uses an unsafe scheme or disallowed path.
 */
export function sanitizeSafeUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed || UNSAFE_URL_CHARS.test(trimmed)) return null;
  if (trimmed.startsWith('/')) {
    if (trimmed.startsWith('//') || trimmed.includes('..')) return null;
    try {
      const parsed = new URL(trimmed, 'https://sentinel.invalid');
      if (
        parsed.origin === 'https://sentinel.invalid' &&
        (parsed.pathname.startsWith('/uploads/') || parsed.pathname.startsWith('/api/'))
      ) {
        return `${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
    } catch {
      return null;
    }
    return null;
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
  if (!trimmed || trimmed.startsWith('//') || UNSAFE_URL_CHARS.test(trimmed)) return false;
  try {
    const parsed = new URL(trimmed);
    const protocol = parsed.protocol.toLowerCase();
    if (!ALLOWED_WYSIWYG_PROTOCOLS.includes(protocol)) return false;
    if ((protocol === 'http:' || protocol === 'https:') && (!parsed.hostname || parsed.username || parsed.password)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
