import { Router } from 'express';

import { IApiOptions } from '../..';
import { validatedExpressRequest } from '../../../core/utils';
import route from './route';
import validationMiddleware from './validator';

export default (options: IApiOptions): Router =>
  Router().post('/email/validate', validationMiddleware, validatedExpressRequest(route(options)));
