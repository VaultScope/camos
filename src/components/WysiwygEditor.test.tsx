import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WysiwygEditor } from './WysiwygEditor';
import { isAllowedWysiwygLinkUri } from '../lib/url';

describe('WysiwygEditor link validation and toolbar safety', () => {
  it('allows only http, https, and mailto protocols', () => {
    expect(isAllowedWysiwygLinkUri('https://vaultscope.de/docs')).toBe(true);
    expect(isAllowedWysiwygLinkUri('http://example.com')).toBe(true);
    expect(isAllowedWysiwygLinkUri('mailto:support@vaultscope.de')).toBe(true);

    expect(isAllowedWysiwygLinkUri('//evil.com/phish')).toBe(false);
    expect(isAllowedWysiwygLinkUri('ftp://files.example.com')).toBe(false);
    expect(isAllowedWysiwygLinkUri('sms:+49123456')).toBe(false);
    expect(isAllowedWysiwygLinkUri('javascript:alert(1)')).toBe(false);
    expect(isAllowedWysiwygLinkUri('data:text/html,<script>alert(1)</script>')).toBe(false);
  });

  it('does not render dead mock file attachment button', () => {
    render(<WysiwygEditor content="<p>Hello</p>" onChange={vi.fn()} />);
    expect(screen.queryByTitle('Attach Files')).toBeNull();
  });
});
