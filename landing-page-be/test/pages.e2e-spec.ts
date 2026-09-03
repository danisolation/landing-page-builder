import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './test-app.helper';

describe('Pages (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;
  let pageId: string;

  beforeAll(async () => {
    app = await createTestApp();

    // Login to get token
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin', password: '123456' });
    token = loginRes.body.data.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /pages', () => {
    it('should create a page', () => {
      return request(app.getHttpServer())
        .post('/pages')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'E2E Test Page', slug: 'e2e-test-page' })
        .expect(201)
        .expect((res) => {
          expect(res.body.data.title).toBe('E2E Test Page');
          expect(res.body.data.slug).toBe('e2e-test-page');
          pageId = res.body.data.id;
        });
    });

    it('should reject page without title', () => {
      return request(app.getHttpServer())
        .post('/pages')
        .set('Authorization', `Bearer ${token}`)
        .send({ slug: 'no-title' })
        .expect(400);
    });

    it('should reject page without slug', () => {
      return request(app.getHttpServer())
        .post('/pages')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'No Slug' })
        .expect(400);
    });
  });

  describe('GET /pages', () => {
    it('should return all pages', () => {
      return request(app.getHttpServer())
        .get('/pages')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });
  });

  describe('GET /pages/:id', () => {
    it('should return page by id', () => {
      return request(app.getHttpServer())
        .get(`/pages/${pageId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.id).toBe(pageId);
          expect(res.body.data.title).toBe('E2E Test Page');
        });
    });

    it('should return 404 for non-existent page', () => {
      return request(app.getHttpServer())
        .get('/pages/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('PATCH /pages/:id', () => {
    it('should update a page', () => {
      return request(app.getHttpServer())
        .patch(`/pages/${pageId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated E2E Page', isPublished: true })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.title).toBe('Updated E2E Page');
          expect(res.body.data.isPublished).toBe(true);
        });
    });
  });

  describe('GET /pages/slug/:slug', () => {
    it('should return page by slug (public)', () => {
      return request(app.getHttpServer())
        .get('/pages/slug/e2e-test-page')
        .expect(200)
        .expect((res) => {
          expect(res.body.data.slug).toBe('e2e-test-page');
        });
    });
  });

  describe('DELETE /pages/:id', () => {
    it('should delete a page', () => {
      return request(app.getHttpServer())
        .delete(`/pages/${pageId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('should return 404 for deleted page', () => {
      return request(app.getHttpServer())
        .get(`/pages/${pageId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });
});
