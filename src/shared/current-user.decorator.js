const { createParamDecorator } = require('@nestjs/common');

const CurrentUser = createParamDecorator((_data, context) => {
  const request = context.switchToHttp().getRequest();
  return request.user;
});

module.exports = { CurrentUser };
