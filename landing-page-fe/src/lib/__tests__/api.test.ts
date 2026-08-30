import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal('localStorage', localStorageMock);

// Mock window for browser-only code
vi.stubGlobal('window', { localStorage: localStorageMock });

import {
  login,
  getPages,
  getPage,
  createPage,
  deletePage,
  createSection,
  updateSection,
  deleteSection,
} from '../api';

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchAPI', () => {
    it('should include auth token in headers when available', async () => {
      localStorageMock.getItem.mockReturnValue('test-token');
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { id: 1 }, timestamp: '' }),
      });

      await getPages();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/pages',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        }),
      );
    });

    it('should not include auth token when not available', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [], timestamp: '' }),
      });

      await getPages();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/pages',
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.any(String),
          }),
        }),
      );
    });

    it('should throw error on non-ok response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Not found' }),
      });

      await expect(getPage('nonexistent')).rejects.toThrow('Not found');
    });

    it('should unwrap data from response envelope', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { id: '1', title: 'Test' },
            timestamp: '',
          }),
      });

      const result = await getPage('1');
      expect(result).toEqual({ id: '1', title: 'Test' });
    });
  });

  describe('Auth API', () => {
    it('login should POST credentials', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { access_token: 'jwt-token' },
            timestamp: '',
          }),
      });

      const result = await login('admin', '123456');
      expect(result.access_token).toBe('jwt-token');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/auth/login',
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });

  describe('Pages API', () => {
    it('getPages should GET /pages', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [], timestamp: '' }),
      });

      await getPages();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/pages',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }),
      );
    });

    it('createPage should POST with data', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { id: '1', title: 'New' },
            timestamp: '',
          }),
      });

      await createPage({ title: 'New', slug: 'new' });
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/pages',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ title: 'New', slug: 'new' }),
        }),
      );
    });

    it('deletePage should DELETE', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: null, timestamp: '' }),
      });

      await deletePage('1');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/pages/1',
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });

  describe('Sections API', () => {
    it('createSection should POST to nested route', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { id: 's1', type: 'hero' },
            timestamp: '',
          }),
      });

      await createSection('page-1', { type: 'hero', content: {}, order: 0 });
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/pages/page-1/sections',
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('updateSection should PATCH nested route', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { id: 's1', order: 1 },
            timestamp: '',
          }),
      });

      await updateSection('page-1', 's1', { order: 1 });
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/pages/page-1/sections/s1',
        expect.objectContaining({ method: 'PATCH' }),
      );
    });
  });
});
