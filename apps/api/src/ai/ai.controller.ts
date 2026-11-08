import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AIService, AIGenerationRequest } from './ai.service';

@ApiTags('AI Assistant')
@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate structured JSON project or element tree from prompt' })
  async generate(@Body() body: AIGenerationRequest) {
    return this.aiService.generate(body);
  }
}
