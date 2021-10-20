import { ResponseCodes } from '../../shared/enums/responseCodes.enum';

export interface IValidateEmailResponse {
  message: string;
  code: ResponseCodes;
}

export default (): IValidateEmailResponse => ({
  message: 'Email sent for validate new email',
  code: ResponseCodes.USER_ASK_UPDATE_EMAIL,
});
