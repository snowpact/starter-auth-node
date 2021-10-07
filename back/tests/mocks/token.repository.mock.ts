import { ITokenRepository } from '../../src/repositories/token.repository';

export interface ITokensRepositoryMockOptions {
  getAllRefreshTokensForUser?: string[];
  storeRefreshToken?: [Error | null, any][];
  deleteTokensForUser?: number;
  refreshTokens?: [Error | null, any][];
  removeRT?: number | null;
}

export default (options?: ITokensRepositoryMockOptions): ITokenRepository => ({
  getAllRefreshTokensForUser: jest
    .fn()
    .mockResolvedValue(options?.getAllRefreshTokensForUser || []),
  storeRefreshToken: jest.fn().mockResolvedValue(options?.storeRefreshToken),
  deleteTokensForUser: jest.fn().mockResolvedValue(options?.deleteTokensForUser),
  refreshTokens: jest.fn().mockResolvedValue(options?.refreshTokens),
  removeRT: jest.fn().mockResolvedValue(options?.removeRT),
});
