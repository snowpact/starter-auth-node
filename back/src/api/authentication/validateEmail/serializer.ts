import { ResponseCodes } from '../../shared/enums/responseCodes.enum';

export interface IValidateEmailResponse {
  message: string;
  code: ResponseCodes;
}

export default (): IValidateEmailResponse => ({
  message: 'User email successfully validated',
  code: ResponseCodes.USER_EMAIL_VALIDATED,
});
