import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { RagService } from './rag.service';

@Injectable()
export class IngestionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rag: RagService,
  ) { }

  async ingestFinanceUser(userId: number) {
    // 1. Ingest Wallets
    const wallets = await this.prisma.wallet.findMany({ where: { userId } });
    for (const wallet of wallets) {
      const content = `Wallet '${wallet.name}': current balance is ${wallet.balance} ${wallet.currency}. Created on ${wallet.createdAt.toDateString()}.`;
      const embedding = await this.rag.embedText(content, userId);
      await this.rag.saveEmbedding({
        userId,
        domain: 'finance',
        entityType: 'Wallet',
        entityId: wallet.id,
        content,
        embedding,
      });
    }

    // 2. Ingest Transactions (Limit to last 100 for now to avoid overhead)
    const transactions = await this.prisma.transaction.findMany({
      where: { wallet: { userId } },
      orderBy: { date: 'desc' },
      take: 100,
      include: { wallet: true, toWallet: true, allocation: true },
    });
    for (const tx of transactions) {
      let content = `Transaction on ${tx.date.toDateString()}: ${tx.type} of ${tx.amount} in wallet '${tx.wallet.name}'.`;
      if (tx.allocation?.name) content += ` Category: ${tx.allocation.name}.`;
      if (tx.note) content += ` Note: ${tx.note}.`;
      if (tx.toWallet)
        content += ` Transferred to wallet '${tx.toWallet.name}'.`;

      const embedding = await this.rag.embedText(content, userId);
      await this.rag.saveEmbedding({
        userId,
        domain: 'finance',
        entityType: 'Transaction',
        entityId: tx.id,
        content,
        embedding,
      });
    }

    // 3. Ingest Assets
    const assets = await this.prisma.asset.findMany({ where: { userId } });
    for (const asset of assets) {
      const content = `Asset '${asset.name}' (type: ${asset.type}): current value is ${asset.value}. Description: ${asset.description || 'N/A'}.`;
      const embedding = await this.rag.embedText(content, userId);
      await this.rag.saveEmbedding({
        userId,
        domain: 'finance',
        entityType: 'Asset',
        entityId: asset.id,
        content,
        embedding,
      });
    }

    // 4. Ingest Loans
    const loans = await this.prisma.loan.findMany({ where: { userId } });
    for (const loan of loans) {
      const content = `Loan (${loan.type}) from/to ${loan.counterparty}: principal ${loan.principal}, remaining ${loan.remaining}. Status: ${loan.status}. Due date: ${loan.dueDate?.toDateString() || 'N/A'}.`;
      const embedding = await this.rag.embedText(content, userId);
      await this.rag.saveEmbedding({
        userId,
        domain: 'finance',
        entityType: 'Loan',
        entityId: loan.id,
        content,
        embedding,
      });
    }

    // 5. Ingest Budgets
    const budgets = await this.prisma.monthlyBudget.findMany({
      where: { userId },
      include: { categories: true },
    });
    for (const budget of budgets) {
      for (const cat of budget.categories) {
        const content = `Budget for ${budget.month}/${budget.year}: Category '${cat.name}' has a limit of ${cat.limitAmount} and spent ${cat.spentAmount}. Automation enabled: ${cat.isAutomationEnabled}.`;
        const embedding = await this.rag.embedText(content, userId);
        await this.rag.saveEmbedding({
          userId,
          domain: 'finance',
          entityType: 'BudgetCategory',
          entityId: cat.id,
          content,
          embedding,
          metadata: { budgetId: budget.id },
        });
      }
    }
  }

  async ingestSingleWallet(userId: number, wallet: any) {
    const content = `Wallet '${wallet.name}': current balance is ${wallet.balance} ${wallet.currency}. Created on ${wallet.createdAt.toDateString()}.`;
    const embedding = await this.rag.embedText(content, userId);
    await this.rag.saveEmbedding({
      userId,
      domain: 'finance',
      entityType: 'Wallet',
      entityId: wallet.id,
      content,
      embedding,
    });
  }

  async ingestSingleTransaction(userId: number, tx: any) {
    let content = `Transaction on ${new Date(tx.date).toDateString()}: ${tx.type} of ${tx.amount} in wallet '${tx.wallet?.name || 'Unknown'}'.`;
    if (tx.allocation?.name) content += ` Category: ${tx.allocation.name}.`;
    if (tx.note) content += ` Note: ${tx.note}.`;
    if (tx.toWallet) content += ` Transferred to wallet '${tx.toWallet.name}'.`;

    const embedding = await this.rag.embedText(content, userId);
    await this.rag.saveEmbedding({
      userId,
      domain: 'finance',
      entityType: 'Transaction',
      entityId: tx.id,
      content,
      embedding,
    });
  }

  async ingestSingleAsset(userId: number, asset: any) {
    const content = `Asset '${asset.name}' (type: ${asset.type}): current value is ${asset.value}. Description: ${asset.description || 'N/A'}.`;
    const embedding = await this.rag.embedText(content, userId);
    await this.rag.saveEmbedding({
      userId,
      domain: 'finance',
      entityType: 'Asset',
      entityId: asset.id,
      content,
      embedding,
    });
  }

  async ingestSingleLoan(userId: number, loan: any) {
    const content = `Loan (${loan.type}) from/to ${loan.counterparty}: principal ${loan.principal}, remaining ${loan.remaining}. Status: ${loan.status}. Due date: ${loan.dueDate ? new Date(loan.dueDate).toDateString() : 'N/A'}.`;
    const embedding = await this.rag.embedText(content, userId);
    await this.rag.saveEmbedding({
      userId,
      domain: 'finance',
      entityType: 'Loan',
      entityId: loan.id,
      content,
      embedding,
    });
  }

  async ingestSingleBudgetCategory(userId: number, budget: any, cat: any) {
    const content = `Budget for ${budget.month}/${budget.year}: Category '${cat.name}' has a limit of ${cat.limitAmount} and spent ${cat.spentAmount}. Automation enabled: ${cat.isAutomationEnabled}.`;
    const embedding = await this.rag.embedText(content, userId);
    await this.rag.saveEmbedding({
      userId,
      domain: 'finance',
      entityType: 'BudgetCategory',
      entityId: cat.id,
      content,
      embedding,
      metadata: { budgetId: budget.id },
    });
  }

  async deleteVector(entityType: string, entityId: number) {
    await this.rag.deleteEmbedding(entityType, entityId);
  }
}
