import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { BudgetService } from './budget.service';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';
import { CreateBudgetDto, UpdateBudgetDto } from '@personalization/shared';

@Controller('finance/budgets')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  create(@Body() dto: CreateBudgetDto, @CurrentUserId() userId: number) {
    return this.budgetService.create(dto, userId);
  }

  @Get()
  findAll(
    @CurrentUserId() userId: number,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    if (month && year) {
      return this.budgetService.findByMonth(
        userId,
        parseInt(month),
        parseInt(year),
      );
    }
    return this.budgetService.findAll(userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
  ) {
    return this.budgetService.findOne(id, userId);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBudgetDto,
    @CurrentUserId() userId: number,
  ) {
    return this.budgetService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
  ) {
    return this.budgetService.remove(id, userId);
  }
}
