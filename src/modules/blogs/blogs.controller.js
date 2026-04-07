const {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} = require('@nestjs/common');
const ReflectMetadata = Reflect;
const { BlogsService } = require('./blogs.service');
const { AuthGuard } = require('../../shared/auth.guard');
const { AdminGuard } = require('../../shared/admin.guard');

class BlogsController {
  constructor(blogsService) {
    this.blogsService = blogsService;
  }

  async getPublishedBlogs() {
    return this.blogsService.getPublishedBlogs();
  }

  async getPublishedBlogById(id) {
    return this.blogsService.getPublishedBlogById(id);
  }

  async getAllBlogs() {
    return this.blogsService.getAllBlogs();
  }

  async createBlog(body) {
    return this.blogsService.createBlog(body);
  }

  async updateBlog(id, body) {
    return this.blogsService.updateBlog(id, body);
  }
}

Controller('Blogs')(BlogsController);
Get()(
  BlogsController.prototype,
  'getPublishedBlogs',
  Object.getOwnPropertyDescriptor(BlogsController.prototype, 'getPublishedBlogs'),
);
Get(':id')(
  BlogsController.prototype,
  'getPublishedBlogById',
  Object.getOwnPropertyDescriptor(BlogsController.prototype, 'getPublishedBlogById'),
);
Param('id')(BlogsController.prototype, 'getPublishedBlogById', 0);

Get('admin/all')(
  BlogsController.prototype,
  'getAllBlogs',
  Object.getOwnPropertyDescriptor(BlogsController.prototype, 'getAllBlogs'),
);
UseGuards(AuthGuard, AdminGuard)(
  BlogsController.prototype,
  'getAllBlogs',
  Object.getOwnPropertyDescriptor(BlogsController.prototype, 'getAllBlogs'),
);

Post('admin')(
  BlogsController.prototype,
  'createBlog',
  Object.getOwnPropertyDescriptor(BlogsController.prototype, 'createBlog'),
);
UseGuards(AuthGuard, AdminGuard)(
  BlogsController.prototype,
  'createBlog',
  Object.getOwnPropertyDescriptor(BlogsController.prototype, 'createBlog'),
);
Body()(BlogsController.prototype, 'createBlog', 0);

Patch('admin/:id')(
  BlogsController.prototype,
  'updateBlog',
  Object.getOwnPropertyDescriptor(BlogsController.prototype, 'updateBlog'),
);
UseGuards(AuthGuard, AdminGuard)(
  BlogsController.prototype,
  'updateBlog',
  Object.getOwnPropertyDescriptor(BlogsController.prototype, 'updateBlog'),
);
Param('id')(BlogsController.prototype, 'updateBlog', 0);
Body()(BlogsController.prototype, 'updateBlog', 1);

ReflectMetadata.defineMetadata('design:paramtypes', [BlogsService], BlogsController);

module.exports = { BlogsController };
