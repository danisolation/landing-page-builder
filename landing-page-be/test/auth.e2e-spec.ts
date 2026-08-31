import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './test-app.helper';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new admin', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'e2e-test-user', password: 'testpass123' })
        .expect(201)
        .expect((res) => {
          expect(res.body.data.username).toBe('e2e-test-user');
          expect(res.body.data).not.toHaveProperty('password');
        });
    });

    it('should reject duplicate username', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'e2e-test-user', password: 'testpass123' })
        .expect(409);
    });

    it('should reject short username', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'ab', password: 'testpass123' })
        .expect(400);
    });

    it('should reject short password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'validuser', password: 'short' })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'e2e-test-user', password: 'testpass123' })
        .expect(201)
        .expect((res) => {
          expect(res.body.data.access_token).toBeDefined();
          token = res.body.data.access_token;
        });
    });

    it('should reject invalid password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'e2e-test-user', password: 'wrongpassword' })
        .expect(401);
    });

    it('should reject non-existent user', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'nonexistent', password: 'testpass123' })
        .expect(401);
    });
  });

  describe('GET /auth/profile', () => {
    it('should return profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.username).toBe('e2e-test-user');
          expect(res.body.data).not.toHaveProperty('password');
        });
    });

    it('should reject request without token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });
  });
});
