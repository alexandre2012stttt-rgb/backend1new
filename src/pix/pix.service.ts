// src/pix/pix.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class PixService {
  private readonly logger = new Logger(PixService.name);

  constructor(private readonly prisma: PrismaService) {}

  gerarPix() {
    return { mensagem: 'PIX gerado com sucesso!' };
  }

  // processar webhook vindo da WiinPay
  async processarWebhook(data: any) {
    const status = data?.status || data?.paymentStatus || null;
    const metadata = data?.metadata || {};
    const planDurationDays = metadata?.durationDays
      ? Number(metadata.durationDays)
      : 30;

    if (!status) {
      this.logger.warn('Webhook sem status válido');
      return { ok: false };
    }

    if (status !== 'PAID') {
      this.logger.log('Pagamento ainda não aprovado: ' + status);
      return { ok: true };
    }

    const code = this.generateCode();

    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + planDurationDays * 24 * 60 * 60 * 1000,
    );

    const subscription = await this.prisma.subscription.create({
      data: {
        code,
        status: 'ACTIVE',
        expiresAt,
      },
    });

    this.logger.log(`Pagamento aprovado. Código gerado: ${code}`);

    return {
      ok: true,
      code,
      subscriptionId: subscription.id,
      expiresAt: subscription.expiresAt,
    };
  }

  private generateCode(length = 9) {
    return randomBytes(16).toString('hex').slice(0, length).toUpperCase();
  }

  async getStatusByPaymentIdOrCode(idOrCode: string) {
    const sub = await this.prisma.subscription.findFirst({
      where: {
        OR: [
          { id: idOrCode },
          { code: idOrCode }
        ],
      },
    });

    if (!sub) {
      return { status: 'not_found' };
    }

    return {
      paymentId: sub.id,
      status: sub.status,
      accessCode: sub.code,
      expiresAt: sub.expiresAt,
    };
  }
}
