const { Module } = require('@nestjs/common');
const { CartController } = require('./cart.controller');
const { CartService } = require('./cart.service');

class CartModule {}

Module({
  controllers: [CartController],
  providers: [CartService],
})(CartModule);

module.exports = { CartModule };
