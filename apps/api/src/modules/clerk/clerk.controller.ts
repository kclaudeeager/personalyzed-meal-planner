import { Controller, Post, Headers, Body, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('clerk')
@Controller('clerk')
export class ClerkController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  @Post('webhook')
  @ApiOperation({ summary: 'Receive Clerk webhook events for user sync' })
  async handleWebhook(
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
    @Body() payload: Record<string, unknown>,
  ) {
    const webhookSecret = this.configService.get<string>('CLERK_WEBHOOK_SECRET');
    if (webhookSecret) {
      try {
        const { Webhook } = require('svix');
        const wh = new Webhook(webhookSecret);
        wh.verify(JSON.stringify(payload), {
          'svix-id': svixId,
          'svix-timestamp': svixTimestamp,
          'svix-signature': svixSignature,
        });
      } catch (e) {
        if ((e as any)?.code === 'MODULE_NOT_FOUND') {
          // svix not installed — skip verification in dev
        } else {
          throw new BadRequestException('Invalid webhook signature');
        }
      }
    }

    const type = payload.type as string;
    const data = payload.data as Record<string, any> | undefined;
    if (!data) return { received: true };

    if (type === 'user.created' || type === 'user.updated') {
      const clerkId = data.id as string;
      const email = data.email_addresses?.[0]?.email_address ?? '';
      const fullName = data.first_name && data.last_name
        ? `${data.first_name} ${data.last_name}`
        : data.first_name || data.last_name || 'Clerk User';

      await this.prisma.user.upsert({
        where: { clerkId },
        create: { clerkId, email, fullName },
        update: { email, fullName },
      });
    }

    if (type === 'user.deleted') {
      const clerkId = data.id as string;
      await this.prisma.user.deleteMany({ where: { clerkId } });
    }

    return { received: true };
  }
}
