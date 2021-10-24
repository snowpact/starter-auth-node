import { Router } from 'express';

import { IApiOptions } from '..';
import askEmailValidation from './askEmailValidation';
import askResetPassword from './askResetPassword';
import askUpdateEmail from './askUpdateEmail';
import login from './login';
import refresh from './refresh';
import register from './register';
import resetPassword from './resetPassword';
import updateEmail from './updateEmail';
import updatePassword from './updatePassword';
import validateEmail from './validateEmail';

export default (options: IApiOptions): Router =>
  Router().use(
    login(options),
    register(options),
    refresh(options),
    askUpdateEmail(options),
    askEmailValidation(options),
    askResetPassword(options),
    validateEmail(options),
    updateEmail(options),
    resetPassword(options),
    updatePassword(options),
  );
