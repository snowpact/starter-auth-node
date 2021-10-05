import { IGenerateJwtOptions } from '../../../../../src/api/shared/services/jwt/accessToken.service';
import {
  generateRefreshToken,
  decryptRefreshToken,
} from '../../../../../src/api/shared/services/jwt/refreshToken.service';

describe('refresh token service', () => {
  it('should generate and decrypt refresh token correctly', async () => {
    const refreshTokenObject: IGenerateJwtOptions = {
      email: 'test@gmail.com',
      userId: '97161665-213e-4ecd-adaf-aea47ef9d8f5',
    };

    const refreshToken = generateRefreshToken(refreshTokenObject);
    const decryptedRefreshToken = decryptRefreshToken(refreshToken);

    expect(decryptedRefreshToken?.email).toBe(refreshTokenObject.email);
    expect(decryptedRefreshToken?.userId).toBe(refreshTokenObject.userId);
  });
});
