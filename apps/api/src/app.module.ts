import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { TemplatesModule } from './templates/templates.module';
import { ExportsModule } from './exports/exports.module';
import { AIModule } from './ai/ai.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    ProjectsModule,
    TemplatesModule,
    ExportsModule,
    AIModule,
  ],
})
export class AppModule {}

