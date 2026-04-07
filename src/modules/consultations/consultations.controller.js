const {
  Body,
  Controller,
  Post,
  UseGuards,
} = require('@nestjs/common');
const ReflectMetadata = Reflect;
const { ConsultationsService } = require('./consultations.service');
const { AuthGuard } = require('../../shared/auth.guard');
const { CurrentUser } = require('../../shared/current-user.decorator');

class ConsultationsController {
  constructor(consultationsService) {
    this.consultationsService = consultationsService;
  }

  async create(user, body) {
    return this.consultationsService.create(user.Id, body);
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
ReflectMetadata.defineMetadata(
  'design:paramtypes',
  [ConsultationsService],
  ConsultationsController,
);

module.exports = { ConsultationsController };
