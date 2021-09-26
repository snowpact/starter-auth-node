import { Response, Request, NextFunction, RequestHandler } from 'express';

import { IApiOptions } from '../..';
import { HttpStatuses } from '../../../core/httpStatuses';

export default ({ authRedisConnection }: IApiOptions): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      await authRedisConnection.exec();
      return res.send({ response: 'OK' }).status(HttpStatuses.OK);
    } catch (error) {
      return next(error);
    }
  };
