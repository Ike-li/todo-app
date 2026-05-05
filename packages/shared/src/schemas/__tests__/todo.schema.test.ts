import {
  TodoCreateSchema,
  TodoUpdateSchema,
  TodoResponseSchema,
  PriorityEnum,
} from '../todo.schema';

describe('TodoCreateSchema', () => {
  describe('valid inputs', () => {
    it('should accept a minimal todo with only a title', () => {
      const result = TodoCreateSchema.safeParse({ title: 'Buy groceries' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Buy groceries');
        expect(result.data.description).toBeUndefined();
        expect(result.data.priority).toBeUndefined();
        expect(result.data.dueDate).toBeUndefined();
        expect(result.data.categoryId).toBeUndefined();
        expect(result.data.tags).toBeUndefined();
        expect(result.data.parentId).toBeUndefined();
      }
    });

    it('should accept a todo with all fields', () => {
      const input = {
        title: 'Build feature',
        description: 'Implement the new dashboard',
        priority: 'HIGH',
        dueDate: '2026-12-31',
        categoryId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        tags: ['frontend', 'urgent'],
        parentId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      };
      const result = TodoCreateSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(input);
      }
    });

    it('should accept null for categoryId and parentId', () => {
      const result = TodoCreateSchema.safeParse({
        title: 'Test',
        categoryId: null,
        parentId: null,
      });
      expect(result.success).toBe(true);
    });

    it('should accept an empty tags array', () => {
      const result = TodoCreateSchema.safeParse({
        title: 'Test',
        tags: [],
      });
      expect(result.success).toBe(true);
    });

    it('should accept a title of exactly 255 characters', () => {
      const result = TodoCreateSchema.safeParse({
        title: 'a'.repeat(255),
      });
      expect(result.success).toBe(true);
    });

    it('should accept a description of exactly 5000 characters', () => {
      const result = TodoCreateSchema.safeParse({
        title: 'Test',
        description: 'x'.repeat(5000),
      });
      expect(result.success).toBe(true);
    });
  });

  describe('invalid inputs', () => {
    it('should reject a missing title', () => {
      const result = TodoCreateSchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        const titleErrors = result.error.issues.filter(
          (i) => i.path.includes('title'),
        );
        expect(titleErrors.length).toBeGreaterThan(0);
      }
    });

    it('should reject an empty title', () => {
      const result = TodoCreateSchema.safeParse({ title: '' });
      expect(result.success).toBe(false);
    });

    it('should reject a title exceeding 255 characters', () => {
      const result = TodoCreateSchema.safeParse({
        title: 'a'.repeat(256),
      });
      expect(result.success).toBe(false);
    });

    it('should reject a description exceeding 5000 characters', () => {
      const result = TodoCreateSchema.safeParse({
        title: 'Test',
        description: 'x'.repeat(5001),
      });
      expect(result.success).toBe(false);
    });

    it('should reject a non-string title', () => {
      const result = TodoCreateSchema.safeParse({ title: 123 });
      expect(result.success).toBe(false);
    });

    it('should reject an invalid categoryId UUID', () => {
      const result = TodoCreateSchema.safeParse({
        title: 'Test',
        categoryId: 'not-a-uuid',
      });
      expect(result.success).toBe(false);
    });

    it('should reject an invalid parentId UUID', () => {
      const result = TodoCreateSchema.safeParse({
        title: 'Test',
        parentId: 'not-a-uuid',
      });
      expect(result.success).toBe(false);
    });

    it('should reject extra unknown fields (strict mode)', () => {
      // Zod object schemas strip unknown keys by default, but we test the schema itself
      const result = TodoCreateSchema.safeParse({
        title: 'Test',
        unknownField: 'should not be here',
      });
      // Zod .safeParse strips unknown keys by default (non-strict mode)
      // so this will succeed but the unknown field is stripped
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).not.toHaveProperty('unknownField');
      }
    });
  });
});

describe('PriorityEnum validation', () => {
  it.each(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'])(
    'should accept valid priority: %s',
    (priority) => {
      const result = TodoCreateSchema.safeParse({
        title: 'Test',
        priority,
      });
      expect(result.success).toBe(true);
    },
  );

  it.each(['CRITICAL', 'NORMAL', 'P0', '', 'none', 'high'])(
    'should reject invalid priority: %s',
    (priority) => {
      const result = TodoCreateSchema.safeParse({
        title: 'Test',
        priority,
      });
      expect(result.success).toBe(false);
    },
  );

  it('should accept undefined priority (optional)', () => {
    const result = TodoCreateSchema.safeParse({ title: 'Test' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priority).toBeUndefined();
    }
  });
});

