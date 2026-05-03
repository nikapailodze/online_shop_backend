const {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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

  async updateCalculator(id, body) {
    return this.calculatorsService.updateCalculator(id, body);
  }

  async deleteCalculator(id) {
    return this.calculatorsService.deleteCalculator(id);
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

Patch('admin/:id')(
  CalculatorsController.prototype,
  'updateCalculator',
  Object.getOwnPropertyDescriptor(
    CalculatorsController.prototype,
    'updateCalculator',
  ),
);
UseGuards(AuthGuard, AdminGuard)(
  CalculatorsController.prototype,
  'updateCalculator',
  Object.getOwnPropertyDescriptor(
    CalculatorsController.prototype,
    'updateCalculator',
  ),
);
Param('id')(CalculatorsController.prototype, 'updateCalculator', 0);
Body()(CalculatorsController.prototype, 'updateCalculator', 1);

Delete('admin/:id')(
  CalculatorsController.prototype,
  'deleteCalculator',
  Object.getOwnPropertyDescriptor(
    CalculatorsController.prototype,
    'deleteCalculator',
  ),
);
UseGuards(AuthGuard, AdminGuard)(
  CalculatorsController.prototype,
  'deleteCalculator',
  Object.getOwnPropertyDescriptor(
    CalculatorsController.prototype,
    'deleteCalculator',
  ),
);
Param('id')(CalculatorsController.prototype, 'deleteCalculator', 0);

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
