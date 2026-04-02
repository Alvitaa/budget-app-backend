import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { AccountModule } from './account/account.module';

@Module({
  imports: [UserModule, AuthModule, CategoryModule, AccountModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

//TODO: Add Transaction modules