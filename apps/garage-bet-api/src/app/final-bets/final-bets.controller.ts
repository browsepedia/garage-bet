import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AdminApiKeyGuard } from './admin-api-key.guard';
import {
  FinalBetsService,
  SetFinalAnswerDto,
  UpsertFinalBetDto,
} from './final-bets.service';

@Controller()
export class FinalBetsController {
  constructor(private readonly finalBetsService: FinalBetsService) {}

  @Get('seasons')
  listSeasons() {
    return this.finalBetsService.listSeasons();
  }

  @Get('seasons/:seasonId/final-bets')
  listFinalBetsForSeason(
    @Param('seasonId') seasonId: string,
    @Headers('authorization') authorization?: string,
  ) {
    return this.finalBetsService.listFinalBetsForSeason(seasonId, authorization);
  }

  @Get('seasons/:seasonId/final-bet')
  getFinalBet(
    @Param('seasonId') seasonId: string,
    @Headers('authorization') authorization?: string,
  ) {
    return this.finalBetsService.getFinalBetForSeason(seasonId, authorization);
  }

  @Put('seasons/:seasonId/final-bet')
  upsertFinalBet(
    @Param('seasonId') seasonId: string,
    @Body() body: UpsertFinalBetDto,
    @Headers('authorization') authorization?: string,
  ) {
    return this.finalBetsService.upsertFinalBet(seasonId, body, authorization);
  }

  @Patch('admin/seasons/:seasonId/final-answer')
  @UseGuards(AdminApiKeyGuard)
  setFinalAnswer(
    @Param('seasonId') seasonId: string,
    @Body() body: SetFinalAnswerDto,
  ) {
    return this.finalBetsService.setFinalAnswer(seasonId, body);
  }

  @Patch('admin/seasons/:seasonId/final-betting')
  @UseGuards(AdminApiKeyGuard)
  setFinalBettingOpen(
    @Param('seasonId') seasonId: string,
    @Body() body: { open: boolean },
  ) {
    return this.finalBetsService.setFinalBettingOpen(seasonId, body.open);
  }
}
