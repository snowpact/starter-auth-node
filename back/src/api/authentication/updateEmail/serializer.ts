import { ResponseCodes } from '../../shared/enums/responseCodes.enum';

export interface IUpdateEmailResponse {
  message: string;
  code: ResponseCodes;
}

export default (): IUpdateEmailResponse => ({
  message: 'Email successfully changed',
  code: ResponseCodes.USER_EMAIL_UPDATED,
});
