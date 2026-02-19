import { SetBetPayload } from '@garage-bet/models';
import { Body, Controller, Headers, Post } from '@nestjs/common';
import { BetsService } from './bets.service';

@Controller('bets')
export class BetsController {
  constructor(private readonly betsService: BetsService) {}

  @Post()
  upsertBet(
    @Body() input: SetBetPayload,
    @Headers('authorization') authorization?: string,
  ) {
    return this.betsService.upsertBet(input, authorization);
  }
}
