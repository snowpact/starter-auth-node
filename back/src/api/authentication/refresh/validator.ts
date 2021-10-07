import { buildValidationMiddleware } from '../../../core/middlewares';
import { validator } from '../../../core/validator';

export interface IRefreshRequest {
  body: {
    refreshToken: string;
  };
}

export const RefreshValidator = {
  body: validator.object({
    refreshToken: validator.string().required(),
  }),
};

export default buildValidationMiddleware(RefreshValidator);
