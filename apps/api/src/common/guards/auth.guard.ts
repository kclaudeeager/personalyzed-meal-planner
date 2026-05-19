import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { createClerkClient, verifyToken } from '@clerk/backend';

@Injectable()
export class AuthGuard implements CanActivate {
  private clerk: ReturnType<typeof createClerkClient>;
  private readonly secretKey: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.secretKey = this.configService.get<string>('CLERK_SECRET_KEY') ?? '';
    this.clerk = createClerkClient({ secretKey: this.secretKey });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'] as string | undefined;

    // Fallback: allow x-user-id for development convenience
    const devUserId = request.headers['x-user-id'] as string | undefined;
    if (devUserId) {
      const user = await this.prisma.user.findUnique({ where: { id: devUserId } });
      if (user) {
        request.user = user;
        return true;
      }
    }

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.slice(7);

    try {
      const payload = await verifyToken(token, { secretKey: this.secretKey });
      const clerkUserId = payload.sub;
      if (!clerkUserId) {
        throw new UnauthorizedException('Invalid token: missing subject');
      }

      let user = await this.prisma.user.findUnique({ where: { clerkId: clerkUserId } });

      if (!user) {
        const clerkUser = await this.clerk.users.getUser(clerkUserId);
        user = await this.prisma.user.create({
          data: {
            clerkId: clerkUserId,
            email: clerkUser.emailAddresses[0]?.emailAddress ?? `${clerkUserId}@clerk.user`,
            fullName: clerkUser.fullName ?? 'Clerk User',
          },
        });
      }

      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
