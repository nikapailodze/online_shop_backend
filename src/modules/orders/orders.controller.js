const {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} = require('@nestjs/common');
const ReflectMetadata = Reflect;
const { OrdersService } = require('./orders.service');
const { AuthGuard } = require('../../shared/auth.guard');
const { AdminGuard } = require('../../shared/admin.guard');
const { CurrentUser } = require('../../shared/current-user.decorator');

class OrdersController {
  constructor(ordersService) {
    this.ordersService = ordersService;
  }

  async getOrders(user) {
    return this.ordersService.getOrders(user.Id);
  }

  async getAllOrders() {
    return this.ordersService.getAllOrders();
  }

  async checkout(user, body) {
    return this.ordersService.checkout(user.Id, body);
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

Get('admin/all')(
  OrdersController.prototype,
  'getAllOrders',
  Object.getOwnPropertyDescriptor(OrdersController.prototype, 'getAllOrders'),
);
UseGuards(AuthGuard, AdminGuard)(
  OrdersController.prototype,
  'getAllOrders',
  Object.getOwnPropertyDescriptor(OrdersController.prototype, 'getAllOrders'),
);

Post('checkout')(
  OrdersController.prototype,
  'checkout',
  Object.getOwnPropertyDescriptor(OrdersController.prototype, 'checkout'),
);
CurrentUser()(OrdersController.prototype, 'checkout', 0);
Body()(OrdersController.prototype, 'checkout', 1);
ReflectMetadata.defineMetadata('design:paramtypes', [OrdersService], OrdersController);

module.exports = { OrdersController };
