import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @UseGuards(JwtAuthGuard)
  @Post('save')
  async saveAnalysis(@Request() req) {
    const userId = req.user.userId;
    return this.analysisService.saveAnalysis(userId);
  }
}