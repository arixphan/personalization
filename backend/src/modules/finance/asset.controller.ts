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
import { AssetService } from './asset.service';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';
import { CreateAssetDto, UpdateAssetDto } from '@personalization/shared';

@Controller('finance/assets')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Post()
  create(@Body() dto: CreateAssetDto, @CurrentUserId() userId: number) {
    return this.assetService.create(dto, userId);
  }

  @Get()
  findAll(@CurrentUserId() userId: number) {
    return this.assetService.findAll(userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
  ) {
    return this.assetService.findOne(id, userId);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAssetDto,
    @CurrentUserId() userId: number,
  ) {
    return this.assetService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
  ) {
    return this.assetService.remove(id, userId);
  }
}
