import { buildValidationMiddleware } from '../../../core/middlewares';
import { validator } from '../../../core/validator';

export interface IUpdateEmailRequest {
  body: {
    token: string;
    email: string;
    password: string;
  };
}

export const updateEmailValidator = {
  body: validator.object({
    token: validator.string().uuid().required(),
    email: validator.string().email().required(),
    password: validator.string().required(),
  }),
};

export default buildValidationMiddleware(updateEmailValidator);
