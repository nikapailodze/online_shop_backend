const { Injectable, NotFoundException } = require('@nestjs/common');
const { all, get, run } = require('../../shared/database');

function mapCartItem(item) {
  return {
    cartItemId: item.CartItemId,
    productId: item.ProductId,
    productName: item.ProductName,
    description: item.Description,
    price: Number(item.Price),
    quantity: item.Quantity,
    imageUrl: item.ImageUrl,
    color: item.Color || undefined,
    size: item.Size || undefined,
  };
}

class CartService {
  async getCart(userId) {
    const items = await all(
      `
        SELECT
          c."Id" AS CartItemId,
          c."ProductId" AS ProductId,
          c."Quantity" AS Quantity,
          c."Color" AS Color,
          c."Size" AS Size,
          p."Name" AS ProductName,
          p."Description" AS Description,
          p."Price" AS Price,
          p."ImageUrl" AS ImageUrl
        FROM "CartItems" c
        INNER JOIN "Products" p ON p."Id" = c."ProductId"
        WHERE c."UserId" = ?
        ORDER BY c."Id" ASC
      `,
      [userId],
    );

    return items.map(mapCartItem);
  }

  async addToCart(userId, body) {
    const product = await get('SELECT * FROM "Products" WHERE "Id" = ?', [
      body.productId,
    ]);
    if (!product) {
      throw new NotFoundException({ message: 'Product not found.' });
    }

    const existing = await get(
      `
        SELECT * FROM "CartItems"
        WHERE "UserId" = ?
          AND "ProductId" = ?
          AND (("Color" IS NULL AND ? IS NULL) OR "Color" = ?)
          AND (("Size" IS NULL AND ? IS NULL) OR "Size" = ?)
      `,
      [
        userId,
        body.productId,
        body.color || null,
        body.color || null,
        body.size || null,
        body.size || null,
      ],
    );

    let cartItemId;
    if (existing) {
      await run('UPDATE "CartItems" SET "Quantity" = ? WHERE "Id" = ?', [
        Number(existing.Quantity) + Number(body.quantity || 1),
        existing.Id,
      ]);
      cartItemId = existing.Id;
    } else {
      const result = await run(
        'INSERT INTO "CartItems" ("UserId", "ProductId", "Quantity", "Color", "Size") VALUES (?, ?, ?, ?, ?)',
        [
          userId,
          body.productId,
          Number(body.quantity || 1),
          body.color || null,
          body.size || null,
        ],
      );
      cartItemId = result.lastID;
    }

    const items = await this.getCart(userId);
    return items.find((item) => item.cartItemId === cartItemId) || items[0];
  }

  async updateQuantity(userId, cartItemId, body) {
    const item = await get(
      'SELECT * FROM "CartItems" WHERE "Id" = ? AND "UserId" = ?',
      [cartItemId, userId],
    );
    if (!item) {
      throw new NotFoundException({ message: 'Cart item not found.' });
    }

    await run('UPDATE "CartItems" SET "Quantity" = ? WHERE "Id" = ?', [
      Number(body.quantity),
      cartItemId,
    ]);

    const items = await this.getCart(userId);
    return items.find((cartItem) => cartItem.cartItemId === cartItemId);
  }

  async removeItem(userId, cartItemId) {
    const result = await run(
      'DELETE FROM "CartItems" WHERE "Id" = ? AND "UserId" = ?',
      [cartItemId, userId],
    );

    if (!result.changes) {
      throw new NotFoundException({ message: 'Cart item not found.' });
    }
  }

  async clearCart(userId) {
    await run('DELETE FROM "CartItems" WHERE "UserId" = ?', [userId]);
  }
}

Injectable()(CartService);

module.exports = { CartService };
