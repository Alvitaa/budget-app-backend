import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { AccountModule } from './account/account.module';
import { TransactionModule } from './transaction/transaction.module';
import { TransferModule } from './transfer/transfer.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    CategoryModule,
    AccountModule,
    TransactionModule,
    TransferModule,
    AnalyticsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
