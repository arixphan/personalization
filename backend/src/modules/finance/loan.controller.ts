import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { LoanService } from './loan.service';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';
import { CreateLoanDto, UpdateLoanDto } from '@personalization/shared';

@Controller('finance/loans')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @Post()
  create(
    @Body() dto: CreateLoanDto,
    @CurrentUserId() userId: number,
  ) {
    return this.loanService.create(dto, userId);
  }

  @Get()
  findAll(@CurrentUserId() userId: number) {
    return this.loanService.findAll(userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
  ) {
    return this.loanService.findOne(id, userId);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLoanDto,
    @CurrentUserId() userId: number,
  ) {
    return this.loanService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
  ) {
    return this.loanService.remove(id, userId);
  }
}
