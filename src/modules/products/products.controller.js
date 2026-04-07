const {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  ParseIntPipe,
  Post,
  UseGuards,
} = require('@nestjs/common');
const ReflectMetadata = Reflect;
const { ProductsService } = require('./products.service');
const { AuthGuard } = require('../../shared/auth.guard');
const { AdminGuard } = require('../../shared/admin.guard');

class ProductsController {
  constructor(productsService) {
    this.productsService = productsService;
  }

  async getProducts() {
    return this.productsService.getProducts();
  }

  async getProductById(id) {
    return this.productsService.getProductById(id);
  }

  async createProduct(body) {
    return this.productsService.createProduct(body);
  }

  async updateProduct(id, body) {
    return this.productsService.updateProduct(id, body);
  }

  async deleteProduct(id) {
    return this.productsService.deleteProduct(id);
  }
}

Controller('Products')(ProductsController);
Get()(
  ProductsController.prototype,
  'getProducts',
  Object.getOwnPropertyDescriptor(ProductsController.prototype, 'getProducts'),
);
Get(':id')(
  ProductsController.prototype,
  'getProductById',
  Object.getOwnPropertyDescriptor(
    ProductsController.prototype,
    'getProductById',
  ),
);
Param('id', ParseIntPipe)(
  ProductsController.prototype,
  'getProductById',
  0,
);
Post('admin')(
  ProductsController.prototype,
  'createProduct',
  Object.getOwnPropertyDescriptor(ProductsController.prototype, 'createProduct'),
);
UseGuards(AuthGuard, AdminGuard)(
  ProductsController.prototype,
  'createProduct',
  Object.getOwnPropertyDescriptor(ProductsController.prototype, 'createProduct'),
);
Body()(ProductsController.prototype, 'createProduct', 0);
Patch('admin/:id')(
  ProductsController.prototype,
  'updateProduct',
  Object.getOwnPropertyDescriptor(ProductsController.prototype, 'updateProduct'),
);
UseGuards(AuthGuard, AdminGuard)(
  ProductsController.prototype,
  'updateProduct',
  Object.getOwnPropertyDescriptor(ProductsController.prototype, 'updateProduct'),
);
Param('id', ParseIntPipe)(ProductsController.prototype, 'updateProduct', 0);
Body()(ProductsController.prototype, 'updateProduct', 1);
Delete('admin/:id')(
  ProductsController.prototype,
  'deleteProduct',
  Object.getOwnPropertyDescriptor(ProductsController.prototype, 'deleteProduct'),
);
UseGuards(AuthGuard, AdminGuard)(
  ProductsController.prototype,
  'deleteProduct',
  Object.getOwnPropertyDescriptor(ProductsController.prototype, 'deleteProduct'),
);
Param('id', ParseIntPipe)(ProductsController.prototype, 'deleteProduct', 0);
ReflectMetadata.defineMetadata(
  'design:paramtypes',
  [ProductsService],
  ProductsController,
);

module.exports = { ProductsController };
