import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../../src/app.module';
import { INestApplication } from '@nestjs/common';

export const createModuleFixture = async (): Promise<INestApplication> => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app: INestApplication = moduleFixture.createNestApplication();
  await app.init();
  return app;
};
