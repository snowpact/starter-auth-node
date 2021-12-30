import { Response, Request, NextFunction } from 'express';
import { getCustomRepository } from 'typeorm';

import { IApiOptions } from '../..';
import { HttpStatuses } from '../../../core/httpStatuses';
import { connectAndSendEmail } from '../../../core/mailer';
import { RequestHandlerWithCustomRequestType } from '../../../core/utils';
import UserRepository from '../../../repositories/user.repository';
import { getValidationTokenRepository } from '../../../repositories/validationToken.repository';
import serializer from './serializer';
import service from './service';

export default ({ authRedisConnection }: IApiOptions): RequestHandlerWithCustomRequestType =>
  async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { userId } = req.jwt;
      const { logger } = req;

      await service({
        userId,
        userRepository: getCustomRepository(UserRepository),
        validationTokenRepository: getValidationTokenRepository(authRedisConnection),
        mailer: connectAndSendEmail,
        logger,
      });

      const response = serializer();

      return res.send(response).status(HttpStatuses.OK);
    } catch (error) {
      return next(error);
    }
  };
