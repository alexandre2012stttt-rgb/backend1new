import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma'; // <-- CAMINHO CORRETO 100%

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect(); // funciona no Prisma 7 sim
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
