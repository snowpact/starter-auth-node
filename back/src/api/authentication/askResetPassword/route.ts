import { Response, NextFunction } from 'express';
import { getCustomRepository } from 'typeorm';

import { IApiOptions } from '../..';
import { HttpStatuses } from '../../../core/httpStatuses';
import { RequestHandlerWithCustomRequestType, ValidatedRequest } from '../../../core/utils';
import UserRepository from '../../../repositories/user.repository';
import { getValidationTokenRepository } from '../../../repositories/validationToken.repository';
import serializer from './serializer';
import service from './service';
import { IAskResetPasswordRequest } from './validator';

type AskResetPasswordRequest = ValidatedRequest<IAskResetPasswordRequest>;

export default ({ authRedisConnection }: IApiOptions): RequestHandlerWithCustomRequestType =>
  async (
    req: AskResetPasswordRequest,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const { email } = req.body;

      await service({
        email,
        userRepository: getCustomRepository(UserRepository),
        validationTokenRepository: getValidationTokenRepository(authRedisConnection),
      });

      const response = serializer();

      return res.send(response).status(HttpStatuses.OK);
    } catch (error) {
      return next(error);
    }
  };
