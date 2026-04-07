const { Module } = require('@nestjs/common');
const { AuthController } = require('./auth.controller');
const { AuthService } = require('./auth.service');

class AuthModule {}

Module({
  controllers: [AuthController],
  providers: [AuthService],
})(AuthModule);

module.exports = { AuthModule };
