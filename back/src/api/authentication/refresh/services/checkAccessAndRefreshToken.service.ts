import { verifyAccessToken } from '../../../../core/jwt/accessToken';
import { decryptRefreshToken } from '../../../../core/jwt/refreshToken';
import { IAuthObject } from '../../../../core/middlewares';
import { ITokenRepository } from '../../../../repositories/token.repository';
import invalidTokenError from '../../../shared/errors/invalidToken.error';

interface ICheckRefreshTokenOptions {
  refreshToken: string;
  accessToken?: string;
  tokenRepository: ITokenRepository;
}

const getPayloadAccessAndRefreshToken = async (
  accessToken: string,
  refreshToken: string,
): Promise<{ payloadAccessToken: IAuthObject; payloadRefreshToken: IAuthObject }> => {
  try {
    const payloadAccessToken = await verifyAccessToken(accessToken, true);
    const payloadRefreshToken = decryptRefreshToken(refreshToken);

    return {
      payloadAccessToken,
      payloadRefreshToken,
    };
  } catch (error) {
    throw invalidTokenError();
  }
};

export const checkAccessAndRefreshToken = async ({
  refreshToken,
  accessToken,
  tokenRepository,
}: ICheckRefreshTokenOptions): Promise<IAuthObject> => {
  if (!accessToken) {
    throw invalidTokenError();
  }

  const { payloadAccessToken, payloadRefreshToken } = await getPayloadAccessAndRefreshToken(
    accessToken,
    refreshToken,
  );

  if (!payloadAccessToken || !payloadRefreshToken) {
    throw invalidTokenError();
  }
  if (
    payloadRefreshToken.email !== payloadAccessToken.email ||
    payloadRefreshToken.userId !== payloadAccessToken.userId
  ) {
    throw invalidTokenError();
  }

  const tokens = await tokenRepository.getAllRefreshTokensForUser(payloadAccessToken.userId);

  if (tokens.indexOf(refreshToken) === -1) {
    throw invalidTokenError();
  }

  return payloadAccessToken;
};
