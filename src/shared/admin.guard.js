const { ForbiddenException, Injectable } = require('@nestjs/common');

class AdminGuard {
  canActivate(context) {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.Role !== 'admin') {
      throw new ForbiddenException({ message: 'Admin access required.' });
    }

    return true;
  }
}

Injectable()(AdminGuard);

module.exports = { AdminGuard };
