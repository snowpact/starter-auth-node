import { Response, NextFunction } from 'express';
import { getCustomRepository } from 'typeorm';

import { IApiOptions } from '../..';
import { HttpStatuses } from '../../../core/httpStatuses';
import { connectAndSendEmail } from '../../../core/mailer';
import { RequestHandlerWithCustomRequestType, ValidatedRequest } from '../../../core/utils';
import { getTokenRepository } from '../../../repositories/token.repository';
import UserRepository from '../../../repositories/user.repository';
import serializer from './serializer';
import service from './service';
import { IUpdatePasswordRequest } from './validator';

type UpdatePasswordRequest = ValidatedRequest<IUpdatePasswordRequest>;

export default ({ authRedisConnection }: IApiOptions): RequestHandlerWithCustomRequestType =>
  async (
    req: UpdatePasswordRequest,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const { userId } = req.jwt;
      const { oldPassword, newPassword } = req.body;

      await service({
        userId,
        oldPassword,
        newPassword,
        userRepository: getCustomRepository(UserRepository),
        tokenRepository: getTokenRepository(authRedisConnection),
        mailer: connectAndSendEmail,
      });

      const response = serializer();

      return res.send(response).status(HttpStatuses.OK);
    } catch (error) {
      return next(error);
    }
  };
