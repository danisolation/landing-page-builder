import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './test-app.helper';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let userToken: string;
  // Unique username to avoid conflicts between test runs
  const testUsername = `e2e-user-${Date.now()}`;

  beforeAll(async () => {
    app = await createTestApp();

    // Login with seeded admin to get token for register tests
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin', password: '123456' });
    adminToken = loginRes.body.data.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new admin (requires auth)', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ username: testUsername, password: 'testpass123' })
        .expect(201)
        .expect((res) => {
          expect(res.body.data.username).toBe(testUsername);
          expect(res.body.data).not.toHaveProperty('password');
        });
    });

    it('should reject unauthenticated register', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'another-user', password: 'testpass123' })
        .expect(401);
    });

    it('should reject duplicate username', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ username: testUsername, password: 'testpass123' })
        .expect(409);
    });

    it('should reject short username', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ username: 'ab', password: 'testpass123' })
        .expect(400);
    });

    it('should reject short password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ username: 'validuser', password: 'short' })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: testUsername, password: 'testpass123' })
        .expect(201)
        .expect((res) => {
          expect(res.body.data.access_token).toBeDefined();
          userToken = res.body.data.access_token;
        });
    });

    it('should reject invalid password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: testUsername, password: 'wrongpassword' })
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
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.username).toBe(testUsername);
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
