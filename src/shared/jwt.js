const jwt = require('jsonwebtoken');
const { config } = require('./config');

function createToken(user) {
  return jwt.sign(
    {
      sub: user.Id,
      email: user.Email,
      name: user.Name,
      surname: user.Surname,
      role: user.Role || 'user',
    },
    config.jwtSecret,
    {
      issuer: config.jwtIssuer,
      audience: config.jwtAudience,
      expiresIn: `${config.jwtExpiresInMinutes}m`,
    },
  );
}

function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret, {
    issuer: config.jwtIssuer,
    audience: config.jwtAudience,
  });
}

module.exports = {
  createToken,
  verifyToken,
};
