const { Module } = require('@nestjs/common');
const { CalculatorsController } = require('./calculators.controller');
const { CalculatorsService } = require('./calculators.service');

class CalculatorsModule {}

Module({
  controllers: [CalculatorsController],
  providers: [CalculatorsService],
})(CalculatorsModule);

module.exports = { CalculatorsModule };
