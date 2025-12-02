// src/pix/pix.webhook.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  Headers,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PixService } from './pix.service';

@Controller('pix')
export class PixWebhookController {
  private readonly logger = new Logger(PixWebhookController.name);

  constructor(private readonly pixService: PixService) {}

  @Post('webhook')
  @HttpCode(200)
  async webhook(@Body() body: any, @Headers() headers: any) {
    /**
     * ⚠️ WIINPAY NÃO FORNECE ASSINATURA DOCUMENTADA
     * Para evitar bloquear webhook válido, aceitamos SEM validação.
     * Apenas recomenda-se ativar validação quando WiinPay enviar docs oficiais.
     */

    if (!body) {
      throw new BadRequestException('Body vazio');
    }

    this.logger.log(
      '[WiinPay Webhook Recebido] ' + JSON.stringify(body, null, 2),
    );

    // processar pagamento
    return this.pixService.processarWebhook(body);
  }
}
