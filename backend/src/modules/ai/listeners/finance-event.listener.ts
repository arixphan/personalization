import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { IngestionService } from '../services/ingestion.service';
import { FINANCE_EVENT } from '../events/finance.events';

@Injectable()
export class FinanceEventListener {
  constructor(private readonly ingestionService: IngestionService) { }

  @OnEvent(FINANCE_EVENT.TRANSACTION_CREATED)
  async handleTransactionCreated(payload: { userId: number; transaction: any }) {
    await this.ingestionService.ingestSingleTransaction(payload.userId, payload.transaction);
  }

  @OnEvent(FINANCE_EVENT.TRANSACTION_DELETED)
  async handleTransactionDeleted(payload: { entityId: number }) {
    await this.ingestionService.deleteVector('Transaction', payload.entityId);
  }

  @OnEvent(FINANCE_EVENT.WALLET_UPDATED)
  async handleWalletUpdated(payload: { userId: number; wallet: any }) {
    await this.ingestionService.ingestSingleWallet(payload.userId, payload.wallet);
  }

  @OnEvent(FINANCE_EVENT.ASSET_CREATED)
  @OnEvent(FINANCE_EVENT.ASSET_UPDATED)
  async handleAssetChanged(payload: { userId: number; asset: any }) {
    await this.ingestionService.ingestSingleAsset(payload.userId, payload.asset);
  }

  @OnEvent(FINANCE_EVENT.ASSET_DELETED)
  async handleAssetDeleted(payload: { entityId: number }) {
    await this.ingestionService.deleteVector('Asset', payload.entityId);
  }

  @OnEvent(FINANCE_EVENT.LOAN_CREATED)
  @OnEvent(FINANCE_EVENT.LOAN_UPDATED)
  async handleLoanChanged(payload: { userId: number; loan: any }) {
    await this.ingestionService.ingestSingleLoan(payload.userId, payload.loan);
  }

  @OnEvent(FINANCE_EVENT.LOAN_DELETED)
  async handleLoanDeleted(payload: { entityId: number }) {
    await this.ingestionService.deleteVector('Loan', payload.entityId);
  }

  @OnEvent(FINANCE_EVENT.BUDGET_UPDATED)
  async handleBudgetUpdated(payload: { userId: number; budget: any; category: any }) {
    await this.ingestionService.ingestSingleBudgetCategory(payload.userId, payload.budget, payload.category);
  }
}
