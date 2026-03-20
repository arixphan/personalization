import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import * as Parser from 'rss-parser';

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);
  private readonly parser = new Parser();

  async getLatestNews(currencies?: string) {
    try {
      // Cointelegraph RSS feed
      const feed = await this.parser.parseURL('https://cointelegraph.com/rss');
      
      let newsList = feed.items.map((item) => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        creator: item.creator || 'Cointelegraph',
        contentSnippet: item.contentSnippet,
      }));

      // Basic filtering if currencies are provided (e.g., "BTC,ETH")
      if (currencies) {
        const keywords = currencies.split(',').map(c => c.trim().toLowerCase());
        newsList = newsList.filter(news => {
          const textToSearch = `${news.title} ${news.contentSnippet}`.toLowerCase();
          return keywords.some(keyword => textToSearch.includes(keyword) || textToSearch.includes(this.getFullName(keyword)));
        });
      }

      // Return top 20
      return newsList.slice(0, 20);
    } catch (error) {
      this.logger.error('Failed to fetch RSS news', error);
      throw new InternalServerErrorException('Failed to fetch crypto news');
    }
  }

  private getFullName(symbol: string): string {
    const map: Record<string, string> = {
      btc: 'bitcoin',
      eth: 'ethereum',
      sol: 'solana',
      bnb: 'binance',
    };
    return map[symbol] || symbol;
  }
}
