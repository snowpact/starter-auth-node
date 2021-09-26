import { ILogger } from '../logger';

export const buildLoggerMock = (): ILogger => ({
  debug: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  trace: jest.fn(),
  warn: jest.fn(),
});
