import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';
import { CreateWalletDto, UpdateWalletDto } from '@personalization/shared';

@Controller('finance/wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  create(@Body() dto: CreateWalletDto, @CurrentUserId() userId: number) {
    return this.walletService.create(dto, userId);
  }

  @Get()
  findAll(@CurrentUserId() userId: number) {
    return this.walletService.findAll(userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
  ) {
    return this.walletService.findOne(id, userId);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWalletDto,
    @CurrentUserId() userId: number,
  ) {
    return this.walletService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
  ) {
    return this.walletService.remove(id, userId);
  }
}
