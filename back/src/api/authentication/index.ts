import { Router } from 'express';

import { IApiOptions } from '..';
import login from './login';
import register from './register';

export default (options: IApiOptions): Router => Router().use(login(options), register(options));
