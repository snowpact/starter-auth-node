import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import config from '../../loader/config';
import { IAuthObject } from './AuthObject';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 32;

export const generateRefreshToken = (generateJwtOptions: IAuthObject): string => {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, config.REFRESH_TOKEN_SECRET, iv);
  const encrypted = cipher.update(JSON.stringify(generateJwtOptions), 'ascii');
  return Buffer.concat([iv, encrypted]).toString('hex');
};

export const decryptRefreshToken = (refreshToken: string): IAuthObject => {
  try {
    const refreshBuffer = Buffer.from(refreshToken, 'hex');
    const ivBuffer = refreshBuffer.slice(0, IV_LENGTH);
    const tokenBuffer = refreshBuffer.slice(IV_LENGTH);

    const decipher = createDecipheriv(ALGORITHM, config.REFRESH_TOKEN_SECRET, ivBuffer);
    const decrypted = decipher.update(tokenBuffer, 'binary', 'ascii');

    return JSON.parse(decrypted) as IAuthObject;
  } catch (error: any) {
    if (error instanceof SyntaxError || error.message === 'Invalid IV length') {
      throw error;
    }

    throw error;
  }
};
