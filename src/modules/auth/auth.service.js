const {
  ConflictException,
  Injectable,
  UnauthorizedException,
} = require('@nestjs/common');
const bcrypt = require('bcrypt');
const { get, run } = require('../../shared/database');
const { createToken } = require('../../shared/jwt');
const { config } = require('../../shared/config');

class AuthService {
  async signup(body) {
    const email = String(body.email || '').trim().toLowerCase();
    const name = String(body.name || '').trim();
    const surname = String(body.surname || '').trim();
    const password = String(body.password || '');

    const existingUser = await get(
      'SELECT * FROM "Users" WHERE LOWER("Email") = ?',
      [email],
    );
    if (existingUser) {
      throw new ConflictException({ message: 'Email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const role = config.adminEmails.includes(email) ? 'admin' : 'user';
    await run(
      'INSERT INTO "Users" ("Name", "Surname", "Email", "PasswordHash", "Role") VALUES (?, ?, ?, ?, ?)',
      [name, surname, email, passwordHash, role],
    );

    return { message: 'User registered successfully' };
  }

  async login(body) {
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    const user = await get('SELECT * FROM "Users" WHERE "Email" = ?', [email]);
    if (!user) {
      throw new UnauthorizedException({ message: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, user.PasswordHash);
    if (!isValid) {
      throw new UnauthorizedException({ message: 'Invalid email or password' });
    }

    const token = createToken(user);
    const expiresAtUtc = new Date(
      Date.now() + config.jwtExpiresInMinutes * 60 * 1000,
    ).toISOString();

    return {
      message: 'Login successful',
      token,
      expiresAtUtc,
      user: {
        Name: user.Name,
        Surname: user.Surname,
        Email: user.Email,
        Role: user.Role || 'user',
      },
    };
  }
}

Injectable()(AuthService);

module.exports = { AuthService };
