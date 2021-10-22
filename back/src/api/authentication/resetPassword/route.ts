import { Response, NextFunction } from 'express';
import { getCustomRepository } from 'typeorm';

import { IApiOptions } from '../..';
import { HttpStatuses } from '../../../core/httpStatuses';
import { RequestHandlerWithCustomRequestType, ValidatedRequest } from '../../../core/utils';
import UserRepository from '../../../repositories/user.repository';
import { getValidationTokenRepository } from '../../../repositories/validationToken.repository';
import serializer from './serializer';
import service from './service';
import { IResetPasswordRequest } from './validator';

type ResetPasswordRequest = ValidatedRequest<IResetPasswordRequest>;

export default ({ authRedisConnection }: IApiOptions): RequestHandlerWithCustomRequestType =>
  async (
    req: ResetPasswordRequest,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const { token, password } = req.body;

      await service({
        token,
        password,
        userRepository: getCustomRepository(UserRepository),
        validationTokenRepository: getValidationTokenRepository(authRedisConnection),
      });

      const response = serializer();

      return res.send(response).status(HttpStatuses.OK);
    } catch (error) {
      return next(error);
    }
  };
