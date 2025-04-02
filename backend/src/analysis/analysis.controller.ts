import { Controller, Post, Body, Get, UseGuards, Request, Param, UnauthorizedException } from '@nestjs/common';
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

  @UseGuards(JwtAuthGuard)
  @Get(':analysisId')
  async getAnalysis(@Param('analysisId') analysisId: string, @Request() req) {
    const userId = req.user.userId;
    if (!userId) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }
  
    return this.analysisService.getAnalysisById(analysisId, userId);
  }
}