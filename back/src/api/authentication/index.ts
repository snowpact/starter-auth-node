import { Router } from 'express';

import { IApiOptions } from '..';
import login from './login';

export default (options: IApiOptions): Router => Router().use(login(options));
