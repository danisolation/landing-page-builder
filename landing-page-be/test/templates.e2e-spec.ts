import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './test-app.helper';

const sampleSections = [
  {
    type: 'hero',
    content: { heading: 'Template Hero', buttonText: 'Go' },
    order: 0,
  },
  {
    type: 'cta',
    content: { heading: 'Template CTA', buttonText: 'Sign up' },
    order: 1,
  },
];

describe('Templates (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;
  let templateId: string;

  beforeAll(async () => {
    app = await createTestApp();

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin', password: '123456' });
    token = loginRes.body.data.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /templates', () => {
    it('should create a template', () => {
      return request(app.getHttpServer())
        .post('/templates')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'E2E Template',
          description: 'Created by e2e test',
          sections: sampleSections,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data.name).toBe('E2E Template');
          expect(res.body.data.sections).toHaveLength(2);
          templateId = res.body.data.id;
        });
    });

    it('should reject template without name', () => {
      return request(app.getHttpServer())
        .post('/templates')
        .set('Authorization', `Bearer ${token}`)
        .send({ sections: sampleSections })
        .expect(400);
    });

    it('should reject template with empty sections', () => {
      return request(app.getHttpServer())
        .post('/templates')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'No Sections', sections: [] })
        .expect(400);
    });

    it('should reject section with invalid type', () => {
      return request(app.getHttpServer())
        .post('/templates')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Bad Type',
          sections: [{ type: 'invalid', content: {}, order: 0 }],
        })
        .expect(400);
    });

    it('should reject without auth token', () => {
      return request(app.getHttpServer())
        .post('/templates')
        .send({ name: 'No Auth', sections: sampleSections })
        .expect(401);
    });
  });

  describe('GET /templates', () => {
    it('should return all templates', () => {
      return request(app.getHttpServer())
        .get('/templates')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    it('should reject without auth token', () => {
      return request(app.getHttpServer()).get('/templates').expect(401);
    });
  });

  describe('GET /templates/:id', () => {
    it('should return template by id', () => {
      return request(app.getHttpServer())
        .get(`/templates/${templateId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.id).toBe(templateId);
          expect(res.body.data.name).toBe('E2E Template');
        });
    });

    it('should return 404 for non-existent template', () => {
      return request(app.getHttpServer())
        .get('/templates/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('DELETE /templates/:id', () => {
    it('should delete template', () => {
      return request(app.getHttpServer())
        .delete(`/templates/${templateId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('should return 404 when deleting non-existent template', () => {
      return request(app.getHttpServer())
        .delete(`/templates/${templateId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });
});
