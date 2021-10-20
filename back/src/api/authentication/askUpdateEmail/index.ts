import { Router } from 'express';

import { IApiOptions } from '../..';
import { jwtMiddleware } from '../../../core/middlewares';
import { validatedExpressRequest } from '../../../core/utils';
import route from './route';

export default (options: IApiOptions): Router =>
  Router().post('/email/ask', jwtMiddleware(), validatedExpressRequest(route(options)));
