const { Module } = require('@nestjs/common');
const { OrdersController } = require('./orders.controller');
const { OrdersService } = require('./orders.service');
const { EmailService } = require('./email.service');

class OrdersModule {}

Module({
  controllers: [OrdersController],
  providers: [OrdersService, EmailService],
})(OrdersModule);

module.exports = { OrdersModule };
