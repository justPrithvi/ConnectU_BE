import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { CommonService } from './common/common.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const commonService = app.get(CommonService);
  app.use(cookieParser()); // Enable cookie parsing middleware
  // commonService.startPollingSQS();
  await app.listen(3000);
}
bootstrap();
