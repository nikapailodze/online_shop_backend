const { Injectable, UnauthorizedException } = require('@nestjs/common');
const { verifyToken } = require('./jwt');
const { get } = require('./database');

class AuthGuard {
  async canActivate(context) {
    const request = context.switchToHttp().getRequest();
    const header = request.headers.authorization || '';

    if (!header.startsWith('Bearer ')) {
      throw new UnauthorizedException('Unauthorized');
    }

    const token = header.slice('Bearer '.length).trim();

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      throw new UnauthorizedException('Unauthorized');
    }

    const user = await get('SELECT * FROM "Users" WHERE "Id" = ?', [payload.sub]);
    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    request.user = user;
    return true;
  }
}

Injectable()(AuthGuard);

module.exports = { AuthGuard };
