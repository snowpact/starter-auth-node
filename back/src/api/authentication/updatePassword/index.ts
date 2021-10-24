import { Router } from 'express';

import { IApiOptions } from '../..';
import { jwtMiddleware } from '../../../core/middlewares';
import { validatedExpressRequest } from '../../../core/utils';
import route from './route';
import validationMiddleware from './validator';

export default (options: IApiOptions): Router =>
  Router().patch(
    '/password',
    jwtMiddleware(),
    validationMiddleware,
    validatedExpressRequest(route(options)),
  );
