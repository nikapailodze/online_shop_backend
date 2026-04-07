const { Module } = require('@nestjs/common');
const { BlogsController } = require('./blogs.controller');
const { BlogsService } = require('./blogs.service');

class BlogsModule {}

Module({
  controllers: [BlogsController],
  providers: [BlogsService],
})(BlogsModule);

module.exports = { BlogsModule };
