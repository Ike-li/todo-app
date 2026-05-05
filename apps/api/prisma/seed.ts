import { PrismaClient, Priority } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create demo user (idempotent via upsert)
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      password: hashedPassword,
      name: 'Demo User',
    },
  });

  // Create categories
  const work = await prisma.category.upsert({
    where: { userId_name: { userId: user.id, name: 'Work' } },
    update: {},
    create: {
      name: 'Work',
      color: '#3B82F6',
      icon: 'briefcase',
      userId: user.id,
    },
  });

  const personal = await prisma.category.upsert({
    where: { userId_name: { userId: user.id, name: 'Personal' } },
    update: {},
    create: {
      name: 'Personal',
      color: '#10B981',
      icon: 'account',
      userId: user.id,
    },
  });

  // Create tags
  const urgent = await prisma.tag.upsert({
    where: { name: 'urgent' },
    update: {},
    create: { name: 'urgent' },
  });

  const bug = await prisma.tag.upsert({
    where: { name: 'bug' },
    update: {},
    create: { name: 'bug' },
  });

  const feature = await prisma.tag.upsert({
    where: { name: 'feature' },
    update: {},
    create: { name: 'feature' },
  });

  // Create 5 sample todos with varying priorities and completion states
  const todosData = [
    {
      id: 'seed-todo-1',
      title: 'Review pull requests',
      description: 'Review open PRs on the main repository',
      completed: false,
      priority: Priority.HIGH,
      position: 0,
      categoryId: work.id,
      userId: user.id,
    },
    {
      id: 'seed-todo-2',
      title: 'Fix authentication bug',
      description: 'Users are getting logged out unexpectedly after 5 minutes',
      completed: false,
      priority: Priority.URGENT,
      position: 1,
      categoryId: work.id,
      userId: user.id,
    },
    {
      id: 'seed-todo-3',
      title: 'Write API documentation',
      description: 'Document all REST endpoints with request/response examples',
      completed: true,
      priority: Priority.MEDIUM,
      position: 2,
      categoryId: work.id,
      userId: user.id,
    },
    {
      id: 'seed-todo-4',
      title: 'Grocery shopping',
      description: 'Buy fruits, vegetables, and snacks for the week',
      completed: false,
      priority: Priority.LOW,
      position: 3,
      categoryId: personal.id,
      userId: user.id,
    },
    {
      id: 'seed-todo-5',
      title: 'Plan weekend trip',
      description: 'Research destinations and book accommodation',
      completed: true,
      priority: Priority.NONE,
      position: 4,
      categoryId: personal.id,
      userId: user.id,
    },
  ];

  for (const todoData of todosData) {
    await prisma.todo.upsert({
      where: { id: todoData.id },
      update: {
        title: todoData.title,
        description: todoData.description,
        completed: todoData.completed,
        priority: todoData.priority,
        position: todoData.position,
        categoryId: todoData.categoryId,
      },
      create: todoData,
    });
  }

  // Assign tags to todos via TagsOnTodos
  // seed-todo-1: urgent
  await prisma.tagsOnTodos.upsert({
    where: { todoId_tagId: { todoId: 'seed-todo-1', tagId: urgent.id } },
    update: {},
    create: { todoId: 'seed-todo-1', tagId: urgent.id },
  });

  // seed-todo-2: urgent, bug
  await prisma.tagsOnTodos.upsert({
    where: { todoId_tagId: { todoId: 'seed-todo-2', tagId: urgent.id } },
    update: {},
    create: { todoId: 'seed-todo-2', tagId: urgent.id },
  });
  await prisma.tagsOnTodos.upsert({
    where: { todoId_tagId: { todoId: 'seed-todo-2', tagId: bug.id } },
    update: {},
    create: { todoId: 'seed-todo-2', tagId: bug.id },
  });

  // seed-todo-3: feature
  await prisma.tagsOnTodos.upsert({
    where: { todoId_tagId: { todoId: 'seed-todo-3', tagId: feature.id } },
    update: {},
    create: { todoId: 'seed-todo-3', tagId: feature.id },
  });

  // seed-todo-5: feature
  await prisma.tagsOnTodos.upsert({
    where: { todoId_tagId: { todoId: 'seed-todo-5', tagId: feature.id } },
    update: {},
    create: { todoId: 'seed-todo-5', tagId: feature.id },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
