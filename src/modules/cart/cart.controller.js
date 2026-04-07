const {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} = require('@nestjs/common');
const ReflectMetadata = Reflect;
const { CartService } = require('./cart.service');
const { AuthGuard } = require('../../shared/auth.guard');
const { CurrentUser } = require('../../shared/current-user.decorator');

class CartController {
  constructor(cartService) {
    this.cartService = cartService;
  }

  async getCart(user) {
    return this.cartService.getCart(user.Id);
  }

  async addToCart(user, body) {
    return this.cartService.addToCart(user.Id, body);
  }

  async updateQuantity(user, cartItemId, body) {
    return this.cartService.updateQuantity(user.Id, cartItemId, body);
  }

  async removeItem(user, cartItemId) {
    await this.cartService.removeItem(user.Id, cartItemId);
  }

  async clearCart(user) {
    await this.cartService.clearCart(user.Id);
  }
}

Controller('Cart')(CartController);
UseGuards(AuthGuard)(CartController);

Get()(
  CartController.prototype,
  'getCart',
  Object.getOwnPropertyDescriptor(CartController.prototype, 'getCart'),
);
CurrentUser()(CartController.prototype, 'getCart', 0);

Post()(
  CartController.prototype,
  'addToCart',
  Object.getOwnPropertyDescriptor(CartController.prototype, 'addToCart'),
);
CurrentUser()(CartController.prototype, 'addToCart', 0);
Body()(CartController.prototype, 'addToCart', 1);

Patch(':cartItemId')(
  CartController.prototype,
  'updateQuantity',
  Object.getOwnPropertyDescriptor(CartController.prototype, 'updateQuantity'),
);
CurrentUser()(CartController.prototype, 'updateQuantity', 0);
Param('cartItemId', ParseIntPipe)(
  CartController.prototype,
  'updateQuantity',
  1,
);
Body()(CartController.prototype, 'updateQuantity', 2);

Delete(':cartItemId')(
  CartController.prototype,
  'removeItem',
  Object.getOwnPropertyDescriptor(CartController.prototype, 'removeItem'),
);
HttpCode(204)(
  CartController.prototype,
  'removeItem',
  Object.getOwnPropertyDescriptor(CartController.prototype, 'removeItem'),
);
CurrentUser()(CartController.prototype, 'removeItem', 0);
Param('cartItemId', ParseIntPipe)(
  CartController.prototype,
  'removeItem',
  1,
);

Delete()(
  CartController.prototype,
  'clearCart',
  Object.getOwnPropertyDescriptor(CartController.prototype, 'clearCart'),
);
HttpCode(204)(
  CartController.prototype,
  'clearCart',
  Object.getOwnPropertyDescriptor(CartController.prototype, 'clearCart'),
);
CurrentUser()(CartController.prototype, 'clearCart', 0);
ReflectMetadata.defineMetadata('design:paramtypes', [CartService], CartController);

module.exports = { CartController };
