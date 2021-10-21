import { Router } from 'express';

import { IApiOptions } from '..';
import askUpdateEmail from './askUpdateEmail';
import login from './login';
import refresh from './refresh';
import register from './register';
import updateEmail from './updateEmail';
import validateEmail from './validateEmail';

export default (options: IApiOptions): Router =>
  Router().use(
    login(options),
    register(options),
    refresh(options),
    validateEmail(options),
    askUpdateEmail(options),
    updateEmail(options),
  );
