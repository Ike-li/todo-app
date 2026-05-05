import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';

describe('CategoriesController (e2e)', () => {
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
        email: 'test-category-e2e@example.com',
        password: 'hashedpassword',
        name: 'E2E Category User',
      },
    });
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.category.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await prisma.category.deleteMany({ where: { userId } });
  });

  describe('POST /categories', () => {
    it('should create a category (201)', async () => {
      const res = await request(app.getHttpServer())
        .post('/categories')
        .send({ name: 'Work', color: '#ff5733', icon: 'briefcase' })
        .expect(201);

      expect(res.body.name).toBe('Work');
      expect(res.body.color).toBe('#ff5733');
      expect(res.body.icon).toBe('briefcase');
      expect(res.body.id).toBeDefined();
      expect(res.body.userId).toBe(userId);
    });

    it('should create a category with only required fields (201)', async () => {
      const res = await request(app.getHttpServer())
        .post('/categories')
        .send({ name: 'Personal' })
        .expect(201);

      expect(res.body.name).toBe('Personal');
      expect(res.body.color).toBeNull();
      expect(res.body.icon).toBeNull();
    });

    it('should return 409 for duplicate category name', async () => {
      await request(app.getHttpServer())
        .post('/categories')
        .send({ name: 'Duplicate' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/categories')
        .send({ name: 'Duplicate' })
        .expect(409);

      expect(res.body.message).toContain('already exists');
    });

    it('should return 400 when name is missing', async () => {
      await request(app.getHttpServer())
        .post('/categories')
        .send({ color: '#ff5733' })
        .expect(400);
    });

    it('should return 400 for invalid color format', async () => {
      await request(app.getHttpServer())
        .post('/categories')
        .send({ name: 'Bad Color', color: 'not-a-hex-color' })
        .expect(400);
    });
  });

  describe('GET /categories', () => {
    it('should return all categories for the user (200)', async () => {
      await prisma.category.create({
        data: {
          name: 'Cat A',
          user: { connect: { id: userId } },
        },
      });
      await prisma.category.create({
        data: {
          name: 'Cat B',
          user: { connect: { id: userId } },
        },
      });

      const res = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      expect(res.body).toHaveLength(2);
      expect(res.body[0].name).toBe('Cat A');
      expect(res.body[1].name).toBe('Cat B');
    });

    it('should return empty array when no categories exist (200)', async () => {
      const res = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      expect(res.body).toHaveLength(0);
    });
  });

  describe('GET /categories/:id', () => {
    it('should return a single category (200)', async () => {
      const category = await prisma.category.create({
        data: {
          name: 'Find Me',
          color: '#aabbcc',
          icon: 'star',
          user: { connect: { id: userId } },
        },
      });

      const res = await request(app.getHttpServer())
        .get(`/categories/${category.id}`)
        .expect(200);

      expect(res.body.id).toBe(category.id);
      expect(res.body.name).toBe('Find Me');
      expect(res.body.color).toBe('#aabbcc');
      expect(res.body.icon).toBe('star');
    });

    it('should return 404 for nonexistent category', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app.getHttpServer())
        .get(`/categories/${fakeId}`)
        .expect(404);

      expect(res.body.message).toContain('not found');
    });
  });

  describe('PATCH /categories/:id', () => {
    it('should update a category (200)', async () => {
      const category = await prisma.category.create({
        data: {
          name: 'Old Name',
          color: '#111111',
          user: { connect: { id: userId } },
        },
      });

      const res = await request(app.getHttpServer())
        .patch(`/categories/${category.id}`)
        .send({ name: 'New Name', color: '#222222' })
        .expect(200);

      expect(res.body.name).toBe('New Name');
      expect(res.body.color).toBe('#222222');
    });

    it('should return 404 when updating nonexistent category', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app.getHttpServer())
        .patch(`/categories/${fakeId}`)
        .send({ name: 'Nope' })
        .expect(404);

      expect(res.body.message).toContain('not found');
    });

    it('should return 409 when renaming to an existing category name', async () => {
      await prisma.category.create({
        data: { name: 'Taken', user: { connect: { id: userId } } },
      });
      const category = await prisma.category.create({
        data: { name: 'Rename Me', user: { connect: { id: userId } } },
      });

      const res = await request(app.getHttpServer())
        .patch(`/categories/${category.id}`)
        .send({ name: 'Taken' })
        .expect(409);

      expect(res.body.message).toContain('already exists');
    });
  });

  describe('DELETE /categories/:id', () => {
    it('should delete a category (200)', async () => {
      const category = await prisma.category.create({
        data: {
          name: 'Delete Me',
          user: { connect: { id: userId } },
        },
      });

      await request(app.getHttpServer())
        .delete(`/categories/${category.id}`)
        .expect(200);

      const res = await request(app.getHttpServer())
        .get(`/categories/${category.id}`)
        .expect(404);

      expect(res.body.message).toContain('not found');
    });

    it('should return 404 when deleting nonexistent category', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app.getHttpServer())
        .delete(`/categories/${fakeId}`)
        .expect(404);

      expect(res.body.message).toContain('not found');
    });
  });
});
