import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { databaseConstants } from 'src/constants';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: databaseConstants.databaseString as string,
    });
    super({ adapter });
  }
}
