import { Controller, Get, Post, Body, UsePipes, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto, registerUserSchema } from './dto/register-user.dto';
import { Public } from 'src/decorators/public.decorator';
import { ZodValidationPipe } from 'src/pipes/zod.pipe';
import { Permissions } from 'src/decorators/permission.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @Public()
  @UsePipes(new ZodValidationPipe(registerUserSchema))
  register(@Body() createUserDto: RegisterUserDto) {
    return this.userService.register(createUserDto);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Get('/')
  @Permissions('USER_READ')
  getUsers() {
    return this.userService.findAll();
  }
}
