import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaExceptionFilter } from './../src/common/filters/prisma-exception.filter';
import { ResponseInterceptor } from './../src/common/interceptors/response.interceptor';

describe('Sections (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;
  let pageId: string;
  let sectionId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new PrismaExceptionFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());
    await app.init();

    // Login
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin', password: '123456' });
    token = loginRes.body.data.access_token;

    // Create a page for sections
    const pageRes = await request(app.getHttpServer())
      .post('/pages')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Sections Test Page', slug: 'sections-test-page' });
    pageId = pageRes.body.data.id;
  });

  afterAll(async () => {
    // Cleanup
    if (pageId) {
      await request(app.getHttpServer())
        .delete(`/pages/${pageId}`)
        .set('Authorization', `Bearer ${token}`);
    }
    await app.close();
  });

  describe('POST /pages/:pageId/sections', () => {
    it('should create a section', () => {
      return request(app.getHttpServer())
        .post(`/pages/${pageId}/sections`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'hero',
          content: { heading: 'Hello World' },
          order: 0,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data.type).toBe('hero');
          expect(res.body.data.pageId).toBe(pageId);
          sectionId = res.body.data.id;
        });
    });

    it('should reject section without type', () => {
      return request(app.getHttpServer())
        .post(`/pages/${pageId}/sections`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: {}, order: 0 })
        .expect(400);
    });

    it('should reject section for non-existent page', () => {
      return request(app.getHttpServer())
        .post('/pages/00000000-0000-0000-0000-000000000000/sections')
        .set('Authorization', `Bearer ${token}`)
        .send({ type: 'hero', content: {}, order: 0 })
        .expect(404);
    });
  });

  describe('GET /pages/:pageId/sections', () => {
    it('should return all sections for a page', () => {
      return request(app.getHttpServer())
        .get(`/pages/${pageId}/sections`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });
  });

  describe('GET /pages/:pageId/sections/:id', () => {
    it('should return section by id', () => {
      return request(app.getHttpServer())
        .get(`/pages/${pageId}/sections/${sectionId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.id).toBe(sectionId);
          expect(res.body.data.type).toBe('hero');
        });
    });
  });

  describe('PATCH /pages/:pageId/sections/:id', () => {
    it('should update a section', () => {
      return request(app.getHttpServer())
        .patch(`/pages/${pageId}/sections/${sectionId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ order: 1 })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.order).toBe(1);
        });
    });
  });

  describe('DELETE /pages/:pageId/sections/:id', () => {
    it('should delete a section', () => {
      return request(app.getHttpServer())
        .delete(`/pages/${pageId}/sections/${sectionId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });
});
