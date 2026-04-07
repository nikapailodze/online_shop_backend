const { Injectable, NotFoundException } = require('@nestjs/common');
const { all, get, run } = require('../../shared/database');

function mapProduct(product) {
  return {
    id: product.Id,
    name: product.Name,
    description: product.Description,
    price: Number(product.Price),
    imageUrl: product.ImageUrl,
    sizes: String(product.SizesCsv || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
    colors: String(product.ColorsCsv || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
  };
}

class ProductsService {
  async getProducts() {
    const products = await all('SELECT * FROM "Products" ORDER BY "Id" ASC');
    return products.map(mapProduct);
  }

  async getProductById(id) {
    const product = await get('SELECT * FROM "Products" WHERE "Id" = ?', [id]);
    if (!product) {
      throw new NotFoundException();
    }

    return mapProduct(product);
  }

  async createProduct(body) {
    const result = await run(
      `
        INSERT INTO "Products" ("Name", "Description", "Price", "ImageUrl", "SizesCsv", "ColorsCsv")
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        body.name,
        body.description,
        Number(body.price).toFixed(2),
        body.imageUrl,
        Array.isArray(body.sizes) ? body.sizes.join(',') : '',
        Array.isArray(body.colors) ? body.colors.join(',') : '',
      ],
    );

    return this.getProductById(result.lastID);
  }

  async updateProduct(id, body) {
    const existing = await get('SELECT * FROM "Products" WHERE "Id" = ?', [id]);
    if (!existing) {
      throw new NotFoundException({ message: 'Product not found.' });
    }

    await run(
      `
        UPDATE "Products"
        SET "Name" = ?, "Description" = ?, "Price" = ?, "ImageUrl" = ?, "SizesCsv" = ?, "ColorsCsv" = ?
        WHERE "Id" = ?
      `,
      [
        body.name ?? existing.Name,
        body.description ?? existing.Description,
        body.price === undefined ? existing.Price : Number(body.price).toFixed(2),
        body.imageUrl ?? existing.ImageUrl,
        Array.isArray(body.sizes) ? body.sizes.join(',') : existing.SizesCsv,
        Array.isArray(body.colors) ? body.colors.join(',') : existing.ColorsCsv,
        id,
      ],
    );

    return this.getProductById(id);
  }

  async deleteProduct(id) {
    const existing = await get('SELECT * FROM "Products" WHERE "Id" = ?', [id]);
    if (!existing) {
      throw new NotFoundException({ message: 'Product not found.' });
    }

    await run('DELETE FROM "Products" WHERE "Id" = ?', [id]);

    return { success: true };
  }
}

Injectable()(ProductsService);

module.exports = { ProductsService, mapProduct };
