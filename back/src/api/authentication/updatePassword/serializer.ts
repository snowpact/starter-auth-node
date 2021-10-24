import { ResponseCodes } from '../../shared/enums/responseCodes.enum';

export interface IUpdatePasswordResponse {
  message: string;
  code: ResponseCodes;
}

export default (): IUpdatePasswordResponse => ({
  message: 'Password successfully updated',
  code: ResponseCodes.USER_PASSWORD_UPDATED,
});
