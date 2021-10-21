import { ResponseCodes } from '../../shared/enums/responseCodes.enum';

export interface IValidateEmailResponse {
  message: string;
  code: ResponseCodes;
}

export default (): IValidateEmailResponse => ({
  message: 'Email successfully changed',
  code: ResponseCodes.USER_EMAIL_UPDATED,
});
