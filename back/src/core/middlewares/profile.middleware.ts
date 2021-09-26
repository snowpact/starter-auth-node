import { Request, Response, NextFunction } from 'express';

import { buildError } from '../buildError';
import { HttpStatuses } from '../httpStatuses';

export interface RequestWithProfile extends Request {
  profileId: number;
}

const checkHeaderAndReturnProfileId = (header: string | undefined): number => {
  if (!header) {
    return 1;
  }
  const profileId = Number(header);
  if (profileId && Number.isInteger(profileId) && profileId >= 1) {
    return profileId;
  }
  throw buildError({
    message: 'Profile ID should be an integer and greater than or equal to 1.',
    publicMessage: 'Profile ID should be an integer and greater than or equal to 1.',
    code: 'bad-x-profile-id',
    statusCode: HttpStatuses.IM_A_TEAPOT,
  });
};

/**
 * Build profile middleware. It looks for X-Profile-ID header and parses it into IAuthObject object.
 * If profileId is not provided, or couldn't be parsed it throws 418 error.
 */
export const profileMiddleware = () =>
  function profileMiddlewareFn(
    req: RequestWithProfile,
    res: Response,
    next: NextFunction,
  ): void | Response {
    const profileHeader = req.header('X-Profile-ID');
    const profileId = checkHeaderAndReturnProfileId(profileHeader);

    req.profileId = profileId;

    return next();
  };
