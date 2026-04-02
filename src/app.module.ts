import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [UserModule, AuthModule, CategoryModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

//TODO: Add Transaction and Category modules