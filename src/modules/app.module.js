const { Module } = require('@nestjs/common');
const { AuthModule } = require('./auth/auth.module');
const { ProductsModule } = require('./products/products.module');
const { CartModule } = require('./cart/cart.module');
const { OrdersModule } = require('./orders/orders.module');
const { ConsultationsModule } = require('./consultations/consultations.module');
const { BlogsModule } = require('./blogs/blogs.module');
const { CalculatorsModule } = require('./calculators/calculators.module');

class AppModule {}

Module({
  imports: [
    AuthModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    ConsultationsModule,
    BlogsModule,
    CalculatorsModule,
  ],
})(AppModule);

module.exports = { AppModule };
