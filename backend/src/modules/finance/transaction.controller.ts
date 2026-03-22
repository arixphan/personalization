import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';
import { CreateTransactionDto } from '@personalization/shared';

@Controller('finance/transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  create(@Body() dto: CreateTransactionDto, @CurrentUserId() userId: number) {
    return this.transactionService.create(dto, userId);
  }

  @Get()
  findAll(
    @CurrentUserId() userId: number,
    @Query('walletId') walletId?: string,
  ) {
    return this.transactionService.findAll(
      userId,
      walletId ? parseInt(walletId) : undefined,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
  ) {
    return this.transactionService.remove(id, userId);
  }
}
