import { Response, NextFunction, RequestHandler } from 'express';
import { getCustomRepository } from 'typeorm';

import { IApiOptions } from '../..';
import { HttpStatuses } from '../../../core/httpStatuses';
import { ValidatedRequest } from '../../../core/utils';
import UserRepository from '../../../repositories/user.repository';
import { getValidationTokenRepository } from '../../../repositories/validationToken.repository';
import serializer from './serializer';
import service from './service';
import { IValidateEmailRequest } from './validator';

type ValidateEmailRequest = ValidatedRequest<IValidateEmailRequest>;

export default ({ authRedisConnection }: IApiOptions): RequestHandler =>
  async (
    req: ValidateEmailRequest,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const { token } = req.body;

      await service({
        token,
        userRepository: getCustomRepository(UserRepository),
        validationTokenRepository: getValidationTokenRepository(authRedisConnection),
      });

      const response = serializer();

      return res.send(response).status(HttpStatuses.OK);
    } catch (error) {
      return next(error);
    }
  };
