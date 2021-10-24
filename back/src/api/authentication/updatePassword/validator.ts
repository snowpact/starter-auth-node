import { buildValidationMiddleware } from '../../../core/middlewares';
import { validator } from '../../../core/validator';

export interface IUpdatePasswordRequest {
  body: {
    oldPassword: string;
    newPassword: string;
  };
}

export const updatePasswordValidator = {
  body: validator.object({
    oldPassword: validator.string().required(),
    newPassword: validator
      .string()
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)
      .required(),
  }),
};

export default buildValidationMiddleware(updatePasswordValidator);
