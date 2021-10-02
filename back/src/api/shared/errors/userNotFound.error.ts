import { buildError, IAppError } from '../../../core/buildError';
import { HttpStatuses } from '../../../core/httpStatuses';
import { ErrorCodes } from '../enums/errorCodes.enum';

export default (): IAppError =>
  buildError({
    message: 'User email not found',
    publicMessage: 'User email not found',
    code: ErrorCodes.USER_NOT_FOUND,
    statusCode: HttpStatuses.NOT_FOUND,
  });
