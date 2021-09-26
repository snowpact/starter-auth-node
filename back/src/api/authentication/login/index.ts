import { Router } from 'express';

import { IApiOptions } from '../..';
import { validatedExpressRequest } from '../../../core/utils';
import route from './route';

export default (options: IApiOptions): Router =>
  Router().post('/login', validatedExpressRequest(route(options)));
