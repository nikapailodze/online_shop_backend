const {
  Controller,
  Get,
  Param,
  ParseIntPipe,
} = require('@nestjs/common');
const ReflectMetadata = Reflect;
const { ProductsService } = require('./products.service');

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
ReflectMetadata.defineMetadata(
  'design:paramtypes',
  [ProductsService],
  ProductsController,
);

module.exports = { ProductsController };
