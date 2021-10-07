import * as mailer from '../../src/core/mailer/mailer';

export const mockMailer = (): jest.SpyInstance => {
  return jest.spyOn(mailer, 'connectAndSendEmail').mockResolvedValue(undefined);
};
