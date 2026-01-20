import { Test, TestingModule } from '@nestjs/testing';
import { AudiusService } from './audius.service';

describe('AudiusService', () => {
  let service: AudiusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AudiusService],
    }).compile();

    service = module.get<AudiusService>(AudiusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
