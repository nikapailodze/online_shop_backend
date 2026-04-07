const {
  Body,
  Controller,
  HttpCode,
  Post,
} = require('@nestjs/common');
const ReflectMetadata = Reflect;
const { AuthService } = require('./auth.service');

class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  async signup(body) {
    return this.authService.signup(body);
  }

  async login(body) {
    return this.authService.login(body);
  }
}

Controller('Auth')(AuthController);
Post('signup')(
  AuthController.prototype,
  'signup',
  Object.getOwnPropertyDescriptor(AuthController.prototype, 'signup'),
);
Body()(AuthController.prototype, 'signup', 0);
HttpCode(200)(
  AuthController.prototype,
  'signup',
  Object.getOwnPropertyDescriptor(AuthController.prototype, 'signup'),
);

Post('login')(
  AuthController.prototype,
  'login',
  Object.getOwnPropertyDescriptor(AuthController.prototype, 'login'),
);
Body()(AuthController.prototype, 'login', 0);
HttpCode(200)(
  AuthController.prototype,
  'login',
  Object.getOwnPropertyDescriptor(AuthController.prototype, 'login'),
);
ReflectMetadata.defineMetadata('design:paramtypes', [AuthService], AuthController);

module.exports = { AuthController };
