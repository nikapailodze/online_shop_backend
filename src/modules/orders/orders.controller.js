const {
  Controller,
  Get,
  Post,
  UseGuards,
} = require('@nestjs/common');
const ReflectMetadata = Reflect;
const { OrdersService } = require('./orders.service');
const { AuthGuard } = require('../../shared/auth.guard');
const { CurrentUser } = require('../../shared/current-user.decorator');

class OrdersController {
  constructor(ordersService) {
    this.ordersService = ordersService;
  }

  async getOrders(user) {
    return this.ordersService.getOrders(user.Id);
  }

  async checkout(user) {
    return this.ordersService.checkout(user.Id);
  }
}

Controller('Orders')(OrdersController);
UseGuards(AuthGuard)(OrdersController);

Get()(
  OrdersController.prototype,
  'getOrders',
  Object.getOwnPropertyDescriptor(OrdersController.prototype, 'getOrders'),
);
CurrentUser()(OrdersController.prototype, 'getOrders', 0);

Post('checkout')(
  OrdersController.prototype,
  'checkout',
  Object.getOwnPropertyDescriptor(OrdersController.prototype, 'checkout'),
);
CurrentUser()(OrdersController.prototype, 'checkout', 0);
ReflectMetadata.defineMetadata('design:paramtypes', [OrdersService], OrdersController);

module.exports = { OrdersController };
