import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';

describe('TodosController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userId: string;

  beforeAll(async () => {
    // Create the app with a deferred user ID for the guard
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

    // Create a test user
    const user = await prisma.user.create({
      data: {
        email: 'test-todo-e2e@example.com',
        password: 'hashedpassword',
        name: 'E2E Test User',
      },
    });
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.todo.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await prisma.todo.deleteMany({ where: { userId } });
  });

  describe('POST /todos', () => {
    it('should create a todo (201)', async () => {
      const res = await request(app.getHttpServer())
        .post('/todos')
        .send({ title: 'E2E Todo', description: 'E2E Description' })
        .expect(201);

      expect(res.body.title).toBe('E2E Todo');
      expect(res.body.description).toBe('E2E Description');
      expect(res.body.completed).toBe(false);
      expect(res.body.id).toBeDefined();
    });
  });

  describe('GET /todos', () => {
    it('should return paginated todos (200)', async () => {
      await prisma.todo.create({
        data: {
          title: 'Test Todo',
          user: { connect: { id: userId } },
        },
      });

      const res = await request(app.getHttpServer())
        .get('/todos')
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.total).toBe(1);
      expect(res.body.page).toBe(1);
      expect(res.body.limit).toBe(20);
    });
  });

  describe('GET /todos/:id', () => {
    it('should return a single todo (200)', async () => {
      const todo = await prisma.todo.create({
        data: {
          title: 'Find One Todo',
          user: { connect: { id: userId } },
        },
      });

      const res = await request(app.getHttpServer())
        .get(`/todos/${todo.id}`)
        .expect(200);

      expect(res.body.id).toBe(todo.id);
      expect(res.body.title).toBe('Find One Todo');
    });
  });

  describe('PATCH /todos/:id', () => {
    it('should update a todo (200)', async () => {
      const todo = await prisma.todo.create({
        data: {
          title: 'Original Title',
          user: { connect: { id: userId } },
        },
      });

      const res = await request(app.getHttpServer())
        .patch(`/todos/${todo.id}`)
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(res.body.title).toBe('Updated Title');
    });
  });

  describe('PATCH /todos/:id/toggle', () => {
    it('should toggle completed status (200)', async () => {
      const todo = await prisma.todo.create({
        data: {
          title: 'Toggle Todo',
          user: { connect: { id: userId } },
        },
      });

      const res = await request(app.getHttpServer())
        .patch(`/todos/${todo.id}/toggle`)
        .expect(200);

      expect(res.body.completed).toBe(true);

      const res2 = await request(app.getHttpServer())
        .patch(`/todos/${todo.id}/toggle`)
        .expect(200);

      expect(res2.body.completed).toBe(false);
    });
  });

  describe('DELETE /todos/:id', () => {
    it('should remove a todo (200)', async () => {
      const todo = await prisma.todo.create({
        data: {
          title: 'Delete Todo',
          user: { connect: { id: userId } },
        },
      });

      await request(app.getHttpServer())
        .delete(`/todos/${todo.id}`)
        .expect(200);

      // Verify deletion
      await request(app.getHttpServer())
        .get(`/todos/${todo.id}`)
        .expect(404);
    });
  });
});
