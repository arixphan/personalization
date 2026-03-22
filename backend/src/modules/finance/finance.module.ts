import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { AssetController } from './asset.controller';
import { AssetService } from './asset.service';
import { LoanController } from './loan.controller';
import { LoanService } from './loan.service';
import { BudgetController } from './budget.controller';
import { BudgetService } from './budget.service';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { FinanceCronService } from './finance-cron.service';
import { PrismaModule } from '../prisma/prisma.module';
@Module({
  imports: [PrismaModule],
  controllers: [
    WalletController,
    AssetController,
    LoanController,
    BudgetController,
    TransactionController,
    DashboardController,
  ],
  providers: [
    WalletService,
    AssetService,
    LoanService,
    BudgetService,
    TransactionService,
    DashboardService,
    FinanceCronService,
  ],
  exports: [
    WalletService,
    AssetService,
    LoanService,
    BudgetService,
    TransactionService,
    DashboardService,
    FinanceCronService,
  ],
})
export class FinanceModule { }
