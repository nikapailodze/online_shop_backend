const { Injectable, NotFoundException } = require('@nestjs/common');
const { all, get } = require('../../shared/database');

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
}

Injectable()(ProductsService);

module.exports = { ProductsService, mapProduct };
