import { Controller, Get, Post, Body, UsePipes, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto, RegisterUserSchema } from '@personalization/shared';
import { Public } from 'src/decorators/public.decorator';
import { ZodValidationPipe } from 'src/pipes/zod.pipe';
import { Permissions } from 'src/decorators/permission.decorator';
import { PERMISSIONS } from 'src/constants/permission';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @Public()
  @UsePipes(new ZodValidationPipe(RegisterUserSchema))
  register(@Body() createUserDto: RegisterUserDto) {
    return this.userService.register(createUserDto);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Get('/')
  @Permissions(PERMISSIONS.USER_READ_ALL)
  getUsers() {
    return this.userService.findAll();
  }
}
