const test = require('node:test');
const assert = require('node:assert/strict');
const { NotFoundException } = require('@nestjs/common');
const { withMocks } = require('./test-helpers');

test('ProductsService createProduct persists arrays and returns mapped product', async () => {
  let inserted = null;

  const scoped = withMocks('../src/modules/products/products.service', {
    '../../shared/database': {
      all: async () => [],
      get: async (_sql, params) => {
        if (params?.[0] === 12) {
          return {
            Id: 12,
            Name: 'Hoodie',
            Description: 'Soft',
            Price: '25.00',
            ImageUrl: '/hoodie.png',
            SizesCsv: 'S,M',
            ColorsCsv: 'Black,Gray',
          };
        }
        return null;
      },
      run: async (_sql, params) => {
        inserted = params;
        return { lastID: 12, changes: 1 };
      },
    },
  });

  try {
    const { ProductsService } = scoped.loaded;
    const service = new ProductsService();

    const result = await service.createProduct({
      name: 'Hoodie',
      description: 'Soft',
      price: 25,
      imageUrl: '/hoodie.png',
      sizes: ['S', 'M'],
      colors: ['Black', 'Gray'],
    });

    assert.deepEqual(inserted.slice(4, 6), ['S,M', 'Black,Gray']);
    assert.equal(result.id, 12);
    assert.deepEqual(result.sizes, ['S', 'M']);
  } finally {
    scoped.restore();
  }
});

test('CartService removeItem throws when target row is missing', async () => {
  const scoped = withMocks('../src/modules/cart/cart.service', {
    '../../shared/database': {
      all: async () => [],
      get: async () => null,
      run: async () => ({ lastID: 0, changes: 0 }),
    },
  });

  try {
    const { CartService } = scoped.loaded;
    const service = new CartService();

    await assert.rejects(() => service.removeItem(4, 99), NotFoundException);
  } finally {
    scoped.restore();
  }
});

test('CartService removeItem succeeds when row exists', async () => {
  const scoped = withMocks('../src/modules/cart/cart.service', {
    '../../shared/database': {
      all: async () => [],
      get: async () => null,
      run: async () => ({ lastID: 0, changes: 1 }),
    },
  });

  try {
    const { CartService } = scoped.loaded;
    const service = new CartService();

    await service.removeItem(4, 99);
  } finally {
    scoped.restore();
  }
});

test('ProductsService updateProduct rejects missing products', async () => {
  const scoped = withMocks('../src/modules/products/products.service', {
    '../../shared/database': {
      all: async () => [],
      get: async () => null,
      run: async () => ({ lastID: 0, changes: 0 }),
    },
  });

  try {
    const { ProductsService } = scoped.loaded;
    const service = new ProductsService();

    await assert.rejects(
      () => service.updateProduct(999, { name: 'Missing' }),
      NotFoundException
    );
  } finally {
    scoped.restore();
  }
});
