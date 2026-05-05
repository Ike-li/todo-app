import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';

describe('TagsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: any) => {
          const req = context.switchToHttp().getRequest();
          req.user = { sub: userId };
          return true;
        },
      })
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

    prisma = app.get(PrismaService);

    const user = await prisma.user.create({
      data: {
        email: 'test-tag-e2e@example.com',
        password: 'hashedpassword',
        name: 'E2E Tag User',
      },
    });
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.tag.deleteMany();
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /tags', () => {
    it('should create a tag (201)', async () => {
      const res = await request(app.getHttpServer())
        .post('/tags')
        .send({ name: 'urgent' })
        .expect(201);

      expect(res.body.name).toBe('urgent');
      expect(res.body.id).toBeDefined();
    });

    it('should normalize tag name to lowercase (201)', async () => {
      const res = await request(app.getHttpServer())
        .post('/tags')
        .send({ name: '  Important  ' })
        .expect(201);

      expect(res.body.name).toBe('important');
    });

    it('should return 409 for duplicate tag name', async () => {
      await prisma.tag.create({ data: { name: 'duplicate' } });

      const res = await request(app.getHttpServer())
        .post('/tags')
        .send({ name: 'duplicate' })
        .expect(409);

      expect(res.body.message).toContain('already exists');
    });

    it('should return 409 for duplicate tag after normalization', async () => {
      await prisma.tag.create({ data: { name: 'normalized' } });

      const res = await request(app.getHttpServer())
        .post('/tags')
        .send({ name: '  NORMALIZED  ' })
        .expect(409);

      expect(res.body.message).toContain('already exists');
    });

    it('should return 400 when name is missing', async () => {
      await request(app.getHttpServer())
        .post('/tags')
        .send({})
        .expect(400);
    });
  });

  describe('GET /tags', () => {
    it('should return all tags (200)', async () => {
      await prisma.tag.create({ data: { name: 'alpha' } });
      await prisma.tag.create({ data: { name: 'beta' } });

      const res = await request(app.getHttpServer())
        .get('/tags')
        .expect(200);

      expect(res.body).toHaveLength(2);
      expect(res.body[0].name).toBe('alpha');
      expect(res.body[1].name).toBe('beta');
    });

    it('should return empty array when no tags exist (200)', async () => {
      await prisma.tag.deleteMany();

      const res = await request(app.getHttpServer())
        .get('/tags')
        .expect(200);

      expect(res.body).toHaveLength(0);
    });
  });

  describe('GET /tags/:id', () => {
    it('should return a single tag (200)', async () => {
      const tag = await prisma.tag.create({ data: { name: 'findme' } });

      const res = await request(app.getHttpServer())
        .get(`/tags/${tag.id}`)
        .expect(200);

      expect(res.body.id).toBe(tag.id);
      expect(res.body.name).toBe('findme');
    });

    it('should return 404 for nonexistent tag', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app.getHttpServer())
        .get(`/tags/${fakeId}`)
        .expect(404);

      expect(res.body.message).toContain('not found');
    });
  });

  describe('DELETE /tags/:id', () => {
    it('should delete a tag (200)', async () => {
      const tag = await prisma.tag.create({ data: { name: 'deleteme' } });

      await request(app.getHttpServer())
        .delete(`/tags/${tag.id}`)
        .expect(200);

      const res = await request(app.getHttpServer())
        .get(`/tags/${tag.id}`)
        .expect(404);

      expect(res.body.message).toContain('not found');
    });

    it('should return 404 when deleting nonexistent tag', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app.getHttpServer())
        .delete(`/tags/${fakeId}`)
        .expect(404);

      expect(res.body.message).toContain('not found');
    });
  });
});
