import { Response, NextFunction } from 'express';
import { getCustomRepository } from 'typeorm';

import { IApiOptions } from '../..';
import { HttpStatuses } from '../../../core/httpStatuses';
import { connectAndSendEmail } from '../../../core/mailer';
import { RequestHandlerWithCustomRequestType, ValidatedRequest } from '../../../core/utils';
import UserRepository from '../../../repositories/user.repository';
import { getValidationTokenRepository } from '../../../repositories/validationToken.repository';
import serializer from './serializer';
import service from './service';
import { IRegisterRequest } from './validator';

type RegisterRequest = ValidatedRequest<IRegisterRequest>;

export default ({ authRedisConnection }: IApiOptions): RequestHandlerWithCustomRequestType =>
  async (req: RegisterRequest, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      await authRedisConnection.multi().exec();

      const { email, password } = req.body;

      await service({
        email,
        password,
        userRepository: getCustomRepository(UserRepository),
        validationTokenRepository: getValidationTokenRepository(authRedisConnection),
        mailer: connectAndSendEmail,
      });

      const response = serializer();

      return res.send(response).status(HttpStatuses.OK);
    } catch (error) {
      return next(error);
    }
  };
