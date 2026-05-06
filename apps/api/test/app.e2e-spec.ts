/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * Comprehensive E2E test suite for the Todo App API.
 *
 * Uses a real PostgreSQL test database (postgres-test on port 5433).
 * Set DATABASE_URL before running:
 *   DATABASE_URL=postgresql://todo_user:todo_password@localhost:5433/todo_test
 *
 * Run with: pnpm --filter api test:e2e
 */

describe('Todo App API (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  // Tokens and user IDs for multi-user ownership tests
  let tokenA: string;
  let userIdA: string;
  let tokenB: string;
  let userIdB: string;

  // Helper: register a user and return token + id
  async function registerUser(
    email: string,
    password = 'password123',
    name?: string,
  ): Promise<{ token: string; userId: string }> {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password, name })
      .expect(201);

    const { accessToken } = res.body;

    // Decode the JWT payload to get the user ID
    const payload = JSON.parse(
      Buffer.from(accessToken.split('.')[1], 'base64').toString(),
    );

    return { token: accessToken, userId: payload.sub };
  }

  // Helper: auth header shorthand
  function auth(token: string) {
    return { Authorization: `Bearer ${token}` };
  }

  // ----------------------------------------------------------------
  // Setup & Teardown
  // ----------------------------------------------------------------

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

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

    // Clean all tables in correct order (foreign keys)
    await prisma.tagsOnTodos.deleteMany();
    await prisma.todo.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    // Final cleanup
    await prisma.tagsOnTodos.deleteMany();
    await prisma.todo.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });

  // ================================================================
  // 1. Auth Flow
  // ================================================================

  describe('Auth Flow', () => {
    describe('POST /auth/register', () => {
      it('should register user A and return an accessToken', async () => {
        const result = await registerUser(
          'userA-e2e@example.com',
          'password123',
          'User A',
        );
        tokenA = result.token;
        userIdA = result.userId;

        expect(tokenA).toBeDefined();
        expect(userIdA).toBeDefined();
      });

      it('should register user B and return an accessToken', async () => {
        const result = await registerUser(
          'userB-e2e@example.com',
          'password123',
          'User B',
        );
        tokenB = result.token;
        userIdB = result.userId;

        expect(tokenB).toBeDefined();
        expect(userIdB).toBeDefined();
      });

      it('should reject duplicate email with 409', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/register')
          .send({ email: 'userA-e2e@example.com', password: 'password123' })
          .expect(409);

        expect(res.body.message).toContain('Email already exists');
      });

      it('should reject invalid email with 400', async () => {
        await request(app.getHttpServer())
          .post('/auth/register')
          .send({ email: 'not-an-email', password: 'password123' })
          .expect(400);
      });

      it('should reject short password with 400', async () => {
        await request(app.getHttpServer())
          .post('/auth/register')
          .send({ email: 'short-pw@example.com', password: 'short' })
          .expect(400);
      });
    });

    describe('POST /auth/login', () => {
      it('should login and return an accessToken', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: 'userA-e2e@example.com', password: 'password123' })
          .expect(200);

        expect(res.body).toHaveProperty('accessToken');
        expect(typeof res.body.accessToken).toBe('string');
      });

      it('should reject wrong password with 401', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: 'userA-e2e@example.com', password: 'wrongpassword' })
          .expect(401);

        expect(res.body.message).toContain('Invalid credentials');
      });

      it('should reject non-existent user with 401', async () => {
        await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: 'nobody@example.com', password: 'password123' })
          .expect(401);
      });
    });

    describe('GET /auth/me', () => {
      it('should return the current user profile', async () => {
        const res = await request(app.getHttpServer())
          .get('/auth/me')
          .set(auth(tokenA))
          .expect(200);

        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('email', 'userA-e2e@example.com');
      });

      it('should return 401 without a token', async () => {
        await request(app.getHttpServer()).get('/auth/me').expect(401);
      });

      it('should return 401 with an invalid token', async () => {
        await request(app.getHttpServer())
          .get('/auth/me')
          .set({ Authorization: 'Bearer invalid.token.here' })
          .expect(401);
      });
    });
  });

  // ================================================================
  // 2. Todos CRUD (with priority, category, tags)
  // ================================================================

  describe('Todos CRUD', () => {
    let todoId: string;
    let categoryId: string;

    beforeAll(async () => {
      // Create a category for user A
      const catRes = await request(app.getHttpServer())
        .post('/categories')
        .set(auth(tokenA))
        .send({ name: 'Work', color: '#FF5733', icon: 'briefcase' })
        .expect(201);
      categoryId = catRes.body.id;

      // Create tags
      await request(app.getHttpServer())
        .post('/tags')
        .set(auth(tokenA))
        .send({ name: 'important' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/tags')
        .set(auth(tokenA))
        .send({ name: 'urgent-tag' })
        .expect(201);
    });

    describe('POST /todos', () => {
      it('should create a todo with all fields', async () => {
        const res = await request(app.getHttpServer())
          .post('/todos')
          .set(auth(tokenA))
          .send({
            title: 'Build E2E tests',
            description: 'Write comprehensive tests for the API',
            priority: 'HIGH',
            dueDate: '2026-12-31',
            categoryId,
            tags: ['important', 'urgent-tag'],
          })
          .expect(201);

        expect(res.body.title).toBe('Build E2E tests');
        expect(res.body.description).toBe(
          'Write comprehensive tests for the API',
        );
        expect(res.body.priority).toBe('HIGH');
        expect(res.body.completed).toBe(false);
        expect(res.body.category).toBeDefined();
        expect(res.body.category.id).toBe(categoryId);
        expect(res.body.tags).toHaveLength(2);
        todoId = res.body.id;
      });

      it('should create a minimal todo with only a title', async () => {
        const res = await request(app.getHttpServer())
          .post('/todos')
          .set(auth(tokenA))
          .send({ title: 'Minimal todo' })
          .expect(201);

        expect(res.body.title).toBe('Minimal todo');
        expect(res.body.completed).toBe(false);
        expect(res.body.priority).toBe('NONE');
      });

      it('should reject a todo without a title (400)', async () => {
        await request(app.getHttpServer())
          .post('/todos')
          .set(auth(tokenA))
          .send({ description: 'No title' })
          .expect(400);
      });

      it('should reject a title exceeding 255 chars (400)', async () => {
        await request(app.getHttpServer())
          .post('/todos')
          .set(auth(tokenA))
          .send({ title: 'a'.repeat(256) })
          .expect(400);
      });

      it('should reject an invalid priority value (400)', async () => {
        await request(app.getHttpServer())
          .post('/todos')
          .set(auth(tokenA))
          .send({ title: 'Bad priority', priority: 'CRITICAL' })
          .expect(400);
      });

      it('should reject an invalid dueDate format (400)', async () => {
        await request(app.getHttpServer())
          .post('/todos')
          .set(auth(tokenA))
          .send({ title: 'Bad date', dueDate: 'not-a-date' })
          .expect(400);
      });

      it('should reject an invalid categoryId (400)', async () => {
        await request(app.getHttpServer())
          .post('/todos')
          .set(auth(tokenA))
          .send({ title: 'Bad category', categoryId: 'not-a-uuid' })
          .expect(400);
      });
    });

    describe('GET /todos', () => {
      it('should return paginated todos for the authenticated user', async () => {
        const res = await request(app.getHttpServer())
          .get('/todos')
          .set(auth(tokenA))
          .expect(200);

        expect(res.body).toHaveProperty('data');
        expect(res.body).toHaveProperty('total');
        expect(res.body).toHaveProperty('page', 1);
        expect(res.body).toHaveProperty('limit', 20);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      });

      it('should support pagination via page and limit query params', async () => {
        const res = await request(app.getHttpServer())
          .get('/todos?page=1&limit=1')
          .set(auth(tokenA))
          .expect(200);

        expect(res.body.data).toHaveLength(1);
        expect(res.body.limit).toBe(1);
      });

      it('should support filtering by completed status', async () => {
        const res = await request(app.getHttpServer())
          .get('/todos?completed=false')
          .set(auth(tokenA))
          .expect(200);

        for (const todo of res.body.data) {
          expect(todo.completed).toBe(false);
        }
      });

      it('should support search by title', async () => {
        const res = await request(app.getHttpServer())
          .get('/todos?search=E2E')
          .set(auth(tokenA))
          .expect(200);

        expect(res.body.data.length).toBeGreaterThanOrEqual(1);
        expect(res.body.data.some((t: any) => t.title.includes('E2E'))).toBe(
          true,
        );
      });
    });

    describe('GET /todos/:id', () => {
      it('should return a single todo with relations', async () => {
        const res = await request(app.getHttpServer())
          .get(`/todos/${todoId}`)
          .set(auth(tokenA))
          .expect(200);

        expect(res.body.id).toBe(todoId);
        expect(res.body.title).toBe('Build E2E tests');
        expect(res.body.category).toBeDefined();
        expect(res.body.tags).toBeDefined();
      });

      it('should return 404 for a non-existent todo', async () => {
        await request(app.getHttpServer())
          .get('/todos/00000000-0000-0000-0000-000000000000')
          .set(auth(tokenA))
          .expect(404);
      });

      it('should return 400 for an invalid UUID', async () => {
        await request(app.getHttpServer())
          .get('/todos/not-a-uuid')
          .set(auth(tokenA))
          .expect(400);
      });
    });

    describe('PATCH /todos/:id', () => {
      it('should update todo fields', async () => {
        const res = await request(app.getHttpServer())
          .patch(`/todos/${todoId}`)
          .set(auth(tokenA))
          .send({
            title: 'Updated E2E tests',
            description: 'Updated description',
            priority: 'URGENT',
          })
          .expect(200);

        expect(res.body.title).toBe('Updated E2E tests');
        expect(res.body.description).toBe('Updated description');
        expect(res.body.priority).toBe('URGENT');
      });

      it('should update todo tags (replacing existing)', async () => {
        const res = await request(app.getHttpServer())
          .patch(`/todos/${todoId}`)
          .set(auth(tokenA))
          .send({ tags: ['important'] })
          .expect(200);

        expect(res.body.tags).toHaveLength(1);
      });

      it('should clear the dueDate when set to null', async () => {
        const res = await request(app.getHttpServer())
          .patch(`/todos/${todoId}`)
          .set(auth(tokenA))
          .send({ dueDate: null })
          .expect(200);

        expect(res.body.dueDate).toBeNull();
      });

      it('should return 404 when updating a non-existent todo', async () => {
        await request(app.getHttpServer())
          .patch('/todos/00000000-0000-0000-0000-000000000000')
          .set(auth(tokenA))
          .send({ title: 'Ghost' })
          .expect(404);
      });
    });

    describe('PATCH /todos/:id/toggle', () => {
      it('should toggle completed to true', async () => {
        const res = await request(app.getHttpServer())
          .patch(`/todos/${todoId}/toggle`)
          .set(auth(tokenA))
          .expect(200);

        expect(res.body.completed).toBe(true);
      });

      it('should toggle completed back to false', async () => {
        const res = await request(app.getHttpServer())
          .patch(`/todos/${todoId}/toggle`)
          .set(auth(tokenA))
          .expect(200);

        expect(res.body.completed).toBe(false);
      });
    });

    describe('DELETE /todos/:id', () => {
      it('should delete a todo', async () => {
        // Create a throwaway todo
        const createRes = await request(app.getHttpServer())
          .post('/todos')
          .set(auth(tokenA))
          .send({ title: 'Delete me' })
          .expect(201);

        const deleteId = createRes.body.id;

        await request(app.getHttpServer())
          .delete(`/todos/${deleteId}`)
          .set(auth(tokenA))
          .expect(200);

        // Verify it's gone
        await request(app.getHttpServer())
          .get(`/todos/${deleteId}`)
          .set(auth(tokenA))
          .expect(404);
      });

      it('should return 404 when deleting a non-existent todo', async () => {
        await request(app.getHttpServer())
          .delete('/todos/00000000-0000-0000-0000-000000000000')
          .set(auth(tokenA))
          .expect(404);
      });
    });
  });

  // ================================================================
  // 3. Categories CRUD
  // ================================================================

  describe('Categories CRUD', () => {
    let catId: string;

    describe('POST /categories', () => {
      it('should create a category', async () => {
        const res = await request(app.getHttpServer())
          .post('/categories')
          .set(auth(tokenA))
          .send({ name: 'Personal', color: '#00FF00', icon: 'home' })
          .expect(201);

        expect(res.body.name).toBe('Personal');
        expect(res.body.color).toBe('#00FF00');
        expect(res.body.icon).toBe('home');
        catId = res.body.id;
      });

      it('should create a category with only a name', async () => {
        const res = await request(app.getHttpServer())
          .post('/categories')
          .set(auth(tokenA))
          .send({ name: 'Minimal Category' })
          .expect(201);

        expect(res.body.name).toBe('Minimal Category');
      });

      it('should reject duplicate category name for the same user (409)', async () => {
        const res = await request(app.getHttpServer())
          .post('/categories')
          .set(auth(tokenA))
          .send({ name: 'Personal' })
          .expect(409);

        expect(res.body.message).toContain('already exists');
      });

      it('should reject empty name (400)', async () => {
        await request(app.getHttpServer())
          .post('/categories')
          .set(auth(tokenA))
          .send({ name: '' })
          .expect(400);
      });

      it('should reject invalid hex color (400)', async () => {
        await request(app.getHttpServer())
          .post('/categories')
          .set(auth(tokenA))
          .send({ name: 'Bad Color', color: 'red' })
          .expect(400);
      });
    });

    describe('GET /categories', () => {
      it('should list all categories for the authenticated user', async () => {
        const res = await request(app.getHttpServer())
          .get('/categories')
          .set(auth(tokenA))
          .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(3); // Work, Personal, Minimal Category
        // Should be sorted by name asc
        const names = res.body.map((c: any) => c.name);
        expect(names).toEqual([...names].sort());
      });

      it('should return only the authenticated user categories', async () => {
        const res = await request(app.getHttpServer())
          .get('/categories')
          .set(auth(tokenB))
          .expect(200);

        // User B has no categories
        expect(res.body).toHaveLength(0);
      });
    });

    describe('GET /categories/:id', () => {
      it('should return a single category', async () => {
        const res = await request(app.getHttpServer())
          .get(`/categories/${catId}`)
          .set(auth(tokenA))
          .expect(200);

        expect(res.body.id).toBe(catId);
        expect(res.body.name).toBe('Personal');
      });
    });

    describe('PATCH /categories/:id', () => {
      it('should update a category', async () => {
        const res = await request(app.getHttpServer())
          .patch(`/categories/${catId}`)
          .set(auth(tokenA))
          .send({ name: 'Personal Life', color: '#0000FF' })
          .expect(200);

        expect(res.body.name).toBe('Personal Life');
        expect(res.body.color).toBe('#0000FF');
      });

      it('should reject duplicate name when renaming to existing (409)', async () => {
        const res = await request(app.getHttpServer())
          .patch(`/categories/${catId}`)
          .set(auth(tokenA))
          .send({ name: 'Work' })
          .expect(409);

        expect(res.body.message).toContain('already exists');
      });
    });

    describe('DELETE /categories/:id', () => {
      it('should delete a category', async () => {
        // Create a throwaway category
        const createRes = await request(app.getHttpServer())
          .post('/categories')
          .set(auth(tokenA))
          .send({ name: 'Throwaway' })
          .expect(201);

        await request(app.getHttpServer())
          .delete(`/categories/${createRes.body.id}`)
          .set(auth(tokenA))
          .expect(200);

        // Verify it's gone
        await request(app.getHttpServer())
          .get(`/categories/${createRes.body.id}`)
          .set(auth(tokenA))
          .expect(404);
      });

      it('should return 404 for non-existent category', async () => {
        await request(app.getHttpServer())
          .delete('/categories/00000000-0000-0000-0000-000000000000')
          .set(auth(tokenA))
          .expect(404);
      });
    });
  });

  // ================================================================
  // 4. Tags CRUD
  // ================================================================

  describe('Tags CRUD', () => {
    describe('POST /tags', () => {
      it('should create a tag', async () => {
        const res = await request(app.getHttpServer())
          .post('/tags')
          .set(auth(tokenA))
          .send({ name: 'frontend' })
          .expect(201);

        expect(res.body.name).toBe('frontend');
      });

      it('should normalize tag name to lowercase', async () => {
        const res = await request(app.getHttpServer())
          .post('/tags')
          .set(auth(tokenA))
          .send({ name: 'BACKEND' })
          .expect(201);

        expect(res.body.name).toBe('backend');
      });

      it('should reject duplicate tag name (409)', async () => {
        const res = await request(app.getHttpServer())
          .post('/tags')
          .set(auth(tokenA))
          .send({ name: 'frontend' })
          .expect(409);

        expect(res.body.message).toContain('already exists');
      });

      it('should reject empty name (400)', async () => {
        await request(app.getHttpServer())
          .post('/tags')
          .set(auth(tokenA))
          .send({ name: '' })
          .expect(400);
      });
    });

    describe('GET /tags', () => {
      it('should list all tags', async () => {
        const res = await request(app.getHttpServer())
          .get('/tags')
          .set(auth(tokenA))
          .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
        // Should be sorted by name asc
        const names = res.body.map((t: any) => t.name);
        expect(names).toEqual([...names].sort());
      });
    });

    describe('DELETE /tags/:id', () => {
      it('should delete a tag', async () => {
        // Create a throwaway tag
        const createRes = await request(app.getHttpServer())
          .post('/tags')
          .set(auth(tokenA))
          .send({ name: 'throwaway-tag' })
          .expect(201);

        await request(app.getHttpServer())
          .delete(`/tags/${createRes.body.id}`)
          .set(auth(tokenA))
          .expect(200);

        // Verify it's gone
        await request(app.getHttpServer())
          .get(`/tags/${createRes.body.id}`)
          .set(auth(tokenA))
          .expect(404);
      });

      it('should return 404 for non-existent tag', async () => {
        await request(app.getHttpServer())
          .delete('/tags/00000000-0000-0000-0000-000000000000')
          .set(auth(tokenA))
          .expect(404);
      });
    });
  });

  // ================================================================
  // 5. Sub-tasks
  // ================================================================

  describe('Sub-tasks', () => {
    let parentTodoId: string;

    it('should create a parent todo', async () => {
      const res = await request(app.getHttpServer())
        .post('/todos')
        .set(auth(tokenA))
        .send({
          title: 'Parent project',
          description: 'A todo with sub-tasks',
          priority: 'HIGH',
        })
        .expect(201);

      parentTodoId = res.body.id;
      expect(res.body.parentId).toBeNull();
    });

    it('should create sub-tasks linked to the parent', async () => {
      const res1 = await request(app.getHttpServer())
        .post('/todos')
        .set(auth(tokenA))
        .send({
          title: 'Sub-task 1',
          parentId: parentTodoId,
          priority: 'MEDIUM',
        })
        .expect(201);

      expect(res1.body.parentId).toBe(parentTodoId);

      const res2 = await request(app.getHttpServer())
        .post('/todos')
        .set(auth(tokenA))
        .send({
          title: 'Sub-task 2',
          parentId: parentTodoId,
          priority: 'LOW',
        })
        .expect(201);

      expect(res2.body.parentId).toBe(parentTodoId);
    });

    it('should include sub-tasks when fetching the parent todo', async () => {
      const res = await request(app.getHttpServer())
        .get(`/todos/${parentTodoId}`)
        .set(auth(tokenA))
        .expect(200);

      expect(res.body.id).toBe(parentTodoId);
      expect(res.body.subTasks).toBeDefined();
      expect(res.body.subTasks).toHaveLength(2);

      const subTaskTitles = res.body.subTasks.map((s: any) => s.title);
      expect(subTaskTitles).toContain('Sub-task 1');
      expect(subTaskTitles).toContain('Sub-task 2');
    });

    it('should include sub-tasks in the paginated list', async () => {
      const res = await request(app.getHttpServer())
        .get('/todos')
        .set(auth(tokenA))
        .expect(200);

      const parent = res.body.data.find((t: any) => t.id === parentTodoId);
      expect(parent).toBeDefined();
      expect(parent.subTasks).toHaveLength(2);
    });

    it('should fetch sub-tasks via GET /todos/:id/subtasks', async () => {
      const res = await request(app.getHttpServer())
        .get(`/todos/${parentTodoId}/subtasks`)
        .set(auth(tokenA))
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
    });

    it('should return 404 for subtasks of non-existent parent', async () => {
      await request(app.getHttpServer())
        .get('/todos/00000000-0000-0000-0000-000000000000/subtasks')
        .set(auth(tokenA))
        .expect(404);
    });
  });

  // ================================================================
  // 6. Authorization (unauthenticated requests)
  // ================================================================

  describe('Authorization', () => {
    const protectedEndpoints: Array<{
      method: 'get' | 'post' | 'patch' | 'delete';
      path: string;
    }> = [
      { method: 'get', path: '/auth/me' },
      { method: 'get', path: '/todos' },
      { method: 'post', path: '/todos' },
      { method: 'get', path: '/categories' },
      { method: 'post', path: '/categories' },
      { method: 'get', path: '/tags' },
      { method: 'post', path: '/tags' },
    ];

    it.each(protectedEndpoints)(
      'should return 401 for $method $path without auth',
      async ({ method, path }) => {
        await request(app.getHttpServer())[method](path).expect(401);
      },
    );

    it('should return 401 for PATCH /todos/:id without auth', async () => {
      await request(app.getHttpServer())
        .patch('/todos/00000000-0000-0000-0000-000000000000')
        .send({ title: 'Hacked' })
        .expect(401);
    });

    it('should return 401 for DELETE /todos/:id without auth', async () => {
      await request(app.getHttpServer())
        .delete('/todos/00000000-0000-0000-0000-000000000000')
        .expect(401);
    });

    it('should return 401 for PATCH /todos/:id/toggle without auth', async () => {
      await request(app.getHttpServer())
        .patch('/todos/00000000-0000-0000-0000-000000000000/toggle')
        .expect(401);
    });
  });

  // ================================================================
  // 7. Ownership (user A cannot access user B's resources)
  // ================================================================

  describe('Ownership', () => {
    let userBTodoId: string;
    let userBCategoryId: string;

    beforeAll(async () => {
      // User B creates a todo and category
      const todoRes = await request(app.getHttpServer())
        .post('/todos')
        .set(auth(tokenB))
        .send({ title: 'User B private todo', priority: 'MEDIUM' })
        .expect(201);
      userBTodoId = todoRes.body.id;

      const catRes = await request(app.getHttpServer())
        .post('/categories')
        .set(auth(tokenB))
        .send({ name: 'User B category', color: '#ABCDEF' })
        .expect(201);
      userBCategoryId = catRes.body.id;
    });

    describe('Todos', () => {
      it('should not list user B todos when authenticated as user A', async () => {
        const res = await request(app.getHttpServer())
          .get('/todos')
          .set(auth(tokenA))
          .expect(200);

        const ids = res.body.data.map((t: any) => t.id);
        expect(ids).not.toContain(userBTodoId);
      });

      it('should return 403 when user A tries to read user B todo by ID', async () => {
        await request(app.getHttpServer())
          .get(`/todos/${userBTodoId}`)
          .set(auth(tokenA))
          .expect(403);
      });

      it('should return 403 when user A tries to update user B todo', async () => {
        await request(app.getHttpServer())
          .patch(`/todos/${userBTodoId}`)
          .set(auth(tokenA))
          .send({ title: 'Hijacked' })
          .expect(403);
      });

      it('should return 403 when user A tries to toggle user B todo', async () => {
        await request(app.getHttpServer())
          .patch(`/todos/${userBTodoId}/toggle`)
          .set(auth(tokenA))
          .expect(403);
      });

      it('should return 403 when user A tries to delete user B todo', async () => {
        await request(app.getHttpServer())
          .delete(`/todos/${userBTodoId}`)
          .set(auth(tokenA))
          .expect(403);
      });

      it('should return 403 when user A tries to get user B sub-tasks', async () => {
        await request(app.getHttpServer())
          .get(`/todos/${userBTodoId}/subtasks`)
          .set(auth(tokenA))
          .expect(403);
      });
    });

    describe('Categories', () => {
      it('should not list user B categories when authenticated as user A', async () => {
        const res = await request(app.getHttpServer())
          .get('/categories')
          .set(auth(tokenA))
          .expect(200);

        const ids = res.body.map((c: any) => c.id);
        expect(ids).not.toContain(userBCategoryId);
      });

      it('should return 403 when user A tries to read user B category', async () => {
        await request(app.getHttpServer())
          .get(`/categories/${userBCategoryId}`)
          .set(auth(tokenA))
          .expect(403);
      });

      it('should return 403 when user A tries to update user B category', async () => {
        await request(app.getHttpServer())
          .patch(`/categories/${userBCategoryId}`)
          .set(auth(tokenA))
          .send({ name: 'Hijacked Category' })
          .expect(403);
      });

      it('should return 403 when user A tries to delete user B category', async () => {
        await request(app.getHttpServer())
          .delete(`/categories/${userBCategoryId}`)
          .set(auth(tokenA))
          .expect(403);
      });
    });
  });
});
