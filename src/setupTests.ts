import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('./components/Toast', async () => {
  const actual = await vi.importActual('./components/Toast');
  return {
    ...actual,
    useToast: () => ({
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
    }),
  };
});
