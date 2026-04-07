const {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} = require('@nestjs/common');
const ReflectMetadata = Reflect;
const { ConsultationsService } = require('./consultations.service');
const { AuthGuard } = require('../../shared/auth.guard');
const { AdminGuard } = require('../../shared/admin.guard');
const { CurrentUser } = require('../../shared/current-user.decorator');

class ConsultationsController {
  constructor(consultationsService) {
    this.consultationsService = consultationsService;
  }

  async create(user, body) {
    return this.consultationsService.create(user.Id, body);
  }

  async getAll() {
    return this.consultationsService.getAll();
  }
}

Controller('Consultations')(ConsultationsController);
UseGuards(AuthGuard)(ConsultationsController);

Post()(
  ConsultationsController.prototype,
  'create',
  Object.getOwnPropertyDescriptor(
    ConsultationsController.prototype,
    'create',
  ),
);
CurrentUser()(ConsultationsController.prototype, 'create', 0);
Body()(ConsultationsController.prototype, 'create', 1);
Get('admin/all')(
  ConsultationsController.prototype,
  'getAll',
  Object.getOwnPropertyDescriptor(ConsultationsController.prototype, 'getAll'),
);
UseGuards(AuthGuard, AdminGuard)(
  ConsultationsController.prototype,
  'getAll',
  Object.getOwnPropertyDescriptor(ConsultationsController.prototype, 'getAll'),
);
ReflectMetadata.defineMetadata(
  'design:paramtypes',
  [ConsultationsService],
  ConsultationsController,
);

module.exports = { ConsultationsController };
