import { SetBetPayload } from '@garage-bet/models';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../services/prisma-service';

@Injectable()
export class BetsService {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  async upsertBet(input: SetBetPayload, authorizationHeader?: string) {
    const user = await this.authService.me(authorizationHeader);

    if (!input.matchId) {
      throw new BadRequestException('matchId is required');
    }

    if (
      !Number.isInteger(input.homeScore) ||
      !Number.isInteger(input.awayScore)
    ) {
      throw new BadRequestException('homeScore and awayScore must be integers');
    }

    if (input.homeScore < 0 || input.awayScore < 0) {
      throw new BadRequestException('Scores cannot be negative');
    }

    const match = await this.prisma.match.findUnique({
      where: { id: input.matchId },
      select: { id: true },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    return this.prisma.bet.upsert({
      where: {
        matchId_userId: {
          matchId: input.matchId,
          userId: user.id,
        },
      },
      update: {
        homeScore: input.homeScore,
        awayScore: input.awayScore,
      },
      create: {
        matchId: input.matchId,
        userId: user.id,
        homeScore: input.homeScore,
        awayScore: input.awayScore,
      },
    });
  }
}
