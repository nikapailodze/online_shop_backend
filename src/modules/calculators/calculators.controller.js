const {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} = require('@nestjs/common');
const ReflectMetadata = Reflect;
const { CalculatorsService } = require('./calculators.service');
const { AuthGuard } = require('../../shared/auth.guard');
const { AdminGuard } = require('../../shared/admin.guard');

class CalculatorsController {
  constructor(calculatorsService) {
    this.calculatorsService = calculatorsService;
  }

  async getPublishedCalculators() {
    return this.calculatorsService.getPublishedCalculators();
  }

  async getPublishedCalculatorBySlug(slug) {
    return this.calculatorsService.getPublishedCalculatorBySlug(slug);
  }

  async getAllCalculators() {
    return this.calculatorsService.getAllCalculators();
  }

  async createCalculator(body) {
    return this.calculatorsService.createCalculator(body);
  }
}

Controller('Calculators')(CalculatorsController);
Get()(
  CalculatorsController.prototype,
  'getPublishedCalculators',
  Object.getOwnPropertyDescriptor(
    CalculatorsController.prototype,
    'getPublishedCalculators',
  ),
);
Get('admin/all')(
  CalculatorsController.prototype,
  'getAllCalculators',
  Object.getOwnPropertyDescriptor(
    CalculatorsController.prototype,
    'getAllCalculators',
  ),
);
UseGuards(AuthGuard, AdminGuard)(
  CalculatorsController.prototype,
  'getAllCalculators',
  Object.getOwnPropertyDescriptor(
    CalculatorsController.prototype,
    'getAllCalculators',
  ),
);

Post('admin')(
  CalculatorsController.prototype,
  'createCalculator',
  Object.getOwnPropertyDescriptor(
    CalculatorsController.prototype,
    'createCalculator',
  ),
);
UseGuards(AuthGuard, AdminGuard)(
  CalculatorsController.prototype,
  'createCalculator',
  Object.getOwnPropertyDescriptor(
    CalculatorsController.prototype,
    'createCalculator',
  ),
);
Body()(CalculatorsController.prototype, 'createCalculator', 0);

Get(':slug')(
  CalculatorsController.prototype,
  'getPublishedCalculatorBySlug',
  Object.getOwnPropertyDescriptor(
    CalculatorsController.prototype,
    'getPublishedCalculatorBySlug',
  ),
);
Param('slug')(CalculatorsController.prototype, 'getPublishedCalculatorBySlug', 0);

ReflectMetadata.defineMetadata(
  'design:paramtypes',
  [CalculatorsService],
  CalculatorsController,
);

module.exports = { CalculatorsController };
