const test = require('node:test');
const assert = require('node:assert/strict');
const { UnauthorizedException } = require('@nestjs/common');
const { withMocks } = require('./test-helpers');

test('AuthService signup stores an admin user when email is in admin list', async () => {
  const calls = [];
  const mockDb = {
    get: async () => null,
    run: async (...args) => {
      calls.push(args);
      return { lastID: 1, changes: 1 };
    },
  };

  const scoped = withMocks('../src/modules/auth/auth.service', {
    '../../shared/database': mockDb,
    'bcrypt': {
      hash: async (value) => `hashed:${value}`,
      compare: async () => true,
    },
    '../../shared/jwt': { createToken: () => 'signed-token' },
    '../../shared/config': {
      config: {
        adminEmails: ['admin@endopai.com'],
        jwtExpiresInMinutes: 60,
      },
    },
  });

  try {
    const { AuthService } = scoped.loaded;
    const service = new AuthService();

    await service.signup({
      email: 'Admin@Endopai.com',
      name: 'Nika',
      surname: 'Test',
      password: 'secret',
    });

    assert.equal(calls.length, 1);
    assert.equal(calls[0][1][4], 'admin');
    assert.equal(calls[0][1][3], 'hashed:secret');
  } finally {
    scoped.restore();
  }
});

test('AuthService login returns token payload for a valid user', async () => {
  const scoped = withMocks('../src/modules/auth/auth.service', {
    '../../shared/database': {
      get: async () => ({
        Id: 7,
        Name: 'Nika',
        Surname: 'P',
        Email: 'nika@endopai.com',
        PasswordHash: 'hashed',
        Role: 'admin',
      }),
      run: async () => ({ lastID: 1, changes: 1 }),
    },
    'bcrypt': {
      hash: async (value) => `hashed:${value}`,
      compare: async (value) => value === 'correct-password',
    },
    '../../shared/jwt': { createToken: () => 'signed-token' },
    '../../shared/config': {
      config: {
        adminEmails: [],
        jwtExpiresInMinutes: 60,
      },
    },
  });

  try {
    const { AuthService } = scoped.loaded;
    const service = new AuthService();

    const result = await service.login({
      email: 'nika@endopai.com',
      password: 'correct-password',
    });

    assert.equal(result.token, 'signed-token');
    assert.equal(result.user.Role, 'admin');
    assert.equal(result.user.Email, 'nika@endopai.com');
  } finally {
    scoped.restore();
  }
});

test('AuthService login rejects invalid credentials', async () => {
  const scoped = withMocks('../src/modules/auth/auth.service', {
    '../../shared/database': {
      get: async () => ({
        Id: 7,
        Name: 'Nika',
        Surname: 'P',
        Email: 'nika@endopai.com',
        PasswordHash: 'hashed',
        Role: 'user',
      }),
      run: async () => ({ lastID: 1, changes: 1 }),
    },
    'bcrypt': {
      hash: async (value) => `hashed:${value}`,
      compare: async () => false,
    },
    '../../shared/jwt': { createToken: () => 'signed-token' },
    '../../shared/config': {
      config: {
        adminEmails: [],
        jwtExpiresInMinutes: 60,
      },
    },
  });

  try {
    const { AuthService } = scoped.loaded;
    const service = new AuthService();

    await assert.rejects(
      () => service.login({ email: 'nika@endopai.com', password: 'wrong' }),
      UnauthorizedException
    );
  } finally {
    scoped.restore();
  }
});
