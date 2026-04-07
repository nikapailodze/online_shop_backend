const { BadRequestException, Injectable } = require('@nestjs/common');
const ReflectMetadata = Reflect;
const { all, get, run, transaction } = require('../../shared/database');

class OrdersService {
  constructor(emailService) {
    this.emailService = emailService;
  }

  async getOrders(userId) {
    const orders = await all(
      'SELECT * FROM "Orders" WHERE "UserId" = ? ORDER BY "CreatedAtUtc" DESC',
      [userId],
    );

    const result = [];
    for (const order of orders) {
      const items = await all(
        `
          SELECT
            oi."Id" AS OrderItemId,
            oi."ProductId" AS ProductId,
            oi."Quantity" AS Quantity,
            oi."UnitPrice" AS UnitPrice,
            oi."Color" AS Color,
            oi."Size" AS Size,
            p."Name" AS ProductName
          FROM "OrderItems" oi
          INNER JOIN "Products" p ON p."Id" = oi."ProductId"
          WHERE oi."OrderId" = ?
          ORDER BY oi."Id" ASC
        `,
        [order.Id],
      );

      result.push({
        orderId: order.Id,
        totalPrice: Number(order.TotalPrice),
        createdAtUtc: order.CreatedAtUtc,
        items: items.map((item) => ({
          orderItemId: item.OrderItemId,
          productId: item.ProductId,
          productName: item.ProductName,
          quantity: item.Quantity,
          unitPrice: Number(item.UnitPrice),
          color: item.Color || undefined,
          size: item.Size || undefined,
        })),
      });
    }

    return result;
  }

  async checkout(userId) {
    const cartItems = await all(
      `
        SELECT
          c."Id" AS CartItemId,
          c."ProductId" AS ProductId,
          c."Quantity" AS Quantity,
          c."Color" AS Color,
          c."Size" AS Size,
          p."Name" AS ProductName,
          p."Price" AS Price
        FROM "CartItems" c
        LEFT JOIN "Products" p ON p."Id" = c."ProductId"
        WHERE c."UserId" = ?
        ORDER BY c."Id" ASC
      `,
      [userId],
    );

    if (!cartItems.length) {
      throw new BadRequestException({ message: 'Cart is empty.' });
    }

    const orphanedItems = cartItems.filter((item) => !item.ProductName);
    if (orphanedItems.length) {
      for (const item of orphanedItems) {
        await run('DELETE FROM "CartItems" WHERE "Id" = ?', [item.CartItemId]);
      }

      throw new BadRequestException({
        message:
          'Some items are no longer available and were removed from your cart. Please review your cart and try again.',
      });
    }

    const totalPrice = cartItems.reduce(
      (sum, item) => sum + Number(item.Price) * Number(item.Quantity),
      0,
    );
    const createdAtUtc = new Date().toISOString();

    const orderId = await transaction(async () => {
      const orderResult = await run(
        'INSERT INTO "Orders" ("UserId", "TotalPrice", "CreatedAtUtc") VALUES (?, ?, ?)',
        [userId, totalPrice.toFixed(2), createdAtUtc],
      );

      for (const item of cartItems) {
        await run(
          'INSERT INTO "OrderItems" ("OrderId", "ProductId", "Quantity", "UnitPrice", "Color", "Size") VALUES (?, ?, ?, ?, ?, ?)',
          [
            orderResult.lastID,
            item.ProductId,
            item.Quantity,
            Number(item.Price).toFixed(2),
            item.Color || null,
            item.Size || null,
          ],
        );
      }

      await run('DELETE FROM "CartItems" WHERE "UserId" = ?', [userId]);
      return orderResult.lastID;
    });

    const user = await get('SELECT * FROM "Users" WHERE "Id" = ?', [userId]);
    if (user) {
      await this.emailService.sendPurchaseNotification(
        user.Email,
        cartItems.map((item) => ({
          productName: item.ProductName,
          quantity: item.Quantity,
          unitPrice: item.Price,
          color: item.Color,
          size: item.Size,
        })),
        totalPrice,
      );
    }

    return {
      orderId,
      totalPrice: Number(totalPrice.toFixed(2)),
      createdAtUtc,
    };
  }
}

Injectable()(OrdersService);
ReflectMetadata.defineMetadata('design:paramtypes', [require('./email.service').EmailService], OrdersService);

module.exports = { OrdersService };
