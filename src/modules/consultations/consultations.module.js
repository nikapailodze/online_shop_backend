const { Module } = require('@nestjs/common');
const { ConsultationsController } = require('./consultations.controller');
const { ConsultationsService } = require('./consultations.service');

class ConsultationsModule {}

Module({
  controllers: [ConsultationsController],
  providers: [ConsultationsService],
})(ConsultationsModule);

module.exports = { ConsultationsModule };