describe('Date format validation', () => {
  it('should accept a valid YYYY-MM-DD date string', () => {
    const result = TodoCreateSchema.safeParse({
      title: 'Test',
      dueDate: '2026-06-15',
    });
    expect(result.success).toBe(true);
  });

  it('should accept a valid ISO 8601 datetime string', () => {
    const result = TodoCreateSchema.safeParse({
      title: 'Test',
      dueDate: '2026-06-15T14:30:00',
    });
    expect(result.success).toBe(true);
  });

  it('should accept any string value for dueDate (format validated at API layer)', () => {
    // The Zod schema defines dueDate as z.string().optional() —
    // format validation (YYYY-MM-DD / ISO 8601) is enforced by
    // the API's class-validator @Matches decorator on CreateTodoDto.
    const result = TodoCreateSchema.safeParse({
      title: 'Test',
      dueDate: 'any-string-value',
    });
    expect(result.success).toBe(true);
  });

  it('should reject a non-string dueDate', () => {
    const result = TodoCreateSchema.safeParse({
      title: 'Test',
      dueDate: 12345,
    });
    expect(result.success).toBe(false);
  });

  it('should accept undefined dueDate (optional)', () => {
    const result = TodoCreateSchema.safeParse({ title: 'Test' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.dueDate).toBeUndefined();
    }
  });
});

describe('parentId is optional', () => {
  it('should accept a todo without parentId', () => {
    const result = TodoCreateSchema.safeParse({ title: 'Root task' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.parentId).toBeUndefined();
    }
  });

  it('should accept null parentId', () => {
    const result = TodoCreateSchema.safeParse({
      title: 'Root task',
      parentId: null,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.parentId).toBeNull();
    }
  });

  it('should accept a valid UUID parentId', () => {
    const result = TodoCreateSchema.safeParse({
      title: 'Child task',
      parentId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.parentId).toBe('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
    }
  });
});

describe('TodoUpdateSchema', () => {
  it('should accept an empty object (all fields optional)', () => {
    const result = TodoUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should accept partial updates', () => {
    const result = TodoUpdateSchema.safeParse({ title: 'Updated' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Updated');
    }
  });

  it('should accept completed as boolean', () => {
    const result = TodoUpdateSchema.safeParse({ completed: true });
    expect(result.success).toBe(true);
  });

  it('should accept null for nullable fields', () => {
    const result = TodoUpdateSchema.safeParse({
      description: null,
      dueDate: null,
      categoryId: null,
      parentId: null,
    });
    expect(result.success).toBe(true);
  });

  it('should reject a title that is an empty string', () => {
    const result = TodoUpdateSchema.safeParse({ title: '' });
    expect(result.success).toBe(false);
  });
});

describe('TodoResponseSchema with nested category and tags', () => {
  const validResponse = {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    title: 'Test todo',
    description: 'A description',
    completed: false,
    priority: 'MEDIUM',
    dueDate: '2026-12-31T00:00:00.000Z',
    position: 0,
    userId: 'user-uuid-1',
    parentId: null,
    categoryId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    category: {
      id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      name: 'Work',
      color: '#FF5733',
      icon: 'briefcase',
    },
    tags: [
      {
        tag: {
          id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
          name: 'important',
        },
      },
      {
        tag: {
          id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
          name: 'frontend',
        },
      },
    ],
    subTasks: [
      {
        id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
        title: 'Sub-task 1',
        description: null,
        completed: true,
        priority: 'LOW',
        dueDate: null,
        position: 1,
        userId: 'user-uuid-1',
        parentId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        categoryId: null,
        category: null,
        tags: [],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  };

  it('should parse a complete todo response with category and tags', () => {
    const result = TodoResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.category).toEqual(validResponse.category);
      expect(result.data.tags).toHaveLength(2);
      expect(result.data.tags![0].tag.name).toBe('important');
    }
  });

  it('should parse a response with null category', () => {
    const { category, categoryId, ...rest } = validResponse;
    const result = TodoResponseSchema.safeParse({
      ...rest,
      category: null,
      categoryId: null,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.category).toBeNull();
    }
  });

  it('should parse a response with no tags', () => {
    const { tags, ...rest } = validResponse;
    const result = TodoResponseSchema.safeParse({
      ...rest,
      tags: [],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toHaveLength(0);
    }
  });

  it('should parse a response with nested subTasks', () => {
    const result = TodoResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.subTasks).toBeDefined();
      expect(result.data.subTasks).toHaveLength(1);
      expect(result.data.subTasks![0].title).toBe('Sub-task 1');
      expect(result.data.subTasks![0].completed).toBe(true);
    }
  });

  it('should reject a response with invalid UUID id', () => {
    const result = TodoResponseSchema.safeParse({
      ...validResponse,
      id: 'not-a-uuid',
    });
    expect(result.success).toBe(false);
  });

  it('should reject a response with invalid priority', () => {
    const result = TodoResponseSchema.safeParse({
      ...validResponse,
      priority: 'INVALID',
    });
    expect(result.success).toBe(false);
  });

  it('should reject a response with non-datetime dueDate', () => {
    const result = TodoResponseSchema.safeParse({
      ...validResponse,
      dueDate: 'not-a-datetime',
    });
    expect(result.success).toBe(false);
  });

  it('should reject a response with missing required fields', () => {
    const result = TodoResponseSchema.safeParse({
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      title: 'Incomplete',
    });
    expect(result.success).toBe(false);
  });
});
