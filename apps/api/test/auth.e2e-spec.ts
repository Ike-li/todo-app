/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { App } from 'supertest/types';

// Mock PrismaClient so PrismaService can be imported without generated client
jest.mock('@prisma/client', () => ({
  PrismaClient: class MockPrismaClient {},
}));
jest.mock('bcrypt');

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { AppModule } = require('../src/app.module');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaService } = require('../src/prisma/prisma.service');

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let prismaService: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
  };

  beforeAll(async () => {
    prismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('should return 201 with accessToken', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };
      const hashedPassword = 'hashed-password';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue({
        id: 'user-uuid-1',
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(dto)
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(typeof response.body.accessToken).toBe('string');
    });

    it('should return 409 for duplicate email', async () => {
      const dto = { email: 'existing@example.com', password: 'password123' };
      prismaService.user.findUnique.mockResolvedValue({
        id: 'existing-user',
        email: dto.email,
      });

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(dto)
        .expect(409);

      expect(response.body.message).toContain('Email already exists');
    });

    it('should return 400 for invalid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'not-an-email', password: 'password123' })
        .expect(400);
    });

    it('should return 400 for short password', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@example.com', password: 'short' })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should return 200 with accessToken', async () => {
      const dto = { email: 'test@example.com', password: 'password123' };
      const mockUser = {
        id: 'user-uuid-1',
        email: dto.email,
        name: 'Test User',
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(dto)
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
    });

    it('should return 401 for wrong password', async () => {
      const dto = { email: 'test@example.com', password: 'wrong-password' };
      prismaService.user.findUnique.mockResolvedValue({
        id: 'user-uuid-1',
        email: dto.email,
        password: 'hashed-password',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(dto)
        .expect(401);

      expect(response.body.message).toContain('Invalid credentials');
    });
  });

  describe('GET /auth/me', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer()).get('/auth/me').expect(401);
    });
  });
});
