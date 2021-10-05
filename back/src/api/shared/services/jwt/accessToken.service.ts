import { sign } from 'jsonwebtoken';
import config from '../../../../loader/config';

export interface IGenerateJwtOptions {
  userId: string;
  email: string;
}

export const generateAccessToken = (generateJwtOptions: IGenerateJwtOptions): string => {
  return sign(generateJwtOptions, config.ACCESS_TOKEN_SECRET, {
    expiresIn: config.ACCESS_TOKEN_LIFE,
  });
};
