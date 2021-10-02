import { Response, NextFunction, RequestHandler } from 'express';
import { getCustomRepository } from 'typeorm';

import { IApiOptions } from '../..';
import { HttpStatuses } from '../../../core/httpStatuses';
import { ValidatedRequest } from '../../../core/utils';
import UserRepository from '../../../repositories/user.repository';
import service from './service';
import { ILoginRequest } from './validator';

type LoginRequest = ValidatedRequest<ILoginRequest>;

export default ({ authRedisConnection }: IApiOptions): RequestHandler =>
  async (req: LoginRequest, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      await authRedisConnection.multi().exec();

      const { email, password } = req.body;

      await service({ email, password, userRepository: getCustomRepository(UserRepository) });

      return res.send({ response: 'OK' }).status(HttpStatuses.OK);
    } catch (error) {
      return next(error);
    }
  };
