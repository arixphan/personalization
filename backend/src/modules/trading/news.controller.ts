import { Controller, Get, Query } from '@nestjs/common';
import { NewsService } from './news.service';

@Controller('trading/news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  getNews(@Query('currencies') currencies?: string) {
    return this.newsService.getLatestNews(currencies);
  }
}
