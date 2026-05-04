const test = require('node:test');
const assert = require('node:assert/strict');
const { withMocks } = require('./test-helpers');

test('OrdersService getAllOrders returns customer metadata and items', async () => {
  const scoped = withMocks('../src/modules/orders/orders.service', {
    '../../shared/database': {
      all: async (sql, params) => {
        if (sql.includes('FROM "Orders" o')) {
          return [
            {
              OrderId: 10,
              UserId: 3,
              TotalPrice: '64.00',
              CreatedAtUtc: '2026-05-01T12:00:00.000Z',
              UserName: 'Nika',
              UserSurname: 'Pailodze',
              UserEmail: 'nika@endopai.com',
            },
          ];
        }

        if (sql.includes('FROM "OrderItems"')) {
          return [
            {
              OrderItemId: 1,
              ProductId: 5,
              Quantity: 2,
              UnitPrice: '32.00',
              Color: 'Black',
              Size: 'M',
              ProductName: 'Shirt',
            },
          ];
        }

        return [];
      },
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

    const result = await service.getAllOrders();

    assert.equal(result.length, 1);
    assert.equal(result[0].customerEmail, 'nika@endopai.com');
    assert.equal(result[0].items[0].productName, 'Shirt');
  } finally {
    scoped.restore();
  }
});
