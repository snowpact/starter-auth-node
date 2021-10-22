import { ResponseCodes } from '../../shared/enums/responseCodes.enum';

export interface IAskUpdateEmailResponse {
  message: string;
  code: ResponseCodes;
}

export default (): IAskUpdateEmailResponse => ({
  message: 'Email sent for update email',
  code: ResponseCodes.USER_ASK_UPDATE_EMAIL,
});
