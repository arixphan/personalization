import { Controller, Get, Post, Body, UsePipes, Request, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { 
  RegisterUserDto, RegisterUserSchema,
  UserProfileDto, UserProfileSchema,
  UserSettingsDto, UserSettingsSchema,
  UpdateUserExperienceDto, UpdateUserExperienceSchema,
  UpdateUserEducationDto, UpdateUserEducationSchema,
  UpdateUserSkillDto, UpdateUserSkillSchema,
  PERMISSIONS
} from '@personalization/shared';
import { Public } from 'src/decorators/public.decorator';
import { ZodValidationPipe } from 'src/pipes/zod.pipe';
import { Permissions } from 'src/decorators/permission.decorator';

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
    return this.userService.getProfile(req.user.sub);
  }

  @Get('/')
  @Permissions(PERMISSIONS.USER_READ_ALL)
  getUsers() {
    return this.userService.findAll();
  }

  @Patch('profile')
  @UsePipes(new ZodValidationPipe(UserProfileSchema))
  updateProfile(@Request() req, @Body() updateProfileDto: UserProfileDto) {
    return this.userService.updateProfile(req.user.sub, updateProfileDto);
  }

  @Patch('settings')
  @UsePipes(new ZodValidationPipe(UserSettingsSchema))
  updateSettings(@Request() req, @Body() updateSettingsDto: UserSettingsDto) {
    return this.userService.updateProfile(req.user.sub, updateSettingsDto);
  }

  @Patch('profile/experience')
  @UsePipes(new ZodValidationPipe(UpdateUserExperienceSchema))
  updateExperience(@Request() req, @Body() experienceDto: UpdateUserExperienceDto) {
    return this.userService.updateProfile(req.user.sub, { experience: JSON.stringify(experienceDto) });
  }

  @Patch('profile/education')
  @UsePipes(new ZodValidationPipe(UpdateUserEducationSchema))
  updateEducation(@Request() req, @Body() educationDto: UpdateUserEducationDto) {
    return this.userService.updateProfile(req.user.sub, { education: JSON.stringify(educationDto) });
  }

  @Patch('profile/skills')
  @UsePipes(new ZodValidationPipe(UpdateUserSkillSchema))
  updateSkills(@Request() req, @Body() skillDto: UpdateUserSkillDto) {
    return this.userService.updateProfile(req.user.sub, { skills: JSON.stringify(skillDto) });
  }
}
