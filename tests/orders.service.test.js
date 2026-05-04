const test = require('node:test');
const assert = require('node:assert/strict');
const { BadRequestException } = require('@nestjs/common');
const { withMocks } = require('./test-helpers');

test('OrdersService checkout creates an order from submitted cart items', async () => {
  const runs = [];
  let transactionCalls = 0;

  const scoped = withMocks('../src/modules/orders/orders.service', {
    '../../shared/database': {
      all: async () => [],
      get: async (_sql, params) => {
        if (params?.[0] === 5) {
          return {
            Id: 5,
            Name: 'Shirt',
            Price: '30.00',
          };
        }

        if (params?.[0] === 44) {
          return {
            Id: 44,
            Email: 'nika@endopai.com',
          };
        }

        return null;
      },
      run: async (sql, params) => {
        runs.push({ sql, params });
        if (sql.includes('INSERT INTO "Orders"')) {
          return { lastID: 77, changes: 1 };
        }
        return { lastID: 0, changes: 1 };
      },
      transaction: async (callback) => {
        transactionCalls += 1;
        return callback();
      },
    },
  });

  try {
    const { OrdersService } = scoped.loaded;
    const emailCalls = [];
    const service = new OrdersService({
      sendPurchaseNotification: async (...args) => {
        emailCalls.push(args);
      },
    });

    const result = await service.checkout(44, {
      items: [
        {
          productId: 5,
          quantity: 2,
          color: 'Black',
          size: 'M',
        },
      ],
    });

    assert.equal(transactionCalls, 1);
    assert.equal(result.orderId, 77);
    assert.equal(result.totalPrice, 60);
    assert.ok(runs.some((entry) => entry.sql.includes('INSERT INTO "OrderItems"')));
    assert.equal(emailCalls.length, 1);
    assert.equal(emailCalls[0][0], 'nika@endopai.com');
  } finally {
    scoped.restore();
  }
});

test('OrdersService checkout rejects an empty submitted cart', async () => {
  const scoped = withMocks('../src/modules/orders/orders.service', {
    '../../shared/database': {
      all: async () => [],
      get: async () => null,
      run: async () => ({ lastID: 0, changes: 1 }),
      transaction: async (callback) => callback(),
    },
  });

  try {
    const { OrdersService } = scoped.loaded;
    const service = new OrdersService({
      sendPurchaseNotification: async () => {},
    });

    await assert.rejects(
      () => service.checkout(44, { items: [] }),
      BadRequestException
    );
  } finally {
    scoped.restore();
  }
});
