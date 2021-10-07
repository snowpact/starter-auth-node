import usersRepositoryMock from '../../../mocks/user.repository.mock';
import { userEntityFactory } from '../../../helpers/factories/user.factory';
import service from '../../../../src/api/authentication/refresh/service';
import { hashPassword } from '../../../../src/api/shared/services/password.service';
import tokenRepositoryMock from '../../../mocks/token.repository.mock';
import { generateAccessToken } from '../../../../src/core/jwt/accessToken';
import { generateRefreshToken } from '../../../../src/core/jwt/refreshToken';
import { ErrorCodes } from '../../../../src/api/shared/enums/errorCodes.enum';
import { HttpStatuses } from '../../../../src/core/httpStatuses';

describe('refresh service', () => {
  it('should refresh token correctly', async () => {
    const password = 'password';
    const hashedPassword = await hashPassword(password);
    const user = userEntityFactory({ password: hashedPassword });
    const userRepository = usersRepositoryMock({ getOneById: user });
    const accessToken = await generateAccessToken({ email: user.email, userId: user.id });
    const refreshToken = generateRefreshToken({ email: user.email, userId: user.id });
    const tokenRepository = tokenRepositoryMock({ getAllRefreshTokensForUser: [refreshToken] });

    const response = await service({
      accessToken,
      refreshToken,
      userRepository,
      tokenRepository,
    });

    expect(response.accessToken).toBeDefined();
    expect(response.refreshToken).toBeDefined();
    expect(userRepository.getOneById).toBeCalledWith(user.id);
    expect(tokenRepository.getAllRefreshTokensForUser).toBeCalledWith(user.id);
    expect(tokenRepository.refreshTokens).toBeCalled();
  });
  it('should not refresh token - refresh token not found', async () => {
    const password = 'password';
    const hashedPassword = await hashPassword(password);
    const user = userEntityFactory({ password: hashedPassword });
    const userRepository = usersRepositoryMock({ getOneById: user });
    const accessToken = await generateAccessToken({ email: user.email, userId: user.id });
    const refreshToken = generateRefreshToken({ email: user.email, userId: user.id });
    const tokenRepository = tokenRepositoryMock({ getAllRefreshTokensForUser: [] });

    try {
      await service({
        accessToken,
        refreshToken,
        userRepository,
        tokenRepository,
      });
    } catch (error: any) {
      expect(error.code).toBe(ErrorCodes.INVALID_TOKEN_UNAUTHORIZED);
      expect(error.statusCode).toBe(HttpStatuses.UNAUTHORIZED);
    }
  });
  it('should not refresh token - access token not provided', async () => {
    const password = 'password';
    const hashedPassword = await hashPassword(password);
    const user = userEntityFactory({ password: hashedPassword });
    const userRepository = usersRepositoryMock({ getOneById: user });
    const refreshToken = generateRefreshToken({ email: user.email, userId: user.id });
    const tokenRepository = tokenRepositoryMock({ getAllRefreshTokensForUser: [refreshToken] });

    try {
      await service({
        refreshToken,
        userRepository,
        tokenRepository,
      });
    } catch (error: any) {
      expect(error.code).toBe(ErrorCodes.INVALID_TOKEN_UNAUTHORIZED);
      expect(error.statusCode).toBe(HttpStatuses.UNAUTHORIZED);
    }
  });
  it('should not refresh token - user not found in database', async () => {
    const password = 'password';
    const hashedPassword = await hashPassword(password);
    const user = userEntityFactory({ password: hashedPassword });
    const userRepository = usersRepositoryMock({});
    const accessToken = await generateAccessToken({ email: user.email, userId: user.id });
    const refreshToken = generateRefreshToken({ email: user.email, userId: user.id });
    const tokenRepository = tokenRepositoryMock({ getAllRefreshTokensForUser: [refreshToken] });

    try {
      await service({
        accessToken,
        refreshToken,
        userRepository,
        tokenRepository,
      });
    } catch (error: any) {
      expect(error.code).toBe(ErrorCodes.USER_NOT_FOUND);
      expect(error.statusCode).toBe(HttpStatuses.NOT_FOUND);
    }
  });
  it('should not refresh token - user blocked', async () => {
    const password = 'password';
    const hashedPassword = await hashPassword(password);
    const user = userEntityFactory({ password: hashedPassword, blocked: true });
    const userRepository = usersRepositoryMock({ getOneById: user });
    const accessToken = await generateAccessToken({ email: user.email, userId: user.id });
    const refreshToken = generateRefreshToken({ email: user.email, userId: user.id });
    const tokenRepository = tokenRepositoryMock({ getAllRefreshTokensForUser: [refreshToken] });

    try {
      await service({
        accessToken,
        refreshToken,
        userRepository,
        tokenRepository,
      });
    } catch (error: any) {
      expect(error.code).toBe(ErrorCodes.USER_BLOCKED_UNAUTHORIZED);
      expect(error.statusCode).toBe(HttpStatuses.UNAUTHORIZED);
    }
  });
  it('should not refresh token - user not enabled', async () => {
    const password = 'password';
    const hashedPassword = await hashPassword(password);
    const user = userEntityFactory({ password: hashedPassword, enabled: false });
    const userRepository = usersRepositoryMock({ getOneById: user });
    const accessToken = await generateAccessToken({ email: user.email, userId: user.id });
    const refreshToken = generateRefreshToken({ email: user.email, userId: user.id });
    const tokenRepository = tokenRepositoryMock({ getAllRefreshTokensForUser: [refreshToken] });

    try {
      await service({
        accessToken,
        refreshToken,
        userRepository,
        tokenRepository,
      });
    } catch (error: any) {
      expect(error.code).toBe(ErrorCodes.USER_NOT_ENABLED_UNAUTHORIZED);
      expect(error.statusCode).toBe(HttpStatuses.UNAUTHORIZED);
    }
  });
});
