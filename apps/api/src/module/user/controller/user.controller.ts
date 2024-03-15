import { Controller, Get } from '@nestjs/common';

@Controller()
export class UserController {
  @Get('/')
  findUser() {
    return 'Hello NestJS!';
  }
}
