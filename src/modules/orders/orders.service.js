const { BadRequestException, Injectable } = require('@nestjs/common');
const ReflectMetadata = Reflect;
const { all, get, run, transaction } = require('../../shared/database');

function normalizeCheckoutItems(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new BadRequestException({ message: 'Cart is empty.' });
  }

  return rawItems.map((item) => {
    const productId = Number(item?.productId);
    const quantity = Number(item?.quantity);
    const color = item?.color ? String(item.color).trim() : null;
    const size = item?.size ? String(item.size).trim() : null;

    if (!Number.isInteger(productId) || productId <= 0) {
      throw new BadRequestException({ message: 'Each cart item must have a valid product.' });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new BadRequestException({ message: 'Each cart item must have a quantity greater than zero.' });
    }

    return {
      productId,
      quantity,
      color,
      size,
    };
  });
}

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

  async checkout(userId, body) {
    const checkoutItems = normalizeCheckoutItems(body?.items);
    const cartItems = [];

    for (const item of checkoutItems) {
      const product = await get('SELECT * FROM "Products" WHERE "Id" = ?', [
        item.productId,
      ]);

      if (!product) {
        throw new BadRequestException({
          message: 'Some items are no longer available. Please review your cart and try again.',
        });
      }

      cartItems.push({
        ProductId: product.Id,
        Quantity: item.quantity,
        Color: item.color,
        Size: item.size,
        ProductName: product.Name,
        Price: Number(product.Price),
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
