import { buildValidationMiddleware } from '../../../core/middlewares';
import { validator } from '../../../core/validator';

export interface IResetPasswordRequest {
  body: {
    token: string;
    password: string;
  };
}

export const resetPasswordValidator = {
  body: validator.object({
    token: validator.string().uuid().required(),
    password: validator
      .string()
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)
      .required(),
  }),
};

export default buildValidationMiddleware(resetPasswordValidator);
