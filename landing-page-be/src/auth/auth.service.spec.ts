import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { admin: { create: jest.Mock; findUnique: jest.Mock } };
  let jwt: { signAsync: jest.Mock };

  beforeEach(async () => {
    prisma = {
      admin: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
    };
    jwt = { signAsync: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('register', () => {
    it('should create admin and return without password', async () => {
      const admin = {
        id: '1',
        username: 'test',
        password: 'hashed',
        createdAt: new Date(),
      };
      prisma.admin.create.mockResolvedValue(admin);

      const result = await service.register('test', 'password123');

      expect(prisma.admin.create).toHaveBeenCalledWith({
        data: {
          username: 'test',
          password: expect.any(String),
        },
      });
      expect(result).not.toHaveProperty('password');
      expect(result.username).toBe('test');
    });

    it('should hash password before storing', async () => {
      prisma.admin.create.mockResolvedValue({
        id: '1',
        username: 'test',
        password: 'hashed',
        createdAt: new Date(),
      });

      await service.register('test', 'password123');

      const hashCall = prisma.admin.create.mock.calls[0][0].data.password;
      expect(hashCall).not.toBe('password123');
      expect(await bcrypt.compare('password123', hashCall)).toBe(true);
    });
  });

  describe('login', () => {
    it('should return access_token on valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      prisma.admin.findUnique.mockResolvedValue({
        id: '1',
        username: 'test',
        password: hashedPassword,
      });
      jwt.signAsync.mockResolvedValue('jwt-token');

      const result = await service.login({
        username: 'test',
        password: 'password123',
      });

      expect(result).toEqual({ access_token: 'jwt-token' });
      expect(jwt.signAsync).toHaveBeenCalledWith({
        sub: '1',
        username: 'test',
      });
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      prisma.admin.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ username: 'nonexistent', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const hashedPassword = await bcrypt.hash('correct', 10);
      prisma.admin.findUnique.mockResolvedValue({
        id: '1',
        username: 'test',
        password: hashedPassword,
      });

      await expect(
        service.login({ username: 'test', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should return admin without password', async () => {
      const admin = {
        id: '1',
        username: 'test',
        createdAt: new Date(),
      };
      prisma.admin.findUnique.mockResolvedValue(admin);

      const result = await service.getProfile('1');

      expect(result).toEqual(admin);
      expect(prisma.admin.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: { id: true, username: true, createdAt: true },
      });
    });
  });
});
