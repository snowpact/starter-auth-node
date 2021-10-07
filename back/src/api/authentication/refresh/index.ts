import { Router } from 'express';
import { IApiOptions } from '../..';
import { validatedExpressRequest } from '../../../core/utils';
import route from './route';
import validationMiddleware from './validator';

export default (options: IApiOptions): Router =>
  Router().post('/refresh', validationMiddleware, validatedExpressRequest(route(options)));
