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
import { IUpdateEmailRequest } from './validator';

type UpdateEmailRequest = ValidatedRequest<IUpdateEmailRequest>;

export default ({ authRedisConnection }: IApiOptions): RequestHandlerWithCustomRequestType =>
  async (req: UpdateEmailRequest, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { token, password, email } = req.body;

      await service({
        token,
        password,
        email,
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
